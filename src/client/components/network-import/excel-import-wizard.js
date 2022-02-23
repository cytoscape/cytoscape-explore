import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import _ from 'lodash';
import * as XLSX from "xlsx";
import { mean, std } from 'mathjs';
import * as gaussian from 'gaussian';

import theme from '../../theme';

import { Chart } from 'react-chartjs-2';
import { DropzoneArea } from 'material-ui-dropzone';
import { Fade, Slide } from '@material-ui/core';
import { Grid, Paper, IconButton, Tooltip } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead , TableRow } from '@material-ui/core';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@material-ui/core';

import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const STEPS = [
  {
    label: "Enter Your Edge Table",
  },
  {
    label: "Preview Edge Data",
  },
  {
    label: "Enter Your Node Table",
    optional: true,
  },
  {
    label: "Preview Node Data",
  },
];

const EDGE = "Edge";
const NODE = "Node";

const NODE_COLOR = "#0571B0";
const EDGE_COLOR = "#A6CADF";
const LABEL_COLOR = theme.palette.text.primary;

let previewCharts = []; // Charts that will need to be destroyed before each render()

class ExcelImportSubWizard extends React.Component {

  constructor(props) {
    super(props);

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.state = {
      step: 1,
      hasNodeFile: null,
      edgeFile: null,
      nodeFile: null,
      edgeData: null,
      nodeData: null,
      networkName: null,
      node1IdAttr: null,
      node2IdAttr: null,
      nodeIdAttr: null,
      edgePreviewData: null,
      nodePreviewData: null,
      edgeChartConfigs: null, // the attribute name is the key
      nodeChartConfigs: null, // the attribute name is the key
      error: null,
    };

    this.handleEdgeFileChange = this.handleEdgeFileChange.bind(this);
    this.handleNodeFileChange = this.handleNodeFileChange.bind(this);
    this.handleEdgeFileDelete = this.handleEdgeFileDelete.bind(this);
    this.handleNodeFileDelete = this.handleNodeFileDelete.bind(this);

    this.autoContinue = false;
  }

  componentDidMount() {
    const { setSteps, setCurrentStep } = this.props.wizardCallbacks;
    setSteps({ steps: STEPS });
    setCurrentStep(this.state);

    this.updateCanContinue(this.state);
  }

  componentWillUnmount() {
    this.destroyPreviewCharts();
  }

  componentDidUpdate() {
    const { step, edgeChartConfigs, nodeChartConfigs } = this.state;

    // Recreate preview charts
    if (step === 2 || step === 4) {
      const chartConfigs = step === 2 ? edgeChartConfigs : nodeChartConfigs;

      if (chartConfigs)
        this.createPreviewCharts(chartConfigs);
    }

    if (this.autoContinue) {
      this.autoContinue = false;

      // Delay the auto-continue just enough to show that the excel file has been added
      setTimeout(() => this.handleContinue(), 250);
    }
  }

  handleEdgeFileChange(files) {
    const f = files && files.length > 0 ? files[0] : null;

    if (f) {
      const fileName = f.name;

      this.readFile(f, (json) => {
        // EDGE Preview data
        const firstRow = json && json.length > 0 ? json[0] : null;
        const edgePreviewData = this.createCyElements([firstRow]);

        const edgeChartConfigs = edgePreviewData && edgePreviewData.length > 1
            ? this.createPreviewChartConfigs(edgePreviewData[edgePreviewData.length - 1], json)
            : null;

        let node1IdAttr, node2IdAttr;
  
        if (firstRow) {
          const keys = Object.keys(firstRow);
  
          if (keys.length > 0) {
            node1IdAttr = keys[0];
  
            if (keys.length > 1)
              node2IdAttr = keys[1];
          }
        }

        this.setState({ edgeFile: f, networkName: fileName, edgeData: json, node1IdAttr, node2IdAttr, edgePreviewData, edgeChartConfigs });
        this.updateCanContinue({ ...this.state, json });

        this.autoContinue = json != null && json.length > 0; // Don't call this.handleContinue(), otherwise the "next step" animation will be messed up!
      });
    }
  }

  handleNodeFileChange(files) {
    const f = files && files.length > 0 ? files[0] : null;

    if (f) {
      this.readFile(f, (json) => {
        // NODE Preview data
        const firstRow = json && json.length > 0 ? json[0] : null;
        let nodeIdAttr;
        let nodePreviewData = [];
        let nodeChartConfigs;

        if (firstRow) {
          const keys = Object.keys(firstRow);
          
          if (keys.length > 0) {
            nodeIdAttr = keys[0]; // Node id is always the first column
            var id = firstRow[nodeIdAttr]; 

            if (id) {
              const n = { group: 'nodes', data: { id: id } };
              keys.forEach((k, idx) => {
                if (idx > 0)
                  n.data[k] = firstRow[k];
              });
              nodePreviewData.push(n);

              nodeChartConfigs = this.createPreviewChartConfigs(n, json);
            }
          }
        }

        this.setState({ nodeFile: f, nodeData: json, nodeIdAttr, nodePreviewData, nodeChartConfigs });
        this.updateCanContinue({ ...this.state, json });

        this.autoContinue = json != null && json.length > 0; // Don't call this.handleContinue(), otherwise the "next step" animation will be messed up!
      });
    }
  }

  handleEdgeFileDelete() {
      this.setState({ edgeFile: null, edgeData: null, node1IdAttr: null, node2IdAttr: null, edgePreviewData: null, edgeChartConfigs: null });
      this.updateCanContinue({ ...this.state, edgeFile: null, edgeData: null });
  }

  handleNodeFileDelete() {
    this.setState({ nodeFile: null, nodeData: null, nodeIdAttr: null, nodePreviewData: null, nodeChartConfigs: null });
    this.updateCanContinue({ ...this.state, nodeFile: null, nodeData: null});
  }

  readFile(file, handleData) {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      // evt = on_file_select event
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert sheet to json */
      const data = XLSX.utils.sheet_to_json(ws, { header: 0, defval: "" });

      /* Update state */
      if (handleData)
        handleData(data);
    };

    reader.readAsBinaryString(file);
  }

  async handleFinish() {
    const { networkName, edgeData, nodeData, hasNodeFile } = this.state;

    const data = { name: networkName };
    const elements = this.createCyElements(edgeData, (hasNodeFile ? nodeData : null));

    // Create another Cytoscape instance, just so we can apply a layout
    const cy = new Cytoscape({ styleEnabled: true });
    cy.data(data);
    cy.add(elements);

    // Apply grid layout
    cy.layout({ name: 'grid', avoidOverlap: true }).run();
    
    // Get the json data that should now include the new node positions
    const json = cy.json(true);
    cy.destroy(); // We can now destroy this Cytoscape instance

    // Ask the server to import the json data
    const res = await fetch( `/api/document/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    });

    // Navigate to the new document
    const urls = await res.json();
    location.href = `/document/${urls.id}/${urls.secret}`;
  }

  createCyElements(edgeData, nodeData) {
    const elements = [];

    try {
      const nodes = {};
      const edges = {};

      // First, process all source/target nodes from edge data and the edge attributes
      if (edgeData) {
        for (const row of edgeData) {
          const keys = Object.keys(row);

          if (keys.length > 1) {
            // Using first/second columns as source/target
            var source = row[keys[0]];
            var target = row[keys[1]];

            if (source == null || target == null)
              continue;

            nodes[source] = { group: 'nodes', data: { id: source, name: source } };
            nodes[target] = { group: 'nodes', data: { id: target, name: target } };  

            const edgeId = source + '-' + target;
            const edgeAtrrs = { group: 'edges', data: { id: edgeId, source: source, target: target } };
            edges[edgeId] = edgeAtrrs;

            if (keys.length > 2) {
              const data = edgeAtrrs.data;

              keys.forEach((k, idx) => {
                if (idx > 1)
                  data[k] = row[k];
              });
            }
          }
        }
      }
      // Then, process the optional node attributes
      if (nodeData && nodeData.length > 0) {
        for (const row of nodeData) {
          const keys = Object.keys(row);

          if (keys.length > 1) {
            var id = row[keys[0]]; // Node id is always the first column

            if (id) {
              const n = nodes[id];

              if (n) {
                const data = n.data;

                keys.forEach((k, idx) => {
                  if (idx > 0)
                    data[k] = row[k];
                });
              }
            }
          }
        }
      }

      for (const id in nodes)
        elements.push(nodes[id]);
      for (const id in edges)
        elements.push(edges[id]);
    } catch (e) {
      console.log(e); // TODO Show error to user
    }

    return elements;
  }

  /**
   * Create a chart data object for each numeric attribute.
   */ 
  createPreviewChartConfigs(obj, allData) {
    const chartConfigs = {};

    const data = obj.data;
    const keys = Object.keys(data);
    const chartKeys = keys.filter(k => this.isPreviewChartKey(k, data));

    for (const k of chartKeys) {
      // Get the column data
      const colValues = [];

      for (const row of allData) {
        if (typeof row[k] === 'number')
          colValues.push(row[k]);
      }

      if (colValues.length === 0)
        continue;

      // Normal distribution - sort values
      colValues.sort((a, b) => a - b);
      
      const sd = std(colValues); // The standard deviation

      if (sd === 0)
        continue;

      const lowerBound = colValues[0];
      const upperBound = colValues[colValues.length - 1];
      const min = lowerBound - 2 * sd;
      const max = upperBound + 2 * sd;
      const unit = (max - min) / 100;
      
      const xSeries = _.range(min, max, unit);
      const ySeries = [];
      const plotData = [];
      
      const m = mean(colValues);
      const dist = gaussian(m, sd);

      for (const x of xSeries) {
        const y = dist.pdf(x);
        ySeries.push(y);
        plotData.push({ x: x, y: y });
      }

      const val = data[k]; // This element's value

      // We need the labels!
      const labels = xSeries.map((i) => String(i));

      // Customize options -- show the current value as a chart annotation
      // (see: https://www.chartjs.org/chartjs-plugin-annotation/guide/types/line.html)
      const options = _.cloneDeep(chartOptions);
      const myValueLine = options.plugins.annotation.annotations.myValueLine;
      myValueLine['xMin'] = val;
      myValueLine['xMax'] = val;
      myValueLine['yMin'] = Math.min(ySeries);
      myValueLine['yMax'] = Math.max(ySeries);
      myValueLine.label['content'] = '' + val;

      const cfg = {
        data: {
          labels: labels,
          datasets: [
            {
              type: 'line',
              label: 'All Values of ' + k,
              data: plotData,
              borderWidth: 1,
              borderColor: theme.palette.text.primary,
              fill: true,
              backgroundColor: theme.palette.divider,
              tension: 0.3,
            },
          ]
        },
        options: options,
      };
      chartConfigs[k] = cfg;
    }

    return chartConfigs;
  }
 
  createPreviewCharts(chartConfigs) {
    for (const [k, cfg] of Object.entries(chartConfigs)) {
      // Create the chart
      const ctx = document.getElementById(`chart-${k.replaceAll(' ', '_')}`).getContext('2d');
      const chart = new Chart(ctx, cfg);
      previewCharts.push(chart);
    }
  }

  destroyPreviewCharts() {
    for (const c of previewCharts)
      c.destroy();
    
      previewCharts = [];
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.setState({ step });
    
    this.props.wizardCallbacks.setCurrentStep({ step });
    this.updateCanContinue({ ...this.state, step });
    
    return step;
  }

  updateCanContinue(state) {
    const { step, edgeData, nodeData, hasNodeFile } = state;
    const { setCanContinue } = this.props.wizardCallbacks;

    let b = false;

    if (step === 1) {
      b = edgeData && edgeData.length > 0;
    } else if (step === 2) {
      b =  true;
    } else if (step === 3) {
      if (hasNodeFile == null)
        b =  false;
      else if (hasNodeFile === false)
        b =  true;
      else if (hasNodeFile === true)
        b =  nodeData && nodeData.length > 0;
    } else if (step === 4) {
      b =  true;
    }

    setCanContinue({ canContinue: b });
  }

  handleContinue() {
    this.updateStep((step) => step + 1);
  }

  handleBack() {
    const step = this.updateStep((step) => step - 1);
    
    if (step === 0)
      this.props.wizardCallbacks.returnToSelector();
  }

  handleHasNodeFileRadio(evt) {
    const hasNodeFile = evt.target.value === 'true';
    this.setState({ hasNodeFile });
    this.updateCanContinue({ ...this.state, hasNodeFile });

    const steps = hasNodeFile ? STEPS : STEPS.slice(0, -1);
    this.props.wizardCallbacks.setSteps({ steps });
  }

  render() {
    this.destroyPreviewCharts();

    return (
      <div>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    const { step, edgeFile, nodeFile, edgeData, nodeData } = this.state;
    const { edgePreviewData, nodePreviewData, edgeChartConfigs, nodeChartConfigs } = this.state;

    switch (step) {
      case 1:
        return this.renderTableUpload({
          group: "Edge",
          initialFile: edgeFile,
          onChange: this.handleEdgeFileChange,
          onDelete: this.handleEdgeFileDelete,
        });
      case 2:
        return this.renderPreview({
          group: "Edge",
          initialFile: edgeFile,
          data: edgeData,
          previewData: edgePreviewData,
          chartConfigs: edgeChartConfigs,
      });
      case 3:
        return this.renderTableUpload({
          group: "Node",
          initialFile: nodeFile, 
          onChange: this.handleNodeFileChange,
          onDelete: this.handleNodeFileDelete,
        });
      case 4:
        return this.renderPreview({
          group: "Node",
          initialFile: nodeFile,
          data: nodeData,
          previewData: nodePreviewData,
          chartConfigs: nodeChartConfigs,
        });
    }
  }
  
  renderTableUpload({ group, initialFile, onChange, onDelete }) {
    const { hasNodeFile } = this.state;

    return (
      <div className={`excel-import ${group}-import`}>
        { group === NODE && (
          <FormControl component="fieldset" style={{ marginBottom: theme.spacing(2) }}>
            <FormLabel component="legend">Do you have a file for node attributes?</FormLabel>
            <RadioGroup name="has-node-file" value={'' + hasNodeFile} onChange={(evt) => this.handleHasNodeFileRadio(evt)}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <FormControlLabel label="Yes" value="true" control={<Radio />} />
                </Grid>
                <Grid item>
                  <FormControlLabel label="No" value="false" control={<Radio />} />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        )}
        <div style={{ minHeight: 256 }}>
          { group === EDGE && (
            this.renderDropzoneArea({ onChange })
          )}
          { group === NODE && hasNodeFile != null && (
            <Slide in={hasNodeFile} direction="up">
              { this.renderDropzoneArea({ onChange }) }
            </Slide>
          )}
        </div>
        { initialFile && (group === EDGE || hasNodeFile) && (
          <Fade in={initialFile != null} timeout={{ enter: 750 }}>
            <footer style={{ marginTop: 4 }}>
              <Tooltip title="Remove file and try again">
                <IconButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => onDelete()}
                >
                  <HighlightOffIcon />
                </IconButton>
              </Tooltip>
              <b>{initialFile.name}</b>
            </footer>
          </Fade>
        )}
      </div>
    );
  }

  renderDropzoneArea({ onChange }) {
    return (
      <div className="dropzone-background">
        <DropzoneArea
          acceptedFiles={['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain']}
          filesLimit={1}
          // initialFiles={initialFile ? [initialFile] : []}
          onChange={files => onChange(files, onChange)}
          showPreviews={false}
          showPreviewsInDropzone={false}
        />
      </div>
    );
  }

  renderPreview({ group, data, previewData, chartConfigs }) {
    const { node1IdAttr, node2IdAttr, nodeIdAttr } = this.state;

    const rowCount = data ? data.length : 0;

    const isEdge = group === EDGE && previewData.length === 3;
    const isLoop = group === EDGE && previewData.length === 2;
    const isNode = group === NODE && previewData.length === 1;

    let previewImg, elData;

    if (isEdge) {
      // Regular edge preview (2 nodes)
      previewImg = this.edgePreviewImg();
      elData = previewData[2];
    } else if (isLoop) {
      // 'Loop' edge preview (1 node)
      previewImg = this.loopPreviewImg();
      elData = previewData[1];
    } else if (isNode) {
      // Ndge preview (1 node)
      previewImg = this.nodePreviewImg();
      elData = previewData[0];
    }

    let keys = elData ? Object.keys(elData.data) : [];
    keys = keys.filter(k => this.isPreviewKey(k));

    return (
      <div className={`excel-import ${group}-import`}>
        { previewImg && (
          <div className="import-preview">
            <Grid
              container
              direction="column"
              alignItems="center"
            >
              <h4 style={{ width: '100%', textAlign: 'left', marginTop: '5px', padding: '0 15px' }}>
                First Row:
                <footer style={{ fontWeight: 'normal', fontSize: 'smaller' }}>( Total: {rowCount} row{rowCount > 1 ? "s" : ""} )</footer>
              </h4>
              { isLoop && keys.length > 0 && (
                this.renderDataTable(elData, keys, chartConfigs, "down", { marginBottom: -6 }, { marginLeft: -28 })
              )}
              { isEdge && (
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="flex-end"
                >
                  <Grid item xs>
                    { this.renderNodeIdAttrLabel(node1IdAttr, "down", { marginLeft: 22, marginBottom: -2 }) }
                  </Grid>
                  <Grid item xs>
                    { this.renderNodeIdAttrLabel(node2IdAttr, "down", { marginLeft: -22, marginBottom: -2 }) }
                  </Grid>
                </Grid>
              )}
              { isNode && (
                this.renderNodeIdAttrLabel(nodeIdAttr, "down", { marginBottom: -2 })
              )}
              <div id="import-preview-image">
                { previewImg }
              </div>
              { isLoop && (
                this.renderNodeIdAttrLabel(node1IdAttr + " | " + node2IdAttr, "up", { marginTop: -4 })
              )}
              { (isEdge || isNode) && keys.length > 0 && (
                this.renderDataTable(elData, keys, chartConfigs, "up", { marginTop: (isEdge? -20 : -10) })
              )}
            </Grid>
          </div>
        )}
      </div>
    );
  }

  renderNodeIdAttrLabel(nodeIdAttr, arrowDirection, gridStyle) {
    return (
      <Grid
        className="preview-popper-node"
        container
        direction="column"
        alignItems="center"
        style={gridStyle}
      >
        { arrowDirection === "up" && (
          <div className="arrow-up" />
        )}
        <div className="popper-content">{ nodeIdAttr }</div>
        { arrowDirection === "down" && (
          <div className="arrow-down" />
        )}
      </Grid>
    );
  }

  renderDataTable(obj, keys, chartConfigs, arrowDirection, gridStyle, arrowStyle) {
    const data = obj.data;

    return (
      <Grid 
        container
        className="preview-popper-data"
        direction="column" 
        alignItems="center"
        style={gridStyle}
      >
        {arrowDirection === "up" && (
          <div className="arrow-up" style={arrowStyle} />
        )}
        <div className="popper-content">
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {keys && keys.map((k) => (
                    <TableCell key={k}>{k}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {keys && keys.map((k) => (
                      <TableCell key={k} style={{ textAlign: 'center' }}>
                        {chartConfigs && chartConfigs[k] != null ?
                          <canvas
                            id={`chart-${k.replaceAll(' ', '_')}`}
                            style={{ width: '128px', height: '64px' }}
                          />
                        :
                          <>{ data[k] + '' }</>
                        }
                      </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        {arrowDirection === "down" && (
          <div className="arrow-down" style={arrowStyle} />
        )}
      </Grid>
    );
  }

  isPreviewKey(k) {
    return k && k != "id" && k != "source" && k != "target";
  }

  isPreviewChartKey(k, data) {
    return this.isPreviewKey(k) && data && typeof(data[k]) === 'number';
  }
  
  edgePreviewImg() {
    const { edgePreviewData } = this.state;
    const node1Label = edgePreviewData[0].data.id;
    const node2Label = edgePreviewData[1].data.id;

    return (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="512" height="64" viewBox="0, 0, 512, 64">
        <path id="preview-edge" d="M140.5,40.5 L372.5,40.5" fillOpacity="0" strokeWidth="8" strokeLinecap="round" stroke={EDGE_COLOR} />
        <path id="preview-node-2" d="M372,64 C358.745,64 348,53.255 348,40 C348,26.745 358.745,16 372,16 C385.255,16 396,26.745 396,40 C396,53.255 385.255,64 372,64 z" fill={NODE_COLOR} />
        <path id="preview-node-1" d="M140,64 C126.745,64 116,53.255 116,40 C116,26.745 126.745,16 140,16 C153.255,16 164,26.745 164,40 C164,53.255 153.255,64 140,64 z" fill={NODE_COLOR} />
        <text id="preview-node-label-2" x="372" y="10" textAnchor="middle" fontFamily="Helvetica" fontSize="14" fill={LABEL_COLOR}>{ node2Label }</text>
        <text id="preview-node-label-1" x="140" y="10" textAnchor="middle" fontFamily="Helvetica" fontSize="14" fill={LABEL_COLOR}>{ node1Label }</text>
      </svg>
    );
  }

  loopPreviewImg() {
    const { edgePreviewData } = this.state;
    const node1Label = edgePreviewData[0].data.id;

    return (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="512" height="108" viewBox="0, 0, 512, 108">
        <path id="preview-edge" d="M256.249,65.842 C257.136,32.68 256.484,4.5 240.484,4.5 C228.484,4.5 200.249,29.842 194.249,45.842 C182.477,77.233 256.249,67.842 256.249,67.842" fillOpacity="0" strokeWidth="8" strokeLinecap="round" stroke={EDGE_COLOR} />
        <path id="preview-node-1" d="M256,92 C242.745,92 232,81.255 232,68 C232,54.745 242.745,44 256,44 C269.255,44 280,54.745 280,68 C280,81.255 269.255,92 256,92 z" fill={NODE_COLOR} />
        <text id="preview-node-label-1" x="256" y="108" textAnchor="middle" fontFamily="Helvetica" fontSize="14" fill={LABEL_COLOR}>{ node1Label }</text>
      </svg>
    );
  }

  nodePreviewImg() {
    const { nodePreviewData } = this.state;
    const nodeLabel = nodePreviewData[0].data.id;

    return (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="512" height="64" viewBox="0, 0, 512, 64">
        <path id="preview-node" d="M256,64 C242.745,64 232,53.255 232,40 C232,26.745 242.745,16 256,16 C269.255,16 280,26.745 280,40 C280,53.255 269.255,64 256,64 z" fill={NODE_COLOR} />
        <text id="preview-node-label" x="256" y="10" textAnchor="middle" fontFamily="Helvetica" fontSize="14" fill={LABEL_COLOR}>{ nodeLabel }</text>
      </svg>
    );
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'linear',
      ticks: {
        display: false,
      },
      grid: {
        display: false,
        drawBorder: false,
      },
    },
    y: {
      ticks: {
        display: false,
      },
      grid: {
        display: false,
        drawBorder: false,
      }
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  layout: {
    padding: {
      bottom: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
      callbacks: {
        title: function() { },
        label: function(context) { return context.label; },
      },
    },
    annotation: {
      annotations: {
        myValueLine: {
          type: 'line',
          borderWidth: 2,
          borderColor: theme.palette.text.primary,
          borderDash: [2, 2],
          label: {
            enabled: true,
            position: 'end',
            yAdjust: 18,
            yPadding: 0,
            color: theme.palette.text.primary,
            backgroundColor: 'rgba(255, 255, 255, 0.0)',
            // font: {
            //   weight: 'plain',
            // },
          },
        }
      }
    },
  },
};

ExcelImportSubWizard.propTypes = {
  wizardCallbacks: PropTypes.any,
};

export default ExcelImportSubWizard;