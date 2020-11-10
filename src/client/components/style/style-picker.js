import React from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Tabs, Tab, Select, MenuItem, InputLabel, FormControl, Paper, Tooltip } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { MAPPING } from '../../../model/style';


const TAB = {
  VALUE: 'VALUE',
  MAPPING: 'MAPPING'
};


export class StylePicker extends React.Component { 

  constructor(props){
    super(props);
    this.controller = props.controller;

    this.state = {
      initialized: false,
      tab: TAB.VALUE,
      style: {
        mapping: MAPPING.VALUE
      }
    };
  }

  onShow() {
    this.setState({ initialized: true });
  }

  onStyleChanged(style) {
    switch(style.mapping) {
      case MAPPING.VALUE:
        if(style.scalarValue !== undefined)
          this.props.onValueSet(style.scalarValue);
        break;
      case MAPPING.PASSTHROUGH:
        if(style.attribute !== undefined)
          this.props.onPassthroughSet(style.attribute);
        break;
      case MAPPING.LINEAR:
        if(style.attribute !== undefined && style.mappingValue !== undefined)
          this.props.onMappingSet(style.attribute, style.mappingValue);
        break;
      case MAPPING.DISCRETE:
        if(style.attribute !== undefined && style.discreteValue !== undefined)
          this.props.onDiscreteSet(style.attribute, style.discreteValue);
        break;
    }
  }

  handleTab(tab) {
    this.setState({ tab });
  }

  handleScalarValue(scalarValue) {
    const change = { style: { ...this.state.style, scalarValue } };
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  renderSubComponent_Value() {
    const onSelect = value => this.handleScalarValue( value );
    return (
      <div className="style-picker-value"> 
        { this.props.renderValue(this.state.style.scalarValue, onSelect) }
      </div>
    );
  }

  renderSubComponent_Linear() {
    // TODO change to 'props.renderLinear'
    const onSelect = value => this.handleMappingValue(value);
    return (
        <div className="style-picker-value">
         { this.props.renderMapping(this.state.style.mappingValue, onSelect) }
        </div>
    );
  }

  render() {
    if(!this.state.initialized)
      return null;

    return (
      <div className="style-picker">
        <Paper>
          <div className="style-picker-heading">
            <i className="material-icons">{this.props.icon}</i>
            {'\u00A0'}
            {this.props.title || "Visual Property"}
          </div>
          <Tabs 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            value={this.state.tab} 
            onChange={(event,value) => this.handleTab(value)} >
            <Tab value={TAB.VALUE}   label='Single' />
            <Tab value={TAB.MAPPING} label='Mapping' />
          </Tabs>
        </Paper>
        { this.state.tab === TAB.VALUE
          ? this.renderSubComponent_Value()
          : this.renderMapping()
        }
      </div>
    );
  }

  renderMapping() {
    const attributes = this.controller.getPublicAttributes();
    return (
      <div className="style-picker-mapping-box">
        <div style={{'padding-right':'15px'}}>
          <FormControl style={{minWidth: 150}}>
            <InputLabel id="attribute-select-label">Attribute</InputLabel>
            <Select
              labelId="attribute-select-label"
              value={this.state.style.attribute}
              onChange={event => this.handleAttribute(event.target.value)} 
            >
            {attributes.map(a => 
              <MenuItem key={a} value={a}>{a}</MenuItem>
            )}
            </Select>
          </FormControl>
        </div>
        <ToggleButtonGroup value={this.state.style.mapping}>
          <Tooltip title="Passthrough Mapping">
            <ToggleButton value={MAPPING.PASSTHROUGH}>
              {"1 : 1"}
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Continuous Mapping">
            <ToggleButton value={MAPPING.LINEAR}>
              <TrendingUpIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Discrete Mapping">
            <ToggleButton value={MAPPING.DISCRETE}>
              <FormatListNumberedIcon />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
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