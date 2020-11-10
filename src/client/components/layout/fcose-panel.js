import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
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
    const classes = useStyles();
    const commonProps = {
      variant: "outlined",
      InputLabelProps: {
        shrink: true,
      },
      style: {
        margin: '0.5em',
      },
    };

    return (
      <form className={classes.root} noValidate autoComplete="off">
        <Grid container justify="center" spacing={3}>
          <Tooltip title="Node repulsion (non overlapping) multiplier">
            <TextField
              id="nodeRepulsion"
              label="Node Repulsion"
              type="number"
              defaultValue={nodeRepulsion}
              onChange={e => this.handleChange(e)}
              {...commonProps}
            />
          </Tooltip>
          <Tooltip title="Maximum number of iterations to perform">
            <TextField
              id="numIter"
              label="Iterations"
              type="number"
              defaultValue={numIter}
              onChange={e => this.handleChange(e)}
              {...commonProps}
            />
          </Tooltip>
        </Grid>
      </form>
    );
  }
}

function useStyles() {
  return makeStyles((theme) => ({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
  }));
}

FCosePanel.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default FCosePanel;