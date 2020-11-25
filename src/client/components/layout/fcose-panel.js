import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

export class FCosePanel extends Component {

  constructor(props) {
    super(props);
  }

  handleChange(event, key, newValue) {
    if (newValue != this.props.layoutOptions[key]) {
      this.props.layoutOptions[key] = newValue;
      this.props.onChange(this.props.layoutOptions);
    }
  }

  render() {
    const { classes, layoutOptions } = this.props;
    const sliderProps = {
      className: classes.slider,
      valueLabelDisplay: 'auto',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <div>
          <Tooltip title="The ideal edge length">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Edge Length</FormLabel>
              <Slider
                id="idealEdgeLength"
                min={1} // If 0, the app may freeze
                max={500}
                defaultValue={layoutOptions.idealEdgeLength}
                onChange={(e, v) => this.handleChange(e, "idealEdgeLength", v)}
                {...sliderProps}
              />
            </FormControl>
          </Tooltip>
          <Tooltip title="The separation amount between nodes">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Node Separation</FormLabel>
              <Slider
                id="nodeSeparation"
                min={1} // If 0, the whole app freezes!
                max={5000}
                defaultValue={layoutOptions.nodeSeparation}
                onChange={(e, v) => this.handleChange(e, "nodeSeparation", v)}
                {...sliderProps}
              />
            </FormControl>
          </Tooltip>
        </div>
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

FCosePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  layoutOptions: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(FCosePanel);