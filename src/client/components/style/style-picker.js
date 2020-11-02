import React, { Component } from 'react';
import Select from 'react-select';
import { MAPPING } from '../../../model/style';
import _ from 'lodash';
import { NetworkEditorController } from '../network-editor/controller';
import PropTypes from 'prop-types';

export class StylePicker extends Component { 

  constructor(props){
    super(props);

    /** @type {NetworkEditorController} */
    this.controller = props.controller;
    
    this.state = {
      mapping: MAPPING.VALUE
    };
  }

  onShow() {
    const { selector, property  } = this.props;
    const style = this.controller.vizmapper.get(selector, property);
    switch(style.mapping) {
      case MAPPING.VALUE:
        this.setState({
          mapping: MAPPING.VALUE,
          scalarValue: style.value
        });
        break;
      case MAPPING.LINEAR:
        this.setState({
          mapping: MAPPING.LINEAR,
          mappingValue: style.value,
          attribute: style.value.data
        });
        break;
    }
  }

  onStyleChanged(newState) {
    switch(newState.mapping) {
      case MAPPING.VALUE:
        if(newState.scalarValue)
          this.props.onValueSet(newState.scalarValue);
        break;
      case MAPPING.LINEAR:
        if(newState.attribute && newState.mappingValue)
          this.props.onMappingSet(newState.attribute, newState.mappingValue);
        break;
    }
  }

  handleMapping(mapping) {
    const change = { mapping };

    this.setState(change);

    this.onStyleChanged(_.assign({}, this.state, change));
  }

  handleAttribute(attribute) {

    const change = { attribute };

    this.setState(change);

    this.onStyleChanged(_.assign({}, this.state, change));
  }

  handleScalarValue(scalarValue){
    const change = { scalarValue };

    this.setState(change);

    this.onStyleChanged(_.assign({}, this.state, change));
  }

  handleMappingValue(mappingValue){
    const change = { mappingValue };

    this.setState(change);

    this.onStyleChanged(_.assign({}, this.state, change));
  }

  render() {
    const options = [
      { value: MAPPING.VALUE,  label: this.props.valueLabel || 'Default Value' },
      { value: MAPPING.LINEAR, label: this.props.mappingLabel || 'Attribute Mapping' }
    ];
    const selectedOption = options.find(o => o.value === this.state.mapping);

    return (
      <div className="style-picker">
        <div className="style-picker-heading">
          {this.props.title || "Visual Property"}
        </div>
        <div className="style-picker-body"> 
          <Select 
            options={options}
            value={selectedOption}
            onChange={option => this.handleMapping(option.value)}
          /> 
          { (this.state.mapping == MAPPING.VALUE) 
            ? this.renderValue()
            : this.renderAttribute() }
        </div>
      </div>
    );
  }

  renderValue() {
    const onSelect = value => this.handleScalarValue( value );
    return (
      <div className="style-picker-value"> 
        { this.props.renderValue(this.state.scalarValue, onSelect) }
      </div>
    );
  }

  renderAttribute() {
    const attributeOptions = this.controller.getPublicAttributes().map(a => ({value: a, label: a}));
    const selectedOption = attributeOptions.find(o => o.value === this.state.attribute);
    return (
      <div className="style-picker-attribute">
        <Select
          onChange={option => this.handleAttribute(option.value)}
          options={attributeOptions}
          value={selectedOption}
          placeholder="Select Attribute..."
        />
        { selectedOption && this.renderMapping() }
      </div>
    );
  }

  renderMapping() {
    const onSelect = value => this.handleMappingValue(value);
    return (
        <div className="style-picker-value">
         { this.props.renderMapping(this.state.mappingValue, onSelect) }
        </div>
    );
  }

}

StylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  renderMapping: PropTypes.func,
  renderValue: PropTypes.func,
  selector: PropTypes.string,
  property: PropTypes.string,
  onValueSet: PropTypes.func,
  onMappingSet: PropTypes.func,
  valueLabel: PropTypes.string,
  mappingLabel: PropTypes.string,
  title: PropTypes.string
};

export default StylePicker;