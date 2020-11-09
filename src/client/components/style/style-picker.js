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
    this.initialized = false;
    if(props.onPassthroughSet) { 
      this.state = { mapping: MAPPING.PASSTHROUGH };
    } else {
      this.state = { mapping: MAPPING.VALUE };
    }
  }

  onShow() {
    this.initialized = true;
    const style = this.props.getStyle();
    switch(style.mapping) {
      case MAPPING.VALUE:
        this.setState({
          mapping: MAPPING.VALUE,
          scalarValue: style.value
        });
        break;
      case MAPPING.PASSTHROUGH:
        this.setState({
          mapping: MAPPING.PASSTHROUGH,
          attribute: style.value.data
        });
        break;
      case MAPPING.LINEAR:
        this.setState({
          mapping: MAPPING.LINEAR,
          attribute: style.value.data,
          mappingValue: style.value,
        });
        break;
      case MAPPING.DISCRETE:
        this.setState({
          mapping: MAPPING.DISCRETE,
          attribute: style.value.data,
          discreteValue: style.value
        });
        break;
    }
  }

  onStyleChanged(newState) {
    switch(newState.mapping) {
      case MAPPING.VALUE:
        if(newState.scalarValue !== undefined)
          this.props.onValueSet(newState.scalarValue);
        break;
      case MAPPING.PASSTHROUGH:
        if(newState.attribute !== undefined)
          this.props.onPassthroughSet(newState.attribute);
        break;
      case MAPPING.LINEAR:
        if(newState.attribute !== undefined && newState.mappingValue !== undefined)
          this.props.onMappingSet(newState.attribute, newState.mappingValue);
        break;
      case MAPPING.DISCRETE:
        if(newState.attribute !== undefined && newState.discreteValue !== undefined)
          this.props.onDiscreteSet(newState.attribute, newState.discreteValue);
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

  handleDiscreteValue(discreteValue){
    const change = { discreteValue };
    this.setState(change);
    this.onStyleChanged(_.assign({}, this.state, change));
  }

  render() {
    if(!this.initialized)
      return null;

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
              { this.props.onValueSet && <MenuItem value={MAPPING.VALUE}>{this.props.valueLabel || 'Default Value'}</MenuItem> }
              { this.props.onMappingSet && <MenuItem value={MAPPING.LINEAR}>{this.props.mappingLabel || 'Attribute Mapping'}</MenuItem> }
              { this.props.onPassthroughSet && <MenuItem value={MAPPING.PASSTHROUGH}>{'Passthrough Mapping'}</MenuItem> }
              { this.props.onDiscreteSet && <MenuItem value={MAPPING.DISCRETE}>{'Discrete Mapping'}</MenuItem> }
            </Select>
          </FormControl>
          {/* {(() => {
              if(this.state.mapping == MAPPING.VALUE)
                return this.renderValue();
              else if(this.state.mapping == MAPPING.LINEAR)
                return this.renderAttribute();
              else if(this.state.mapping == MAPPING.PASSTHROUGH)
                return this.renderAttribute();
              else if(this.state.mapping == MAPPING.PASSTHROUGH)
                return this.renderAttribute();
            })() */}
            { this.state.mapping === MAPPING.VALUE
              ? this.renderValue()
              : this.renderAttribute()
            }
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
        {(() => {
          if(!this.state.attribute)
            return null;
          else if(this.state.mapping === MAPPING.PASSTHROUGH)
            return null;
          else if(this.state.mapping === MAPPING.LINEAR)
            return this.renderMapping();
          else if(this.state.mapping === MAPPING.DISCRETE)
            return this.renderDiscrete();
        })()}
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


  renderDiscrete() {
    return (
      <div>
        Discrete Mapping TODO
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
  onDiscreteSet: PropTypes.func,
  onPassthroughSet: PropTypes.func,
  valueLabel: PropTypes.string,
  mappingLabel: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string,
};

export default StylePicker;