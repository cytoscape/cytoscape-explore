import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Select } from "@material-ui/core";
import { NetworkEditorController } from './controller';

export class AttributeSelect extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const attributes = this.props.controller.networkAnalyser.getAttributes(this.props.selector);
    return (
      <FormControl style={{ width: '100%' }} size="small" variant="outlined">
        <Select
          native
          labelId="attribute-select-label"
          value={this.props.selectedAttribute || ''}
          onChange={event => this.props.onChange(event.target.value)}
        >
          <option key='' aria-label='None' value='--none--' />
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