import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
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
      variant: "standard",
      className: classes.textField,
      InputLabelProps: {
        shrink: true,
      },
    };

    return (
      <form className={classes.container} noValidate autoComplete="off">
        <div>
          <Tooltip title="Node repulsion (non overlapping) multiplier">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Node Repulsion</FormLabel>
              <TextField
                id="nodeRepulsion"
                type="number"
                defaultValue={nodeRepulsion}
                onChange={e => this.handleChange(e)}
                {...textFieldProps}
              />
            </FormControl>
          </Tooltip>
          <Tooltip title="Maximum number of iterations to perform">
            <FormControl component="fieldset">
              <FormLabel component="legend" className={classes.label}>Iterations</FormLabel>
              <TextField
                id="numIter"
                type="number"
                defaultValue={numIter}
                onChange={e => this.handleChange(e)}
                {...textFieldProps}
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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 150,
  },
});

FCosePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(FCosePanel);