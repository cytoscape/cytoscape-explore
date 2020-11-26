import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

export class ConcentricPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.layoutOptions = props.layoutOptions;
  }

  handleChange(event, key, newValue) {
    if (newValue != this.layoutOptions[key]) {
      this.layoutOptions[key] = newValue;
      this.props.onChange(this.layoutOptions);
    }
  }

  render() {
    const { classes } = this.props;
    const { layoutOptions } = this;
    const sliderProps = {
      className: classes.slider,
      valueLabelDisplay: 'auto',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Tooltip title="The separation between nodes">
          <FormControl component="fieldset">
            <FormLabel component="legend" className={classes.label}>Separation</FormLabel>
            <Slider
              id="spacingFactor"
              min={1}
              max={10}
              defaultValue={layoutOptions.spacingFactor}
              onChange={(e, v) => this.handleChange(e, "spacingFactor", v)}
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

ConcentricPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  layoutOptions: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ConcentricPanel);