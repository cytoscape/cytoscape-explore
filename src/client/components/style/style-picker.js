import React from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Tabs, Tab, Select, MenuItem, InputLabel, FormControl, Paper, Tooltip} from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
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
    const style = this.props.getStyle();
    this.setState({ 
      initialized: true,
      tab: style.mapping == MAPPING.VALUE ? TAB.VALUE : TAB.MAPPING
    });
    switch(style.mapping) {
      case MAPPING.VALUE:
        this.setState({ style: {
          mapping: MAPPING.VALUE,
          scalarValue: style.value
        }});
        break;
      case MAPPING.PASSTHROUGH:
        this.setState({ style: {
          mapping: MAPPING.PASSTHROUGH,
          attribute: style.value.data
        }});
        break;
      case MAPPING.LINEAR:
        this.setState({ style: {
          mapping: MAPPING.LINEAR,
          attribute: style.value.data,
          mappingValue: style.value,
        }});
        break;
      case MAPPING.DISCRETE:
        this.setState({ style: {
          mapping: MAPPING.DISCRETE,
          attribute: style.value.data,
          discreteValue: style.value
        }});
        break;
    }
  }

  onStyleChanged(style) {
    console.log(style);
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
    const change = { style: { ...this.state.style, mapping: MAPPING.VALUE, scalarValue } };
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  handleMapping(mapping) {
    const change = { style: { ...this.state.style, mapping } };
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  handleAttribute(attribute) {
    const change = { style: { ...this.state.style, attribute } };
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  handleMappingValue(mappingValue){
    const change = { style: { ...this.state.style, mappingValue } };
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  handleDiscreteValue(discreteValue){
    const change = { style: { ...this.state.style, discreteValue } };
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
      <div>
        <div className="style-picker-mapping-box">
          <div style={{paddingRight:'15px'}}>
            <FormControl style={{minWidth: 150}}>
              <InputLabel id="attribute-select-label">Attribute</InputLabel>
              <Select
                labelId="attribute-select-label"
                value={this.state.style.attribute || ''}
                onChange={event => this.handleAttribute(event.target.value)} 
              >
              {attributes.map(a => 
                <MenuItem key={a} value={a}>{a}</MenuItem>
              )}
              </Select>
            </FormControl>
          </div>
          <ToggleButtonGroup 
            exclusive={true}
            value={this.state.style.mapping}
            onChange={(event,value) => this.handleMapping(value)}
            >
            { !this.props.onPassthroughSet ? null :
              <ToggleButton value={MAPPING.PASSTHROUGH} >
                <Tooltip title="Passthrough Mapping">
                  <span>{"1 : 1"}</span>
                </Tooltip>
              </ToggleButton>
            }
            { !this.props.onMappingSet ? null :
              <ToggleButton value={MAPPING.LINEAR}>
                <Tooltip title="Continuous Mapping">
                  <TrendingUpIcon />
                </Tooltip>
              </ToggleButton>
            }
            { /* !this.props.onDiscreteSet ? null : */
              <ToggleButton value={MAPPING.DISCRETE}>
                <Tooltip title="Discrete Mapping">
                  <FormatListNumberedIcon />
                </Tooltip>
              </ToggleButton>
            }
          </ToggleButtonGroup>
        </div>
        {(() => {
          if(!this.state.style.attribute)
            return null;
          else if(this.state.style.mapping === MAPPING.PASSTHROUGH)
            return null;
          else if(this.state.style.mapping === MAPPING.LINEAR)
            return this.renderSubComponent_Linear();
          else if(this.state.style.mapping === MAPPING.DISCRETE)
            return this.renderDiscrete();
        })()}
      </div>
    );
  }

  renderDiscrete() {
    // TODO Don't hardcode the 'node' selector.
    const vals = this.controller.getDiscreteValueList('node', this.state.style.attribute);
    const style = {
      width: '100%',
      position: 'relative',
      overflow: 'auto',
      maxHeight: 300,
    };

    return (
      <List style={style} dense={true}>
        {vals.map(val => {
          const onClick = () => {
            console.log("clicked: " + val);
          };
          return (
            <ListItem key={val}>
              <ListItemText primary={val} />
              <ListItemSecondaryAction>
                {this.props.renderDiscrete({r:150,g:150,b:150}, onClick)}
              </ListItemSecondaryAction>
            </ListItem>
          );})
        }
      </List>
    );
  }

}

StylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  renderMapping: PropTypes.func,
  renderValue: PropTypes.func,
  renderDiscrete: PropTypes.func,
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