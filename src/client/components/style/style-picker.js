import React, { Component } from 'react';
import Select from 'react-select';

export class StylePicker extends Component { 

  constructor(props){
    super(props);
    this.controller = props.controller;

    this.mappingOptions = [
      { value: 'default', label: props.valueLabel || 'Default Value' },
      { value: 'mapping', label: props.mappingLabel || 'Attribute Mapping' },
    ];

    this.state = {
      mappingOption: this.mappingOptions[0],
      scalarValue: null,
      mappingValue: null,
      attribute: null
    };
  }

  onShow() {
    console.log("Style Picker onShow()")
  }

  componentDidUpdate() {
    console.log(this.state);
    const option = this.state.mappingOption.value;

    if(option == 'mapping' && this.state.mappingValue) {
      console.log("set the mapping");
      this.props.onMappingSet(this.state.attribute, this.state.mappingValue);
    } else if(option == 'default' && this.state.scalarValue) {
      console.log("set the value");
      this.props.onValueSet(this.state.scalarValue);
    }
  }

  _getAttributes() {
    const attrNames = new Set();
    const nodes = this.controller.cy.nodes();
    nodes.forEach(n => {
      const attrs = Object.keys(n.json().data);
      attrs.forEach(a => {
        attrNames.add(a)
      });
    });
    return Array.from(attrNames);
  }

  handleStyleType(option) {
    this.setState({ mappingOption: option });
  }

  handleAttribute(option) {
    this.setState({ attribute: option.value })
  }

  render() {
    return (
      <div className="style-picker">
        <div className="style-picker-heading">
          {this.props.title || "Visual Property"}
        </div>
        <div className="style-picker-body"> 
          <Select 
            onChange={option => this.handleStyleType(option)}
            options={this.mappingOptions}
            value={this.state.mappingOption}
          /> 
          { (this.state.mappingOption.value == "default") 
            ? this.renderValue()
            : this.renderAttribute() }
        </div>
      </div>
    );
  }

  renderValue() {
    const value = this.state.scalarValue;
    const onSelect = newValue => this.setState({ scalarValue: newValue })
    return (
      <div className="style-picker-value"> 
        { this.props.renderValue(value, onSelect) }
      </div>
    );
  }

  renderAttribute() {
    const attributeOptions = this._getAttributes().map(a => ({value: a, label: a}));
    const selectedOption = attributeOptions.find(o => o.value === this.state.attribute);
    return (
      <div className="style-picker-attribute">
        <Select
          onChange={option => this.handleAttribute(option)}
          options={attributeOptions}
          value={selectedOption}
          placeholder="Select Attribute..."
        />
        { selectedOption && this.renderMapping() }
      </div>
    );
  }

  renderMapping() {
    const value = this.state.mappingValue;
    const onSelect = newValue => this.setState({ mappingValue: newValue });
    return (
        <div className="style-picker-value">
         { this.props.renderMapping(value, onSelect) }
        </div>
    );
  }

}

export default StylePicker;