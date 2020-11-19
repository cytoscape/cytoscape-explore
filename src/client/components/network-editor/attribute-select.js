import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { NetworkEditorController } from './controller';

export class AttributeSelect extends React.Component {

  constructor(props) {
    super(props);
    this.attributes = props.controller.getPublicAttributes(props.selector);
  }

  render() {
    return (
      <FormControl style={{minWidth: 150}}>
        <InputLabel id="attribute-select-label">{this.props.label}</InputLabel>
        <Select
          labelId="attribute-select-label"
          value={this.props.selectedAttribute || ''}
          onChange={event => this.props.onChange(event.target.value)} 
        >
        {this.attributes.map(a => 
          <MenuItem key={a} value={a}>{a}</MenuItem>
        )}
        </Select>
      </FormControl>
    );
  }
}

AttributeSelect.propTypes = {
  label: PropTypes.string,
  selector: PropTypes.oneOf(['node', 'edge']),
  selectedAttribute: PropTypes.string,
  onChange: PropTypes.func,
  controller: PropTypes.instanceOf(NetworkEditorController),
};
AttributeSelect.defaultProps = {
  label: "Attribute",
  selector: 'node',
  onChange: () => null,
};

export default AttributeSelect;