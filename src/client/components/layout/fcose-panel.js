import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

const DEFAULT_EDGE_LENGTH = 50;
const DEFAULT_NODE_SEP = 4500;

export class FCosePanel extends Component {

  constructor(props) {
    super(props);
    this.layoutOptions = {
      quality: 'proof',
      idealEdgeLength: DEFAULT_EDGE_LENGTH,
      nodeRepulsion: DEFAULT_NODE_SEP,
      animate: false,
      randomize: false
    };
  }

  handleChange(event, key, newValue) {
    if (newValue != this.props.layoutOptions[key]) {
      this.props.layoutOptions[key] = newValue;
      this.props.onChange(this.props.layoutOptions);
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
                id="idealEdgeLength"
                min={1} // If 0, the app may freeze
                max={100}
                defaultValue={DEFAULT_EDGE_LENGTH}
                onChange={(e, v) => this.handleChange(e, "idealEdgeLength", v)}
                {...sliderProps}
              />
            </FormControl>
          </Tooltip>
          <Tooltip title="The separation amount between nodes">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Node Separation</FormLabel>
              <Slider
                id="nodeRepulsion"
                min={1} // If 0, the whole app freezes!
                max={10000}
                defaultValue={DEFAULT_NODE_SEP}
                onChange={(e, v) => this.handleChange(e, "nodeRepulsion", v)}
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