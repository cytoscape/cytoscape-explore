import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select } from "@material-ui/core";
import { NetworkEditorController } from './controller';

export class AttributeSelect extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const attributes = this.props.controller.networkAnalyser.getAttributes(this.props.selector);
    return (
      <FormControl style={{minWidth: 150}} variant="outlined">
        <InputLabel id="attribute-select-label">{this.props.label}</InputLabel>
        <Select
          native
          labelId="attribute-select-label"
          value={this.props.selectedAttribute || ''}
          onChange={event => this.props.onChange(event.target.value)}
        >
        <option key='' aria-label='None' value='' />
        {attributes.map(a => 
          <option key={a} value={a}>{a}</option>
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