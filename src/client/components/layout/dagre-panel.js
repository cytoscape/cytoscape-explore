import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

export class DagrePanel extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.layoutOptions = this.controller.getLayoutOptions('dagre');
    this.state = {
      rankDir: this.layoutOptions.rankDir,
    };
  }

  handleChange(event, key, newValue) {
    if (newValue != this.layoutOptions[key]) {
      if (key === 'rankDir') {
        // If we don't update the state for this option, the toggle button is not selected
        this.setState({ rankDir: newValue });
      }
      this.layoutOptions[key] = newValue;
      this.props.onChange(this.layoutOptions);
    }
  }

  render() {
    const { rankDir } = this.state;
    const { classes } = this.props;
    const { layoutOptions } = this;
    const sliderProps = {
      className: classes.slider,
      valueLabelDisplay: 'auto',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Tooltip arrow title="The separation between adjacent nodes in the same layer">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Node Separation</FormLabel>
            <Slider
              id="nodeSep"
              min={0}
              max={500}
              defaultValue={layoutOptions.nodeSep}
              onChange={(e, v) => this.handleChange(e, "nodeSep", v)}
              {...sliderProps}
            />
          </FormControl>
        </Tooltip>
        <Tooltip arrow title="The separation between each layer in the layout">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Layer Separation</FormLabel>
            <Slider
              id="rankSep"
              min={0}
              max={500}
              defaultValue={layoutOptions.rankSep}
              onChange={(e, v) => this.handleChange(e, "rankSep", v)}
              {...sliderProps}
            />
          </FormControl>
        </Tooltip>
        <FormControl component="fieldset">
          <Tooltip arrow title="The direction of the layers">
            <FormLabel component="legend" className={classes.label}>Direction</FormLabel>
          </Tooltip>
          <ToggleButtonGroup
            id="rankDir"
            size="small"
            className={classes.buttonGroup}
            exclusive={true}
            value={rankDir}
            onChange={(e, v) => this.handleChange(e, "rankDir", v)}
          >
            {directions.map((el) => (
              <Tooltip arrow key={`tooltip-${el.value}`} title={el.label}>
                <ToggleButton key={`btn-${el.value}`} value={el.value} selected={rankDir === el.value}>{el.icon}</ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </FormControl>
      </form>
    );
  }
}

const directions = [
  { label: 'Top-to-Bottom', value: 'TB', icon: <ArrowDownwardIcon /> },
  { label: 'Bottom-to-Top', value: 'BT', icon: <ArrowUpwardIcon /> },
  { label: 'Left-to-Right', value: 'LR', icon: <ArrowForwardIcon /> },
  { label: 'Right-to-Left', value: 'RL', icon: <ArrowBackIcon /> },
];

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  label: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  slider: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 150,
  },
  buttonGroup: {
    marginLeft: theme.spacing(1),
  },
});

DagrePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default withStyles(styles)(DagrePanel);