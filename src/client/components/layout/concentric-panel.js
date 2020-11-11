import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

export class ConcentricPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.layoutOptions = {
      spacingFactor: 0,
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
      color: 'secondary',
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Grid container justify="center" spacing={2}>
          <Tooltip title="Expands or compresses the overall area that the nodes take up">
            <div>
              <Typography id="spacingFactor-label" className={classes.label}  gutterBottom>Separation</Typography>
              <Slider
                id="spacingFactor"
                label="Separation"
                min={0}
                max={10}
                defaultValue={0}
                onChange={(e, v) => this.handleChange(e, "spacingFactor", v)}
                {...sliderProps}
              />
            </div>
          </Tooltip>
        </Grid>
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

  },
  slider: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 150,
  },
});

ConcentricPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ConcentricPanel);