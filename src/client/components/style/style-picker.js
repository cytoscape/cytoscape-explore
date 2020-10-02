import React, { Component } from 'react';
import Select from 'react-select';
import { MAPPING } from '../../../model/style';

export class StylePicker extends Component { 

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.state = {
      mapping: MAPPING.VALUE
    };
  }

  onShow() {
    const { selector, property  } = this.props;
    const style = this.controller.cySyncher.getStyle(selector, property);
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

  componentDidUpdate() {
    switch(this.state.mapping) {
      case MAPPING.VALUE:
        if(this.state.scalarValue)
          this.props.onValueSet(this.state.scalarValue);
        break;
      case MAPPING.LINEAR:
        if(this.state.attribute && this.state.mappingValue)
          this.props.onMappingSet(this.state.attribute, this.state.mappingValue);
        break;
    }
  }

  handleMapping(mapping) {
    this.setState({ mapping });
  }

  handleAttribute(attribute) {
    this.setState({ attribute });
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
    const onSelect = value => this.setState({ scalarValue: value })
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
    const onSelect = value => this.setState({ mappingValue: value });
    return (
        <div className="style-picker-value">
         { this.props.renderMapping(this.state.mappingValue, onSelect) }
        </div>
    );
  }

}

export default StylePicker;