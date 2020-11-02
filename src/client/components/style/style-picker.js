import React, { Component } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import { MAPPING } from '../../../model/style';
import _ from 'lodash';
import { NetworkEditorController } from '../network-editor/controller';
import PropTypes from 'prop-types';

export class StylePicker extends Component { 

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.state = {
      mapping: MAPPING.VALUE
    };
  }

  onShow() {
    const style = this.props.getStyle();
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
    return (
      <div className="style-picker">
        <div className="style-picker-heading">
          <i className="material-icons">{this.props.icon}</i>
          {'\u00A0'}
          {this.props.title || "Visual Property"}
        </div>
        <div className="style-picker-body"> 
          <FormControl style={{width:'90%'}} variant="outlined">
            <InputLabel id="mapping-label">Style Type</InputLabel>
            <Select 
              labelId="mapping-label"
              label="Style Type"
              value={this.state.mapping}
              onChange={event => this.handleMapping(event.target.value)} 
              >
              <MenuItem value={MAPPING.VALUE}>{this.props.valueLabel || 'Default Value'}</MenuItem>
              <MenuItem value={MAPPING.LINEAR}>{this.props.mappingLabel || 'Attribute Mapping'}</MenuItem>
            </Select>
          </FormControl>
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
    const attributes = this.controller.getPublicAttributes();
    return (
      <div className="style-picker-attribute">
        <FormControl style={{width:'90%'}} variant="outlined">
          <InputLabel id="attribute-label">Attribute</InputLabel>
          <Select 
            labelId="attribute-label"
            label="Attribute"
            value={this.state.attribute}
            onChange={event => this.handleAttribute(event.target.value)} 
            >
            {attributes.map(a => 
              <MenuItem key={a} value={a}>{a}</MenuItem>
            )}
          </Select>
        </FormControl>
        { this.state.attribute && this.renderMapping() }
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
  getStyle: PropTypes.func,
  onValueSet: PropTypes.func,
  onMappingSet: PropTypes.func,
  valueLabel: PropTypes.string,
  mappingLabel: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
};

export default StylePicker;