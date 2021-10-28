import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { NetworkEditorController } from '../network-editor/controller';
import theme from '../../theme';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Cytoscape from 'cytoscape';
import _ from 'underscore';
import * as XLSX from "xlsx";
import { mean, std } from 'mathjs';
import * as gaussian from 'gaussian';
import { Chart } from 'react-chartjs-2';
import { DropzoneArea } from 'material-ui-dropzone';
import { Grid, Paper, IconButton } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead , TableRow } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const STEPS = [
  {
    label: "Enter Your Edge Table",
  },
  {
    label: "Enter Your Node Table",
  },
];

class ExcelImportSubWizard extends React.Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.state = {
      step: 1,
      edgeFile: null,
      nodeFile: null,
      edgeData: null,
      nodeData: null,
      networkName: null,
      error: null,
    };

    this.handleEdgeFileChange = this.handleEdgeFileChange.bind(this);
    this.handleNodeFileChange = this.handleNodeFileChange.bind(this);
    this.handleEdgeFileDelete = this.handleEdgeFileDelete.bind(this);
    this.handleNodeFileDelete = this.handleNodeFileDelete.bind(this);
  }

  componentDidMount() {
    const { setSteps, setCurrentStep } = this.props.wizardCallbacks;
    setSteps({ steps: STEPS });
    setCurrentStep(this.state);
    
    this.updateButtons(this.state);
  }

  componentDidUpdate() {
    const { step, edgeData, nodeData } = this.state;

    // Create preview
    if (step === 1 || step === 2) {
      const data = step === 1 ? edgeData : nodeData;
      const firstRow = data && data.length > 0 ? data[0] : null;

      if (firstRow) {
        const elements = step === 1 ? this.createCyElements([firstRow])/* EDGE Preview */ : [];
        const keys = Object.keys(firstRow);
        let node1IdAttr, node2IdAttr;

        if (keys.length > 0) {
          node1IdAttr = keys[0];

          if (step === 1) {/* EDGE Preview */
            if (keys.length > 1)
              node2IdAttr = keys[1];
          } else if (step === 2) {/* NODE Preview */
            node1IdAttr = keys[0];
            var id = firstRow[node1IdAttr]; // Node id is always the first column

            if (id) {
              const n = { group: 'nodes', data: { id: id } };
              keys.forEach((k, idx) => {
                if (idx > 0)
                  n.data[k] = firstRow[k];
              });
              elements.push(n);
            }
          }
        }

        if (elements && elements.length > 0)
          this.showCyPreview(elements, data, node1IdAttr, node2IdAttr);
      }
    }
  }

  componentWillUnmount() {
    this.removePoppers();
  }

  updateButtons(state) {
    const { step, edgeData, nodeData } = state;
    const { setButtonState } = this.props.wizardCallbacks;

    // Note: backButton is always visible by default
    if (step === 1) {
      if (!edgeData || edgeData.length === 0) {
        setButtonState({ nextButton: 'disabled', cancelButton: 'hidden', finishButton: 'hidden' });
      } else {
        setButtonState({ nextButton: 'enabled', cancelButton: 'hidden', finishButton: 'enabled' });
      }
    } else if (step === 2) {
      if (!nodeData || nodeData.length === 0) {
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'enabled' });
      } else {
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'enabled' });
      }
    }
  }

  handleEdgeFileChange(files) {
    const f = files && files.length > 0 ? files[0] : null;

    if (f) {
      const fileName = f.name;

      this.readFile(f, (json) => {
        this.setState({ edgeFile: f, networkName: fileName, edgeData: json });
        this.updateButtons({ ...this.state, json });
      });
    }
  }

  handleNodeFileChange(files) {
    const f = files && files.length > 0 ? files[0] : null;

    if (f) {
      this.readFile(f, (json) => {
        this.setState({ nodeFile: f, nodeData: json });
        this.updateButtons({ ...this.state, json });
      });
    }
  }

  handleEdgeFileDelete() {
      this.setState({ edgeFile: null, edgeData: null });
      this.updateButtons({ ...this.state, edgeFile: null, edgeData: null });
  }

  handleNodeFileDelete() {
    this.setState({ nodeFile: null, nodeData: null });
    this.updateButtons({ ...this.state, nodeFile: null, nodeData: null});
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
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_row_object_array(ws);

      /* Update state */
      if (handleData)
        handleData(data);
    };

    reader.readAsBinaryString(file);
  }

  async handleFinish() {
    const { networkName, edgeData, nodeData } = this.state;
    const elements = this.createCyElements(edgeData, nodeData);

    if (elements && elements.length > 0) {
      try {
        this.controller.setNetwork(elements, { name: networkName });
      } catch (e) {
        console.log(e); // TODO Show error to user
      }

      let edgeColorAttr;
      let nodeColorAttr;

      // TODO: quick style

      if (edgeColorAttr)
        this.controller.setColorLinearMapping("edge", "line-color", edgeColorAttr, ['#9ebcda', '#8856a7']);
      if (nodeColorAttr)
        this.controller.setColorLinearMapping("node", "background-color", nodeColorAttr, ['#ece2f0', '#1c9099']);

      // TODO Apply preferred layout
      this.controller.applyLayout(this.controller.layoutOptions.fcose);
    }

    this.props.wizardCallbacks.closeWizard();
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
            // TODO Use first and second columns as source/target? Or the column names?
            var source = row[keys[0]];
            var target = row[keys[1]];

            if (!source || !target)
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
      if (nodeData) {
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

  showCyPreview(elements, data, node1IdAttr, node2IdAttr) {
    if (elements && elements.length > 0) {
      if (this.cy)
        this.cy.destroy();

      const style = [
        {
          selector: 'node',
          style: {
            'background-color': '#0571b0',
            'label': 'data(id)',
            'font-size': '12px',
            'text-halign': 'center',
            'text-valign': 'center',
            'text-outline-width': 2,
            'text-outline-color': '#0571b0',
            'color': '#fff',
            'overlay-opacity': 0,
          }
        },
        {
          selector: 'edge',
          style: {
            'line-color': '#a6cadf',
            'width': '6px',
            'overlay-opacity': 0,
          }
        },
        {
          selector: 'core',
          style: {
            'active-bg-opacity': 0,
          }
        },
      ];

      this.cy = Cytoscape({
        container: document.getElementById('cy-import-preview'),
        elements: elements,
        style: style,
        layout: { name: 'grid' },
      });

      // Create a popper on the first (or single) node
      if (node1IdAttr) {
        this.createNodePopper(this.cy, this.cy.nodes()[0], node1IdAttr);

        if (!node2IdAttr) // Create a "data" popper on the node
          this.createDataPopper(this.cy, this.cy.nodes()[0], data);
      }
      // // Create a popper on the second node
      if (node2IdAttr)
        this.createNodePopper(this.cy, this.cy.nodes()[1], node2IdAttr);
      // Create a "data" popper on the edge
      if (this.cy.edges().length > 0)
        this.createDataPopper(this.cy, this.cy.edges()[0], data);
    }
  }

  createNodePopper(cy, node, attr) {
    if (!node)
      return;

    node.popper({
      content: () => {
        const div = document.createElement('div');
        div.classList.add('preview-cy-popper');
        div.classList.add('preview-cy-popper-node');
        document.body.appendChild(div);
        
        const comp = (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Grid
              container
              direction="column"
              alignItems="center"
            >
              <div className="popper-content">{attr}</div>
              <div className="arrow-down" />
            </Grid>
          </ThemeProvider>
        );
        ReactDOM.render(comp, div);

        return div;
      },
      popper: {
        placement: 'top',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 200],
            },
          },
        ],
      },
    });
  }

  createDataPopper(cy, el, allData) {
    const data = el.data();
    const dataKeys = Object.keys(data);
    const keys = [];
    const chartKeys = [];
    
    for (const k of dataKeys) {
      if (k != "id" && k != "source" && k != "target") {
        keys.push(k);

        if (typeof(data[k]) === 'number')
          chartKeys.push(k);
      }
    }

    if (keys.length === 0)
      return;

    el.popper({
      content: () => {
        const div = document.createElement('div');
        div.classList.add('preview-cy-popper');
        div.classList.add('preview-cy-popper-data');
        document.body.appendChild(div);

        const comp = (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Grid container direction="column" alignItems="center">
              <div className="arrow-up" />
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
                            <TableCell key={k} style={{textAlign: 'center'}}>
                              {chartKeys.includes(k) ?
                                <canvas
                                  id={`chart-${k.replaceAll(' ', '_')}`}
                                  style={{width: '128px', height: '64px'}}
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
            </Grid>
          </ThemeProvider>
        );

        ReactDOM.render(comp, div, () => {
          for (const k of chartKeys)
            this.createPopperChart(k, data, allData);
        });

        return div;
      },
    });
  }

  /** Create charts for numeric attributes. */ 
  createPopperChart(k, elementData, allData) {
      // Get the column data
      const colData = [];

      for (const row of allData)
        colData.push(row[k]);

      // Normal distribution - sort values
      colData.sort((a, b) => a - b);
      const m = mean(colData);
      const sd = std(colData); // The standard deviation
      const dist = gaussian(m, sd);

      const lowerBound = colData[0];
      const upperBound = colData[colData.length - 1];
      const min = lowerBound - 2 * sd;
      const max = upperBound + 2 * sd;
      const unit = (max - min) / 100;
      
      const xSeries = _.range(min, max, unit);
      const ySeries = [];
      const chartData = [];
      
      for (const x of xSeries) {
        const y = dist.pdf(x);
        ySeries.push(y);
        chartData.push({ x: x, y: y });
      }

      // We need the labels!
      const labels = xSeries.map((i) => String(i));

      // Customize options -- show the current value as a chart annotation
      // (see: https://www.chartjs.org/chartjs-plugin-annotation/guide/types/line.html)
      const myVal = elementData[k]; // This element's value

      const options = { ...chartOptions };
      const myValueLine = options.plugins.annotation.annotations.myValueLine;
      myValueLine['xMin'] = myVal;
      myValueLine['xMax'] = myVal;
      myValueLine['yMin'] = Math.min(ySeries);
      myValueLine['yMax'] = Math.max(ySeries);
      myValueLine.label['content'] = myVal;

      // Create the chart
      const ctx = document.getElementById(`chart-${k.replaceAll(' ', '_')}`).getContext('2d');
      new Chart(ctx, {
          data: {
            labels: labels,
            datasets: [
              {
                type: 'line',
                label: 'All Values of ' + k,
                data: chartData,
                borderWidth: 1,
                borderColor: theme.palette.text.primary,
                fill: true,
                backgroundColor: theme.palette.divider,
                tension: 0.3,
              },
            ]
          },
          options: options,
      });
  }

  removePoppers() {
    const poppers = document.getElementsByClassName('preview-cy-popper');
    
     while (poppers.length > 0) {
      poppers[0].parentNode.removeChild(poppers[0]);
    }
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.setState({ step });
    
    this.props.wizardCallbacks.setCurrentStep({ step });
    this.updateButtons({ ...this.state, step });
    
    return step;
  }

  handleContinue() {
    this.updateStep((step) => step + 1);
  }

  handleBack() {
    const step = this.updateStep((step) => step - 1);
    
    if (step === 0)
      this.props.wizardCallbacks.returnToSelector();
  }

  render() {
    this.removePoppers();

    return (
      <>
        <div>
          { this.renderContent() }
        </div>
      </>
    );
  }

  renderContent() {
    const { step } = this.state;

    if (step === 1) {
      return this.renderTableUpload(this.state.edgeFile, this.handleEdgeFileChange, this.handleEdgeFileDelete);
    } else if (step === 2) {
      return this.renderTableUpload(this.state.nodeFile, this.handleNodeFileChange, this.handleNodeFileDelete);
    }
  }
  
  renderTableUpload(initialFile, onChange, onDelete) {
    const { step, edgeData, nodeData } = this.state;

    const group = step === 1 ? "Edge" : "Node";
    const data = step === 1 ? edgeData : nodeData;
    const rowCount = data ? data.length : 0;

    return (
      <div className={`excel-import ${group}-import`}>
        <DropzoneArea
          acceptedFiles={['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain']}
          filesLimit={1}
          initialFiles={initialFile ? [initialFile] : []}
          onChange={files => onChange(files, onChange)}
          showPreviews={false}
          showPreviewsInDropzone={false}
        />
        {initialFile && (
          <>
            <footer style={{textAlign: 'right'}}>
              <IconButton
                size="small"
                onClick={() => onDelete()}
              >
                <HighlightOffIcon />
              </IconButton>
              <b>{initialFile.name}</b> ({rowCount} row{rowCount > 1 ? "s" : ""})
            </footer>
          </>
        )}
        {data && (
          <Paper variant="outlined" className="import-preview">
            <Grid
              container
              direction="column"
              alignItems="center"
            >
              <h4 style={{width: '100%', textAlign: 'left', marginTop: '5px', marginBottom: '40px', padding: '0 15px'}}>
                PREVIEW &#8212; Your First {group}:
              </h4>
              <div id="cy-import-preview" />
            </Grid>
          </Paper>
        )}
      </div>
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
  controller: PropTypes.instanceOf(NetworkEditorController),
  wizardCallbacks: PropTypes.any,
};

export default ExcelImportSubWizard;