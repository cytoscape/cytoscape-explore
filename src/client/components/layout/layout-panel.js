import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { NetworkEditorController } from '../network-editor/controller';
import FCosePanel from './fcose-panel';
import ConcentricPanel from './concentric-panel';
import DagrePanel from './dagre-panel';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { CircularLayoutIcon, ClusteredLayoutIcon, HierarchicalLayoutIcon } from '../svg-icons';
import { DEFAULT_PADDING } from './defaults';

/**
 * We want to save the last used layout options in memory
 */
const layoutOptions = [
  {
    name: 'fcose',
    idealEdgeLength: 50,
    nodeSeparation: 75,
    randomize: true,
    animate: false,
    padding: DEFAULT_PADDING
  },
  {
    name: 'concentric',
    spacingFactor: 1,
    padding: DEFAULT_PADDING,
    concentric: node => { // returns numeric value for each node, placing higher nodes in levels towards the centre
      return node.degree();
    },
    levelWidth: () => { // the variation of concentric values in each level
      return 2;
    }
  },
  {
    name: 'dagre',
    nodeSep: 50,
    rankSep: 100,
    rankDir: 'TB',
    padding: DEFAULT_PADDING
  },
];

export class LayoutPanel extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    this.applyLayout = throttle((options) => {
      this.controller.applyLayout(options);
    }, 250, { leading: true });

    const opProps = {
      onChange: (options) => this.handleOptionsChange(options),
    };
    const layouts = [
      // { name: 'cola', label: 'Clustered Cola', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <ColaPanel {...opProps} /> },
      { label: 'Clustered', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <FCosePanel layoutOptions={layoutOptions[0]} {...opProps} /> },
      // { name: 'cose', label: 'Clustered COSE', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <CosePanel {...opProps} /> },
      { label: 'Circular', icon: <CircularLayoutIcon {...iconProps} />, optionsPanel: <ConcentricPanel layoutOptions={layoutOptions[1]} {...opProps} /> },
      { label: 'Hierarchical', icon: <HierarchicalLayoutIcon {...iconProps} />, optionsPanel: <DagrePanel layoutOptions={layoutOptions[2]} {...opProps} /> },
    ];
    this.state = {
      value: 0,
      layouts: layouts,
    };
  }

  handleChange(value, options) {
    if (value != this.state.value) {
      this.setState({ value: value });
    }

    if (value > 0) {
      this.applyLayout(options);
    }
  }

  handleOptionsChange(options) {
    this.handleChange(this.state.value, options);
  }

  render() {
    const { value, layouts } = this.state;
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <AppBar position="relative" color="default">
          <Tabs
            value={value}
            onChange={(e, v) => this.handleChange(v, layoutOptions[v - 1])}
            variant="scrollable"
            scrollButtons="on"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab key={0} style={{ display: 'none' }} {...a11yProps(0)} />
            {layouts.map((el, i) => (
              <Tab key={i + 1} label={el.label} icon={el.icon} {...a11yProps(i + 1)} />
            ))}
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0} style={{ display: 'none' }} />
        {layouts.map((el, i) => (
          <TabPanel key={i + 1} value={value} index={i + 1}>
            {el.optionsPanel}
          </TabPanel>
        ))}
      </div>
    );
  }
}

const iconProps = {
  viewBox: '0 0 96 64',
  style: { width: 'auto', fontSize: 38, margin: 0 },
  p: 0,
  m: 0,
};

function useStyles() {
  return makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }));
}

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      position="relative"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>{children}</Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

LayoutPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default LayoutPanel;