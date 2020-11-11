import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

export class DagrePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.layoutOptions = {
      nodeSep: 50,
      rankSep: 100,
    };
  }

  handleChange(event, key, newValue) {
    if (newValue != this.layoutOptions[event.target.id]) {
      this.layoutOptions[key] = newValue;
      this.props.onChange(this.layoutOptions);
    }
  }

  render() {
    const { classes } = this.props;
    const sliderProps = {
      className: classes.slider,
      valueLabelDisplay: 'auto',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Tooltip title="The separation between adjacent nodes in the same rank">
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
        <Tooltip title="The separation between each rank in the layout">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Rank Separation</FormLabel>
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
});

DagrePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(DagrePanel);