import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import theme from '../../theme';
import { Chart } from 'react-chartjs-2';
import { mean } from 'mathjs';
import { Grid, Paper, Box, Tooltip, Button, IconButton } from '@material-ui/core';
import { FormControl, Select } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import SortByAlphaIcon from '@material-ui/icons/SortByAlpha';

const VIEWS = [ 'Table', 'Histogram' ];

const GROUPS = [
  {
    id: 'node',
    label: "Node",
  },
  {
    id: 'edge',
    label: "Edge",
  },
  {
    id: '',
    label: "Network",
  },
];

const HIDDEN_ATTRS = [ 'id', 'SUID', 'shared_name', 'shared_interaction', 'source', 'target', 'selected' ];

let lastChart; // Chart that will need to be destroyed before each render()

export class DataPanel extends Component {

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    
    const view = VIEWS[0];
    const group = GROUPS[0];
    const attributes = this.getAllAttributes(group.id);
    const numericAttributes = this.filterNumericAttributes(attributes, group);
    const selectedAttributes = this.filterDefaultAttributes(attributes);
    const selectedNumericAttribute = numericAttributes.length > 0 ? numericAttributes[0] : null;

    this.state = {
      view,
      group,
      attributes,
      numericAttributes,
      selectedAttributes, // For multiple selection
      selectedNumericAttribute,  // For single selection
      chartConfig: null,
    };
  }

  componentDidUpdate() {
    const { view, chartConfig } = this.state;

    if (view === 'Histogram' && chartConfig) {
      // Destroy previous chart
      if (lastChart) {
        lastChart.destroy();
        lastChart = null;
      }

      // Recreate chart
      const ctx = document.getElementById('attribute-chart').getContext('2d');
      const chart = new Chart(ctx, chartConfig);
      lastChart = chart;
    }
  }

  showAllAttributes() {
    const { group } = this.state;
    const selectedAttributes = this.getAllAttributes(group.id);
    this.setState({ selectedAttributes });
  }

  hideAllAttributes() {
    this.setState({ selectedAttributes: [] });
  }

  sortAttributes() {
    const { attributes, selectedAttributes } = this.state;
    
    attributes.sort((a, b) => a.localeCompare(b));
    selectedAttributes.sort((a, b) => a.localeCompare(b));

    this.setState({ attributes, selectedAttributes });
  }

  handleViewChange(event) {
    const { group, numericAttributes } = this.state;
    const view = VIEWS[event.target.value];

    let selectedNumericAttribute, chartConfig;

    if (view === 'Histogram') {
      selectedNumericAttribute = numericAttributes.length > 0 ? numericAttributes[0] : null;
      
      if (selectedNumericAttribute) {
        const eles = this.controller.cy.elements(group.id);
        chartConfig = this.createChartConfig(eles, selectedNumericAttribute);
      }
    }

    this.setState({ view, selectedNumericAttribute, chartConfig });
  }

  handleGroupChange(event) {
    const group = GROUPS[event.target.value];
    const attributes = this.getAllAttributes(group.id);
    const numericAttributes = this.filterNumericAttributes(attributes, group);
    const selectedAttributes = this.filterDefaultAttributes(attributes);
    const selectedNumericAttribute = numericAttributes.length > 0 ? numericAttributes[0] : null;

    let chartConfig;

    if (selectedNumericAttribute) {
      const eles = this.controller.cy.elements(group.id);
      chartConfig = this.createChartConfig(eles, selectedNumericAttribute);
    }

    this.setState({ group, attributes, selectedAttributes, numericAttributes, selectedNumericAttribute, chartConfig });
  }

  handleAttributesChange(event) {
    const { options } = event.target;
    const selectedAttributes = [];
    
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected)
        selectedAttributes.push(options[i].value);
    }

    this.setState({ selectedAttributes });
  }

  handleNumericAttributeChange(event) {
    const attr = event.target.value;
    const { group } = this.state;
    const eles = this.controller.cy.elements(group.id);
    const cfg = this.createChartConfig(eles, attr);
    // TODO cache all chartConfigs and only update each of them after data change events?
    this.setState({ selectedNumericAttribute: attr, chartConfig: cfg }); 
  }
 
  getAllAttributes(groupId) {
    const cy = this.controller.cy;
    return groupId == '' ? Object.keys(cy.data()) : Object.keys(cy.elements(groupId).data());
  }

  filterNumericAttributes(attributes, group) {
    // TODO How do we know the data type? For now, just check the first element -- Use NetworkAnalyser instead of cy.data()
    const eles = this.controller.cy.elements(group.id);
    
    if (eles) {
      return attributes.filter(function(attr) { 
        if (!HIDDEN_ATTRS.includes(attr)) {
          const val = eles.data(attr);
          return val != null && typeof val === 'number';
        }
        return false;
      });
    }

    return [];
  }

  filterDefaultAttributes(attributes) {
    return attributes.filter(function(attr) { 
      return !HIDDEN_ATTRS.includes(attr);
    });
  }

  createChartConfig(eles, attr) {
    // Get the column data
    let colData = [];

    for (const el of eles) {
      const v = el.data(attr);

      if (v != null)
        colData.push(v);
    }

    // Normal distribution - remove duplicates and sort values 
    colData = [...new Set(colData)];
    colData.sort((a, b) => b - a);
    let chartData = Array
        .from(colData.keys())
        .sort((a, b) => b % 2 - a % 2 || (a % 2 ? b - a : a - b))
        .map(i => colData[i]);

    const avg = mean(colData);
    const labels = chartData.map((i) => String(i));
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: true,
          },
        },
        y: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: true,
          }
        },
      },
      elements: {
        point:{
            radius: 0,
        },
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
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
            label: function(context) { return context.formattedValue; },
          },
        },
        annotation: {
          annotations: {
            meanLine: {
              type: 'line',
              borderWidth: 2,
              borderColor: theme.palette.primary.main,
              borderDash: [2, 2],
              xMin: avg,
              xMax: avg,
              yMin: Math.min(colData),
              yMax: Math.max(colData),
              label: {
                enabled: true,
                content: 'mean',
                position: 'start',
                yAdjust: -18,
                yPadding: 0,
                color: theme.palette.primary.main,
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                // font: {
                //   weight: 'bold',
                //   // size: 44,
                // },
              },
            },
            meanValueLabel: {
              type: 'line',
              borderWidth: 0,
              borderColor: 'rgba(255, 255, 255, 0.0)',
              xMin: avg,
              xMax: avg,
              yMin: Math.min(colData),
              yMax: Math.max(colData),
              label: {
                enabled: true,
                content: '' + (Math.round(avg * 1000) / 1000), // TODO check actual precision
                position: 'end',
                yAdjust: 18,
                yPadding: 0,
                color: theme.palette.primary.main,
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                font: {
                  weight: 'plain',
                },
              },
            },
          }
        },
      },
    };
    
    const cfg = {
        data: {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              data: chartData,
              borderWidth: 1,
              borderColor: theme.palette.text.primary,
              fill: true,
              backgroundColor: theme.palette.divider,
          }]
        },
        options,
    };
    
    return cfg;
  }

  render() {
    const { view, group, attributes, numericAttributes, selectedAttributes, selectedNumericAttribute } = this.state;
    const cy = this.controller.cy;

    let validGroups = GROUPS;

    if (view === 'Histogram') {
      validGroups = validGroups.filter(function(gr) {
        return gr.id !== '';
      });
    }

    const eles = group.id === '' ? null : cy.elements(group.id);
    const data = eles ? eles.data() : cy.data();

    return (
      <Grid 
        className="data-panel"
        container
        direction="row" 
        spacing={4}
      >
        <Grid item xs={3}>
          <Grid 
            container
            direction="column"
            alignContent="stretch"
            spacing={1}
          >
             <Grid item>
              <FormControl size="small" variant="outlined" fullWidth>
                <Select
                  native
                  labelId="group-select-label"
                  value={validGroups.indexOf(group)}
                  onChange={evt => this.handleGroupChange(evt)}
                  SelectDisplayProps={{ style: { width: '100%' } }}
                >
                  {validGroups.map((g, idx) => 
                    <option key={g.id} value={idx}>{g.label} Attributes</option>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {view == 'Table' && (
              <Grid item>
                <Grid 
                  container
                  direction="row"
                  justifyContent="center"
                  spacing={1}
                >
                  <Grid item>
                    <Tooltip arrow title="Show All Attributes">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!attributes || attributes.length === 0}
                        onClick={() => this.showAllAttributes()}
                      >
                        Select All
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip arrow title="Hide All Attributes">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!attributes || attributes.length === 0}
                        onClick={() => this.hideAllAttributes()}
                      >
                        Select None
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip arrow title="Sort A to Z">
                      <IconButton
                        size="small"
                        color="inherit"
                        disabled={!attributes || attributes.length === 0}
                        onClick={() => this.sortAttributes()}
                      >
                        <SortByAlphaIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            )}
            <Grid item>
              <FormControl size="small" variant="outlined" fullWidth>
                {view === 'Table' && (
                  <Select
                    multiple
                    native
                    labelId="columns-select-label"
                    value={selectedAttributes}
                    onChange={evt => this.handleAttributesChange(evt)}
                    inputProps={{ style: { height: 400, paddingRight: 16 } }}
                  >
                    {attributes && attributes.map((attr, idx) => 
                      <option key={idx} value={attr}>{attr}</option>
                    )}
                  </Select>
                )}
                {view === 'Histogram' && (
                  <Select
                    native
                    labelId="columns-select-label"
                    value={selectedNumericAttribute}
                    onChange={evt => this.handleNumericAttributeChange(evt)}
                  >
                    {numericAttributes && numericAttributes.map((attr, idx) => 
                      <option key={idx} value={attr}>{attr}</option>
                    )}
                  </Select>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>
          <Grid 
            container
            direction="column"
            justifyContent="flex-start"
            spacing={1}
          >
            <Grid item xs={12}>
              <FormControl size="small" variant="outlined">
                <Select
                  native
                  labelId="view-select-label"
                  value={VIEWS.indexOf(view)}
                  onChange={evt => this.handleViewChange(evt)}
                >
                  {VIEWS.map((v, idx) => 
                    <option key={idx} value={idx}>{v}</option>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {view == 'Table' && selectedAttributes && selectedAttributes.length > 0 && (
                <TableContainer component={Paper}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {selectedAttributes.map((k) => (
                          <TableCell key={k}>{k}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eles && eles.map((el, idx) => (
                        <TableRow key={idx}>
                          {selectedAttributes.map((k) => (
                            <TableCell key={k} align={typeof el.data(k) === 'number' ? 'right' : 'inherit'}>
                              { el.data(k) }
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {!eles && data && (
                        <TableRow>
                          {selectedAttributes.map((k) => (
                            <TableCell key={k}>
                              { data[k] }
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {view == 'Table' && selectedAttributes.length === 0 && (
                <Box style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', textAlign: 'center', }}>
                  <b style={{ fontSize: '1.5em' }}>Select at least one attribute</b>
                </Box>
              )}
              {view == 'Histogram' && selectedNumericAttribute && (
                <canvas
                  id="attribute-chart"
                  style={{ width: '100%', height: '400px' }}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

DataPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default DataPanel;