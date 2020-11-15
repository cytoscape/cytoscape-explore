import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, TextField } from '@material-ui/core';


export class LabelInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.debouncedOnChange = _.debounce(value => this.props.onChange(value), 150);
  }

  handleInput(value) {
    this.setState({ value });
    this.debouncedOnChange(value);
  }

  render() {
    return (
      <div className="label-input">
        {"Label: "}{'\u00A0'}
        <TextField 
          value={this.state.value} 
          onChange={event => this.handleInput(event.target.value)} 
        />
        {/* <Button 
          variant="contained" 
          onClick={() => this.handleInput("")}
        >
          Clear
        </Button> */}
      </div>
    );
  }
}

LabelInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};