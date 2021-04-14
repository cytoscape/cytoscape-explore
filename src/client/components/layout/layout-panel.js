import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
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

export class LayoutPanel extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    this.applyLayout = debounce((options) => {
      this.controller.applyLayout(options);
    }, 250, { leading: true });

    const opProps = {
      controller: this.controller,
      onChange: (options) => this.handleOptionsChange(options),
    };
    const layouts = [
      { label: 'Clustered', name: 'fcose', icon: <ClusteredLayoutIcon {...iconProps} />, optionsPanel: <FCosePanel {...opProps} /> },
      { label: 'Circular', name: 'concentric', icon: <CircularLayoutIcon {...iconProps} />, optionsPanel: <ConcentricPanel {...opProps} /> },
      { label: 'Hierarchical', name: 'dagre', icon: <HierarchicalLayoutIcon {...iconProps} />, optionsPanel: <DagrePanel {...opProps} /> },
    ];
    this.state = {
      value: 0, // Start with the hidden tab, so it looks like no tab is selected
      layouts: layouts,
    };
  }

  handleChange(value, options) {
    const { layouts } = this.state;

    if (value != this.state.value) {
      this.setState({ value: value });
    }

    if (value > 0 && value <= layouts.length) {
      if (options == null) {
        const { name } = layouts[value - 1]; // Remember that '0' is the hidden tab!
        options = this.controller.getLayoutOptions(name);
      }
      
      if(!this.positionSnapshot) {
        this.positionSnapshot = this.controller.getNodePositionsSnapshot();
      }

      this.applyLayout(options);
    }
  }

  componentWillUnmount() {
    if(this.positionSnapshot) {
      this.controller.postLayoutUndoEdit(this.positionSnapshot);
    }
    this.positionSnapshot = null;
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
            onChange={(e, v) => this.handleChange(v)}
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