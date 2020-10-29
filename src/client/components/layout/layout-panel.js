import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { CircularLayoutIcon, ClusteredLayoutIcon, HierarchicalLayoutIcon } from '../svg-icons';

const iconProps = {
  viewBox: '0 0 96 64',
  style: { width: 'auto', fontSize: 38, margin: 0 },
  p: 0,
  m: 0,
};

const layouts = [
  { name: 'fcose', label: 'Clustered', icon: <ClusteredLayoutIcon {...iconProps} />, options: { } }, 
  { name: 'concentric', label: 'Circular', icon: <CircularLayoutIcon {...iconProps} />, options: { } },
  { name: 'dagre', label: 'Hierarchical', icon: <HierarchicalLayoutIcon {...iconProps} />, options: { } },
];

export class LayoutPanel extends Component {

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.state = {
      value: 0,
    };
  }

  handleChange(event, value) {
    this.setState(Object.assign(this.state, { value: value }));

    if (value > 0) {
      setTimeout(() => {
        const l = layouts[value - 1];
        this.applyLayout(l);
      }, 250);
    }
  }

  applyLayout(props) {
    this.controller.applyLayout(props);
  }

  render() {
    const { value } = this.state;
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <AppBar position="relative" color="default">
          <Tabs
            value={value}
            onChange={(e, v) => this.handleChange(e, v)}
            variant="scrollable"
            scrollButtons="on"
            indicatorColor="secondary"
            textColor="secondary"
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
            { '[ ' + el.label + ' Options ]' }
          </TabPanel>
        ))}
      </div>
    );
  }
}

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
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
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