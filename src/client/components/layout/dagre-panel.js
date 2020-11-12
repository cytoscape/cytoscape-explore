import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

export class DagrePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rankDir: 'TB',
    };
    this.layoutOptions = {
      nodeSep: 50,
      rankSep: 100,
      rankDir: 'TB',
    };
  }

  handleChange(event, key, newValue) {
    if (newValue != this.layoutOptions[key]) {
      if (key === 'rankDir') {
        this.setState(Object.assign(this.state, { rankDir: newValue }));
      }
      this.layoutOptions[key] = newValue;
      this.props.onChange(this.layoutOptions);
    }
  }

  render() {
    const { rankDir } = this.state;
    const { classes } = this.props;
    const sliderProps = {
      className: classes.slider,
      valueLabelDisplay: 'auto',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Tooltip title="The separation between adjacent nodes in the same layer">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Node Separation</FormLabel>
            <Slider
              id="nodeSep"
              min={0}
              max={500}
              defaultValue={50}
              onChange={(e, v) => this.handleChange(e, "nodeSep", v)}
              {...sliderProps}
            />
          </FormControl>
        </Tooltip>
        <Tooltip title="The separation between each layer in the layout">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Layer Separation</FormLabel>
            <Slider
              id="rankSep"
              min={0}
              max={500}
              defaultValue={50}
              onChange={(e, v) => this.handleChange(e, "rankSep", v)}
              {...sliderProps}
            />
          </FormControl>
        </Tooltip>
        <FormControl component="fieldset">
          <Tooltip title="The direction of the layers">
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
            <Tooltip title="Top-to-Bottom">
              <ToggleButton value="TB" selected={rankDir === 'TB'}><ArrowDownwardIcon /></ToggleButton>
            </Tooltip>
            <Tooltip title="Left-to-Right">
              <ToggleButton value="LR" selected={rankDir === 'LR'}><ArrowForwardIcon /></ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </FormControl>
      </form>
    );
  }
}

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
};

export default withStyles(styles)(DagrePanel);