import React from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Tabs, Tab, Paper, Tooltip, Popover } from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import AttributeSelect from '../network-editor/attribute-select';
import { MAPPING } from '../../../model/style';


const TAB = {
  VALUE: 'VALUE',
  MAPPING: 'MAPPING'
};

export class StylePicker extends React.Component { 

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.attributes = this.controller.getPublicAttributes(props.selector);

    this.state = {
      // internal state
      initialized: false,
      tab: TAB.VALUE,
      // discrete value popover state
      popoverAnchorEl: null,
      popoverDataVal: null,
      popoverStyleVal: null,
      // style state
      style: {
        mapping: MAPPING.VALUE,
        discreteValue: {},
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
          discreteDefault: style.value.defaultValue,
          discreteValue: { ...style.value.styleValues } // TODO do we need to use spread op?
        }});
        break;
    }
    // Temporary non-complete fix for bug in material-ui Tabs component.
    // https://github.com/mui-org/material-ui/issues/9337
    setTimeout(() => window.dispatchEvent(new CustomEvent('resize')));
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

  handleTabChange(tab) {
    this.setState({ tab });
   
    // Auto select the mapping type in obvious situations
    const { onMappingSet, onDiscreteSet, onPassthroughSet } = this.props;
    let mapping;

    if(tab === TAB.VALUE)
      mapping = MAPPING.VALUE;
    else if(onMappingSet && !onDiscreteSet && !onPassthroughSet)
      mapping = MAPPING.LINEAR;
    else if(!onMappingSet && onDiscreteSet && !onPassthroughSet)
      mapping = MAPPING.DISCRETE;
    else if(!onMappingSet && !onDiscreteSet && onPassthroughSet)
      mapping = MAPPING.PASSTHROUGH;

    if(mapping)
      this.handleStyleChange({ mapping });
  }

  handleStyleChange(changes) {
    const change = { style: {...this.state.style, ...changes }};
    this.setState(change);
    this.onStyleChanged(change.style);
  }


  render() {
    if(!this.state.initialized)
      return null;
    return this.renderTabs();
  }

  renderTabs() {
    return (
      <div className="style-picker">
        <Paper>
          <div className="style-picker-heading">
            {this.props.title || "Visual Property"}
          </div>
          <Tabs 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            value={this.state.tab} 
            onChange={(event, tab) => this.handleTabChange(tab)} >
            <Tab value={TAB.VALUE}   label='Default' />
            <Tab value={TAB.MAPPING} label='Mapping' />
          </Tabs>
        </Paper>
        { this.state.tab === TAB.VALUE
          ? this.renderSubComponentValue()
          : this.renderMapping()
        }
      </div>
    );
  }

  renderSubComponentValue() {
    const onSelect = scalarValue => this.handleStyleChange( { mapping: MAPPING.VALUE, scalarValue } );
    return (
      <div className="style-picker-value"> 
        { this.props.renderValue(this.state.style.scalarValue, onSelect) }
      </div>
    );
  }

  renderMapping() {
    const handleAttribute = (attribute) => this.handleStyleChange({ attribute });
    const handleMapping = (mapping) => this.handleStyleChange({ mapping });
    
    return (
      <div>
        <div className="style-picker-mapping-box">
          <div style={{ paddingRight:'15px' }}>
            <AttributeSelect
              controller={this.controller}
              selector={this.props.selector}
              selectedAttribute={this.state.style.attribute}
              onChange={handleAttribute}
            />
          </div>
          <ToggleButtonGroup 
            exclusive={true}
            value={this.state.style.mapping}
            onChange={(event,value) => handleMapping(value)}
            >
            { !this.props.onPassthroughSet ? null :
              <ToggleButton value={MAPPING.PASSTHROUGH} >
                <Tooltip title="Passthrough Mapping">
                  <span>1 : 1</span>
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
            { !this.props.onDiscreteSet ? null :
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
            return this.renderSubComponentLinear();
          else if(this.state.style.mapping === MAPPING.DISCRETE)
            return this.renderDiscrete();
        })()}
      </div>
    );
  }

  renderSubComponentLinear() {
    // TODO change to 'props.renderLinear'
    const onSelect = mappingValue => this.handleStyleChange({ mappingValue });
    return (
        <div className="style-picker-value">
         { this.props.renderMapping(this.state.style.mappingValue, onSelect) }
        </div>
    );
  }

  renderDiscrete() {
    const dataVals = this.controller.getDiscreteValueList(this.props.selector, this.state.style.attribute);
    
    const handlePopoverOpen = (event, dataVal, styleVal) => {
      this.setState({ 
        popoverAnchorEl: event.currentTarget,
        popoverDataVal: dataVal,
        popoverStyleVal: styleVal,
      });
    };
    const handlePopoverClose = () => {
      this.setState({
        popoverAnchorEl: null,
        popoverDataVal: null,
        popoverStyleVal: null,
      });
    };
    const handleDiscreteChange = (dataVal, newStyleVal) => {
      const discreteValue = { ...this.state.style.discreteValue };
      discreteValue[dataVal] = newStyleVal;
      this.setState({ popoverStyleVal: newStyleVal });
      this.handleStyleChange({ discreteValue });
    };
    const discreteDefault = this.props.getDiscreteDefault();

    return (
      <div>
        <List 
          // This style causes this List to scroll and not the entire Popover from the StylePickerButton
          style={{ width: '100%', position: 'relative', overflow: 'auto', maxHeight: 300 }} 
          dense={true}
        >
          {dataVals.map(dataVal => {
            const styleVal = (this.state.style.discreteValue || {})[dataVal] || discreteDefault;
            return (
              <ListItem key={dataVal}>
                <ListItemText primary={dataVal} />
                <ListItemSecondaryAction>
                  <div onClick={(event) => handlePopoverOpen(event, dataVal, styleVal)}>
                    { this.props.renderDiscreteIcon(styleVal) }
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
            );})
          }
        </List>
        <Popover 
          open={Boolean(this.state.popoverAnchorEl)}
          anchorEl={this.state.popoverAnchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div className="style-picker-value"> 
            { this.props.renderValue(
                this.state.popoverStyleVal, // this just tells component in the popover the current value to highlight
                newStyleVal => handleDiscreteChange(this.state.popoverDataVal, newStyleVal)
              ) 
            }
          </div>
        </Popover>
      </div>
    );
  }

}

StylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  renderMapping: PropTypes.func,
  renderValue: PropTypes.func,
  renderDiscreteIcon: PropTypes.func,
  getStyle: PropTypes.func,
  getDiscreteDefault: PropTypes.func,
  onValueSet: PropTypes.func,
  onMappingSet: PropTypes.func,
  onDiscreteSet: PropTypes.func,
  onPassthroughSet: PropTypes.func,
  title: PropTypes.string,
  icon: PropTypes.string,
  selector: PropTypes.oneOf(['node', 'edge']),
};
StylePicker.defaultProps = {
  selector: 'node',
  icon: 'star',
};

export default StylePicker;