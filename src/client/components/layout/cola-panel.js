import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

const DEFAULT_EDGE_LENGTH = 50;
const DEFAULT_NODE_SPACING = 10;

export class ColaPanel extends Component {

  constructor(props) {
    super(props);
    this.layoutOptions = {
      edgeLength: DEFAULT_EDGE_LENGTH,
      nodeSpacing: DEFAULT_NODE_SPACING,
      randomize: false,
      animate: true
    };
  }

  handleChange(event, key, newValue) {
    if (newValue != this.layoutOptions[key]) {
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
        <div>
          <Tooltip title="The ideal edge length">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Edge Length</FormLabel>
              <Slider
                id="edgeLength"
                min={1} // If 0, the app may freeze
                max={200}
                defaultValue={DEFAULT_EDGE_LENGTH}
                onChange={(e, v) => this.handleChange(e, "edgeLength", v)}
                {...sliderProps}
              />
            </FormControl>
          </Tooltip>
          <Tooltip title="The separation amount between nodes">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Node Separation</FormLabel>
              <Slider
                id="nodeSpacing"
                min={1} // If 0, the whole app freezes!
                max={40}
                defaultValue={DEFAULT_NODE_SPACING}
                onChange={(e, v) => this.handleChange(e, "nodeSpacing", v)}
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

ColaPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ColaPanel);