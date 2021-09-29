import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button } from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { FormControl, Select } from "@material-ui/core";
import { NetworkEditorController } from '../network-editor/controller';
import AttributeSelect from '../network-editor/attribute-select';
import { MAPPING } from '../../../model/style';
import { ColorSwatch, ColorSwatches, ColorGradient, ColorGradients } from '../style/colors';
import { ShapeIcon, ShapeIconGroup } from '../style/shapes';
import { SizeSlider, SizeGradients, SizeGradient } from '../style/sizes';


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


export class MappingAndAttributeSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mapping: props.mapping,
      attribute: props.attribute
    };
  }

  render() {
    const handleMappingTypeChange = (mapping) => {
      this.setState({ mapping });
      this.props.onChange(mapping, this.state.attribute);
    };
    const handleAttributeChange = (attribute) => {
      this.setState({ attribute });
      this.props.onChange(this.state.mapping, attribute);
    };

    return (
      <div>
        <FormControl style={{ width: '100%' }} size="small" variant="outlined">
          <Select
            native
            value={this.state.mapping}
            onChange={event => handleMappingTypeChange(event.target.value)}
          >
            {
              <option key={MAPPING.VALUE} value={MAPPING.VALUE}>{this.props.valueLabel}</option>
            } 
            { !this.props.continuous ? null :
              <option key={MAPPING.LINEAR} value={MAPPING.LINEAR}>{this.props.mappingLabel}</option>
            }
            { !this.props.passthrough ? null :
              <option key={MAPPING.PASSTHROUGH} value={MAPPING.PASSTHROUGH}>{this.props.passthroughLabel}</option>
            }
            { !this.props.discrete ? null :
              <option key={MAPPING.DISCRETE} value={MAPPING.DISCRETE}>{this.props.discreteLabel}</option>
            }
          </Select>
        </FormControl>
        { this.state.mapping === MAPPING.VALUE ? null :
          <div style={{ width: '100%' }}>
            <AttributeSelect
              controller={this.props.controller}
              selector={this.props.selector}
              selectedAttribute={this.state.attribute}
              onChange={handleAttributeChange}
            />
          </div>
        }
      </div>
    );
  }
}
MappingAndAttributeSelector.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  mapping: PropTypes.any, // MAPPING from style.js
  attribute: PropTypes.string, // Name of the attribute, or null
  onChange: PropTypes.func,
  continuous: PropTypes.bool,
  discrete: PropTypes.bool,
  passthrough: PropTypes.bool,
  valueLabel: PropTypes.string,
  mappingLabel: PropTypes.string,
  passthroughLabel: PropTypes.string,
  discreteLabel: PropTypes.string,
};
MappingAndAttributeSelector.defaultProps = {
  selector: 'node',
  valueLabel: 'Single Value',
  mappingLabel: 'Continuous Mapping',
  passthroughLabel: 'Passthrough Mapping',
  discreteLabel: 'Discrete Mapping',
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
      return this.renderNormal();
  }

  renderBypass() {
    return (
      <div className="style-picker">
        { this.renderValue() }
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

  renderNormal() {
    return (
      <div className="style-picker">
        <MappingAndAttributeSelector
          {...this.props}
          continuous={Boolean(this.props.onMappingSet)}
          discrete={Boolean(this.props.onDiscreteSet)}
          passthrough={Boolean(this.props.onPassthroughSet)}
          mapping={this.state.style.mapping}
          attribute={this.state.style.attribute}
          onChange={(mapping, attribute) => this.handleStyleChange({ mapping, attribute })}
        />
        {(() => {
          const { attribute, mapping } = this.state.style;
          if(mapping === MAPPING.VALUE)
            return this.renderValue();
          else if(!attribute)
            return null;
          else if(mapping === MAPPING.LINEAR)
            return this.renderContinuous();
          else if(mapping === MAPPING.DISCRETE)
            return this.renderDiscrete();
        })()}
      </div>
    );
  }

  renderValue() {
    const handleChange = scalarValue => this.handleStyleChange( { mapping: MAPPING.VALUE, scalarValue } );
    return <StylePopoverButton 
      handleChange={handleChange}
      dataVal={0} 
      styleVal={this.state.style.scalarValue} 
      renderButton={this.props.renderValueButton}
      renderPicker={this.props.renderValuePicker}
    />;
  }

  renderContinuous() {
    const handleMappingChange = mappingValue => this.handleStyleChange({ mappingValue });
    return <StylePopoverButton 
      handleChange={handleMappingChange} 
      styleVal={this.state.style.mappingValue} 
      renderButton={this.props.renderMappingButton}
      renderPicker={this.props.renderMappingPicker}
    />;
  }

  renderDiscrete() {
    const dataVals = this.controller.getDiscreteValueList(this.props.selector, this.state.style.attribute);
    const discreteDefault = this.props.getDiscreteDefault();

    const handleDiscreteChange = (dataVal, newStyleVal) => {
      const discreteValue = { ...this.state.style.discreteValue };
      discreteValue[dataVal] = newStyleVal;
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
  getMappingDefault: PropTypes.func,
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



export function ColorStylePicker({ controller, selector, styleProps }) {
  return <StylePicker
    controller={controller}
    selector={selector}
    valueLabel="Single Color"
    mappingLabel="Color Gradient"
    discreteLabel="Color per Data Value"
    renderValueButton={color => 
      <ColorSwatch color={color} />
    }
    renderValuePicker={(color, onSelect) => 
      <ColorSwatches selected={color} onSelect={onSelect} />
    }
    renderMappingButton={(gradient) => 
      <ColorGradient value={gradient} /> 
    }
    renderMappingPicker={(gradient, onSelect) => 
      <ColorGradients selected={gradient} onSelect={onSelect} /> 
    }
    getStyle={() => 
      controller.getStyle(selector, styleProps[0])
    }
    getDiscreteDefault={() =>
      controller.getDiscreteDefault(selector, styleProps[0])
    }
    onValueSet={color => 
      styleProps.forEach(p => controller.setColor(selector, p, color))
    }
    onMappingSet={(attribute, gradient) => 
      styleProps.forEach(p => controller.setColorLinearMapping(selector, p, attribute, gradient))
    }
    onDiscreteSet={(attribute, valueMap) => 
      styleProps.forEach(p => controller.setColorDiscreteMapping(selector, p, attribute, valueMap))
    }
  />;
}
ColorStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProps: PropTypes.array
};


export function ShapeStylePicker({ controller, selector, styleProp }) {
  return (
    <StylePicker 
      controller={controller}
      selector={selector}
      valueLabel="Single Shape"
      discreteLabel="Shape per Data Value"
      renderValueButton={(shape) => 
        <ShapeIcon type={selector} shape={shape} />
      }
      renderValuePicker={(shape, onSelect) => 
        <ShapeIconGroup type={selector} selected={shape} onSelect={onSelect} />
      }
      getStyle={() => 
        controller.getStyle(selector, styleProp)
      }
      getDiscreteDefault={() =>
        controller.getDiscreteDefault(selector, styleProp)
      }
      onValueSet={shape => 
        controller.setString(selector, styleProp, shape)
      }
      onDiscreteSet={(attribute, valueMap) => {
        controller.setStringDiscreteMapping(selector, styleProp,  attribute, valueMap);
      }}
    />
  );
}
ShapeStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProp: PropTypes.string
};



export function SizeStylePicker({ controller, selector, variant, styleProps }) {
  return (
    <StylePicker
      valueLabel="Single Size"
      mappingLabel="Size Mapping"
      discreteLabel="Sized per Data Value"
      controller={controller}
      selector={selector}
      renderValueButton={(size) => 
        <Button variant="outlined">{size}</Button>
      }
      renderValuePicker={(size, onSelect) => 
        <SizeSlider min={10} max={50} defaultValue={size} onSelect={onSelect} /> 
      }
      renderMappingButton={(sizeRange) => 
        <SizeGradient selected={sizeRange} /> 
      } 
      renderMappingPicker={(sizeRange, onSelect) => 
        <SizeGradients variant={variant} min={10} max={50} selected={sizeRange} onSelect={onSelect} /> 
      } 
      getStyle={() => 
        controller.getStyle(selector, styleProps[0])
      }
      getDiscreteDefault={() =>
        controller.getDiscreteDefault(selector, styleProps[0])
      }
      onValueSet={size =>
        styleProps.forEach(p => controller.setNumber(selector, p,  size))
      }
      onMappingSet={(attribute, sizeRange) =>
        styleProps.forEach(p => controller.setNumberLinearMapping(selector, p,  attribute, sizeRange))
      }
      onDiscreteSet={(attribute, valueMap) =>
        styleProps.forEach(p => controller.setNumberDiscreteMapping(selector, p,  attribute, valueMap))
      }
    />
  );
}
SizeStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProps: PropTypes.array,
  variant: PropTypes.oneOf(['solid', 'border', 'line']),
};

export default StylePicker;