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
      attribute: null,
      mapping: null
    };
  }

  onShow(){
    //this.setState({ page: pages.VALUE });
  }

  _getAttributes() {
    const attrNames = new Set();
    const nodes = this.controller.cy.nodes();
    nodes.forEach(n => {
      const attrs = Object.keys(n.json().data);
      attrs.forEach(a => attrNames.add(a));
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
            ? this.renderDefault()
            : this.renderAttribute() }
        </div>
      </div>
    );
  }

  renderDefault() {
    return (
      <div className="style-picker-value"> 
        {this.props.valuePicker}
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
    return (
      <div>
        <div className="style-picker-value">
         {this.props.mappingPicker}
        </div>
      </div>
    );
  }

}

export default StylePicker;