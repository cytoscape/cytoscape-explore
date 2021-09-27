import React from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Popover, Button, Paper } from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { FormControl, Select } from "@material-ui/core";
import AttributeSelect from '../network-editor/attribute-select';
import { MAPPING } from '../../../model/style';


export function StylePanel({ title, children }) {
  return (
    <div>
      <div className="style-picker-heading">
        {title || "Style Panel"}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
StylePanel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any
};



export function StyleSection({ title, children }) {
  return (
    <div>
      <hr/>
      <b>{title || "style section"}</b>
      <div style={{ padding: '5px', paddingBottom: '15px'} }>
        {children}
      </div>
    </div>
  );
}
StyleSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any
};




class StylePopoverButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      popoverAnchorEl: null,
      popoverDataVal: null,
      popoverStyleVal: null,
    };
  }

  render() {
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

    const { dataVal, styleVal } = this.props;

    return (
      // TODO: The onClick handler on the top div is problematic, 
      // clicking anywhere in the div opens the popup, and the positioning is sometimes wrong.
      // Should probably get a reference to the discrete icon, or pass the onClick handler down to the icon.
      <div> 
        <div 
          style={{ padding: '5px', textAlign: 'left' }}
          onClick={(event) => handlePopoverOpen(event, dataVal, styleVal)} 
        >
          { this.props.renderButton(styleVal) }
        </div>
        <Popover 
          open={Boolean(this.state.popoverAnchorEl)}
          anchorEl={this.state.popoverAnchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div style={{ padding: '10px', backgroundColor: 'white'}}> 
            { this.props.renderPicker(
                this.state.popoverStyleVal, // this just tells component in the popover the current value to highlight
                newStyleVal => this.props.handleChange(newStyleVal, this.state.popoverDataVal)
              ) 
            }
          </div>
        </Popover>
      </div>
    );
  }
}
StylePopoverButton.propTypes = {
  dataVal: PropTypes.any,
  styleVal: PropTypes.any,
  renderButton: PropTypes.func,
  renderPicker: PropTypes.func,
  handleChange: PropTypes.func,
};


// TODO: change the name of this enum
const TAB = {
  MAPPING: 'MAPPING',
  BYPASSING: 'BYPASSING'
};


export class StylePicker extends React.Component { 

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.attributes = this.controller.getPublicAttributes(props.selector);

    // Hook into the event bus to control the lifecycle!!!!
    // Need to know when selection changes in order to switch into bypass mode.
    // Need to know when style changes in order to support collaborative editing.
    //    -- This is tricky because we don't want a circular event loop

    const numSelected = this.controller.bypassCount(this.props.selector);

    if(numSelected > 0) {
      this.state = { 
        tab: TAB.BYPASSING,
        style: {
          mapping: MAPPING.VALUE,
          discreteValue: {},
        },
        numSelected
      };
      return;
    }

    const style = this.props.getStyle();

    switch(style.mapping) {
      case MAPPING.VALUE:
        this.state = { style: {
            mapping: MAPPING.VALUE,
            scalarValue: style.value
        }};
        break;
      case MAPPING.PASSTHROUGH:
        this.state = { style: {
          mapping: MAPPING.PASSTHROUGH,
          attribute: style.value.data
        }};
        break;
      case MAPPING.LINEAR:
        this.state = { style: {
          mapping: MAPPING.LINEAR,
          attribute: style.value.data,
          mappingValue: style.value.styleValues,
        }};
        break;
      case MAPPING.DISCRETE:
        this.state = { style: {
          mapping: MAPPING.DISCRETE,
          attribute: style.value.data,
          discreteDefault: style.value.defaultValue,
          discreteValue: { ...style.value.styleValues } // TODO do we need to use spread op?
        }};
        break;
    }
    this.state.tab = TAB.MAPPING;
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

  handleStyleChange(changes) {
    const change = { style: {...this.state.style, ...changes }};
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  render() {
    if(this.state.tab === TAB.BYPASSING)
      return this.renderBypass();
    else
      return this.renderStyleTypeSelector();
  }

  getBypassElementLabel() {
    const { numSelected } = this.state;
    const { selector } = this.props;
    return numSelected == 1
      ? selector == 'node' ? "node" : "edge"
      : selector == 'node' ? "nodes" : "edges";
  }

  renderBypass() {
    return (
      <div className="style-picker">
        { this.renderSubComponentValue() }
        <div style={{ paddingBottom:'15px' }}>
          <Button 
            variant="contained"
            onClick={() => this.props.onValueSet(null)}>
            Remove Bypass
          </Button>
        </div>
      </div>
    );
  }

  renderStyleTypeSelector() {
    const handleMappingTypeChange = (mapping) => {
      this.handleStyleChange({ mapping });
    };
    return (
      <div className="style-picker">
        <FormControl style={{ width: '100%' }} size="small" variant="outlined">
          <Select
            native
            value={this.state.style.mapping}
            onChange={event => handleMappingTypeChange(event.target.value)}
          >
            {
              <option key={MAPPING.VALUE} value={MAPPING.VALUE}>{this.props.valueLabel}</option>
            } 
            { !this.props.onMappingSet ? null :
              <option key={MAPPING.LINEAR} value={MAPPING.LINEAR}>{this.props.mappingLabel}</option>
            }
            { !this.props.onPassthroughSet ? null :
              <option key={MAPPING.PASSTHROUGH} value={MAPPING.PASSTHROUGH}>{this.props.passthroughLabel}</option>
            }
            { !this.props.onDiscreteSet ? null :
              <option key={MAPPING.DISCRETE} value={MAPPING.DISCRETE}>{this.props.discreteLabel}</option>
            }
          </Select>
        </FormControl>
        { this.state.style.mapping == MAPPING.VALUE
          ? this.renderSubComponentValue()
          : this.renderMapping()
        }
      </div>
    );
  }

  renderSubComponentValue() {
    const handleChange = scalarValue => this.handleStyleChange( { mapping: MAPPING.VALUE, scalarValue } );
    return (
      <div style={{ paddingTop: '5px' }}>
        <StylePopoverButton 
          handleChange={handleChange}
          dataVal={0} 
          styleVal={this.state.style.scalarValue} 
          renderButton={this.props.renderValueButton}
          renderPicker={this.props.renderValuePicker}
        />
      </div>
    );
  }

  renderMapping() {
    const handleAttribute = (attribute) => this.handleStyleChange({ attribute });
    const handleMapping = (mapping) => this.handleStyleChange({ mapping });
    
    return (
      <div>
          <div style={{ width: '100%' }}>
            <AttributeSelect
              controller={this.controller}
              selector={this.props.selector}
              selectedAttribute={this.state.style.attribute}
              onChange={handleAttribute}
            />
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
    const handleMappingChange = mappingValue => this.handleStyleChange({ mappingValue });
    return (
      <StylePopoverButton 
        handleChange={handleMappingChange} 
        styleVal={this.state.style.mappingValue} 
        renderButton={this.props.renderMappingButton}
        renderPicker={this.props.renderMappingPicker}
      />
    );
  }

  renderDiscrete() {
    const dataVals = this.controller.getDiscreteValueList(this.props.selector, this.state.style.attribute);
    const discreteDefault = this.props.getDiscreteDefault();

    const handleDiscreteChange = (dataVal, newStyleVal) => {
      const discreteValue = { ...this.state.style.discreteValue };
      discreteValue[dataVal] = newStyleVal;
      // this.setState({ popoverStyleVal: newStyleVal });
      this.handleStyleChange({ discreteValue });
    };

    return (
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
                <StylePopoverButton 
                  handleChange={handleDiscreteChange} 
                  dataVal={dataVal} 
                  styleVal={styleVal} 
                  renderButton={this.props.renderValueButton}
                  renderPicker={this.props.renderValuePicker}
                />
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
  selector: PropTypes.oneOf(['node', 'edge']),
  renderMappingPicker: PropTypes.func,
  renderMappingButton: PropTypes.func,
  renderValuePicker: PropTypes.func,
  renderValueButton: PropTypes.func,
  getStyle: PropTypes.func,
  getDiscreteDefault: PropTypes.func,
  onValueSet: PropTypes.func,
  onMappingSet: PropTypes.func,
  onDiscreteSet: PropTypes.func,
  onPassthroughSet: PropTypes.func,
  title: PropTypes.string,
  icon: PropTypes.string,
  valueLabel: PropTypes.string,
  mappingLabel: PropTypes.string,
  passthroughLabel: PropTypes.string,
  discreteLabel: PropTypes.string,
};
StylePicker.defaultProps = {
  selector: 'node',
  valueLabel: 'Single Value',
  mappingLabel: 'Continuous Mapping',
  passthroughLabel: 'Passthrough Mapping',
  discreteLabel: 'Discrete Mapping',
};

export default StylePicker;