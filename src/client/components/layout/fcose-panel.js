import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

export class FCosePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodeRepulsion: 4500,
      numIter: 2500,
    };
  }

  handleChange(event) {
    const prop = {};
    prop[event.target.id] = event.target.value;
    this.setState(Object.assign(this.state, prop));
    this.props.onChange(this.state);
  }

  render() {
    const { nodeRepulsion, numIter } = this.state;
    const { classes } = this.props;
    const textFieldProps = {
      variant: "outlined",
      className: classes.textField,
      InputLabelProps: {
        shrink: true,
        classes: {
          root: classes.cssLabel,
          focused: classes.cssFocused,
        },
      },
      InputProps: {
        classes: {
          root: classes.cssOutlinedInput,
          focused: classes.cssFocused,
          notchedOutline: classes.notchedOutline,
        },
        inputMode: "numeric",
      }
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <Grid container justify="center" spacing={2}>
          <Tooltip title="Node repulsion (non overlapping) multiplier">
            <TextField
              id="nodeRepulsion"
              label="Node Repulsion"
              type="number"
              defaultValue={nodeRepulsion}
              onChange={e => this.handleChange(e)}
              {...textFieldProps}
            />
          </Tooltip>
          <Tooltip title="Maximum number of iterations to perform">
            <TextField
              id="numIter"
              label="Iterations"
              type="number"
              defaultValue={numIter}
              onChange={e => this.handleChange(e)}
              {...textFieldProps}
            />
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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 150,
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      borderColor: `${theme.palette.secondary.main} !important`,
      color : 'green !important',
    }
  },
  cssLabel: {
    '&$cssFocused': {
      color : `${theme.palette.secondary.main} !important`,
    }
  },
  cssFocused: {},
  notchedOutline: {},
});

FCosePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(FCosePanel);