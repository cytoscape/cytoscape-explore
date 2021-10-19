import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, Tooltip } from "@material-ui/core";
import { List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { FormControl, Select } from "@material-ui/core";
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import AttributeSelect from '../network-editor/attribute-select';
import { MAPPING } from '../../../model/style';
import { ColorSwatch, ColorSwatches, ColorGradient, ColorGradients } from '../style/colors';
import { ShapeIcon, ShapeIconGroup } from '../style/shapes';
import { SizeSlider, SizeGradients, SizeGradient, AspectRatioPicker } from '../style/sizes';
import { LabelInput, PositionButton, LabelPosition, stylePropsToLabelPos, LABEL_POS } from '../style/labels';



export class StylePanel extends React.Component {
  constructor(props) {
    super(props);
    this.cyEmitter = new EventEmitterProxy(this.props.controller.cy);
    this.cyEmitter.on('select unselect', () => {
      const numSelected = this.props.controller.bypassCount(this.props.selector);
      this.setState({ numSelected });
    }) ;
    const numSelected = this.props.controller.bypassCount(this.props.selector);
    this.state = { numSelected };
  }

  componentWillUnmount() {
    this.cyEmitter.removeAllListeners();
  }

  getBypassMessage() {
    const { selector } = this.props;
    const { numSelected } = this.state;
    if(numSelected == 1)
      return "1 " + (selector == 'node' ? "node" : "edge") + " selected";
    return numSelected + " " + (selector == 'node' ? "nodes" : "edges") + " selected";
  }

  render() {
    return (
      <div>
        <div className="style-picker-heading">
          { this.props.title || "Style Panel" }
        </div>
        { this.state.numSelected > 0 
          ? <div style={{ textAlign: 'center' }}>{ this.getBypassMessage() }</div> 
          : null 
        }
        <div>
          { this.props.children }
        </div>
      </div>
    );
  }
}
StylePanel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  selector: PropTypes.oneOf(['node', 'edge']),
  controller: PropTypes.instanceOf(NetworkEditorController),
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
      styleVal: props.styleVal,
    };
  }

  render() {
    const handlePopoverOpen = (event) => {
      this.setState({ popoverAnchorEl: event.currentTarget });
    };
    const handlePopoverClose = () => {
      this.setState({ popoverAnchorEl: null });
    };
    const handleChange = (styleVal) => {
      this.props.handleChange(styleVal);
      this.setState({ styleVal });
    };

    const { styleVal } = this.state;
    return (
      // TODO: The onClick handler on the top div is problematic, 
      // clicking anywhere in the div opens the popup, and the positioning is sometimes wrong.
      // Should probably get a reference to the discrete icon, or pass the onClick handler down to the icon.
      <div> 
        <div 
          style={{ padding: '5px', textAlign: 'left' }}
          onClick={handlePopoverOpen}
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
          <div style={{ padding: '10px' }}> 
            { this.props.renderPopover(styleVal, handleChange) }
          </div>
        </Popover>
      </div>
    );
  }
}
StylePopoverButton.propTypes = {
  styleVal: PropTypes.any,
  renderButton: PropTypes.func,
  renderPopover: PropTypes.func,
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


export class StylePicker extends React.Component { 

  constructor(props) {
    super(props);
    this.controller = props.controller; 

    this.cyEmitter = new EventEmitterProxy(props.controller.cy);
    // TODO debounce?
    this.cyEmitter.on('select unselect', () => this.onSelectionChange());

    const numSelected = props.controller.bypassCount(this.props.selector);
    if(numSelected > 0)
      this.state = this.getBypassingState(numSelected);
    else
      this.state = this.getMappingState();
  }

  componentWillUnmount() {
    this.cyEmitter.removeAllListeners();
  }

  onSelectionChange() {
    this.refreshStyleState();
  }

  refreshStyleState() {
    // Synchronize the style state from the style model.
    const numSelected = this.controller.bypassCount(this.props.selector);
    if(numSelected > 0)
      this.setState(this.getBypassingState(numSelected));
    else
      this.setState(this.getMappingState());
  }

  getBypassingState(numSelected) {
    const state = { 
      bypassing: true,
      numSelected,
      style: {},
    };

    const bypassStyle = this.props.getBypassStyle();
    
    // If all the selected elements have the same value.
    if(bypassStyle.length == 1) {
      const scalarValue = bypassStyle[0].styleVal;
      if(scalarValue == 'unset') {
        state.bypassType = 'all-unset';
      } else {
        // add this so that renderValue() will work.
        state.style = { 
          mapping: MAPPING.VALUE,
          scalarValue,
        };
        state.bypassType = 'all-same';
      }
    } else {
      state.bypassType = 'mixed';
    }
    return state;
  }

  getMappingState() {
    const style = this.props.getStyle();
    switch(style.mapping) {
      case MAPPING.VALUE:
        return { 
          bypassing: false,
          style: {
            mapping: MAPPING.VALUE,
            scalarValue: style.value
          }};
      case MAPPING.PASSTHROUGH:
        return { 
          bypassing: false,
          style: {
            mapping: MAPPING.PASSTHROUGH,
            attribute: style.value.data
          }};
      case MAPPING.LINEAR:
        return { 
          bypassing: false,
          style: {
            mapping: MAPPING.LINEAR,
            attribute: style.value.data,
            mappingValue: style.value.styleValues,
          }};
      case MAPPING.DISCRETE:
        return { 
          bypassing: false,
          style: {
            mapping: MAPPING.DISCRETE,
            attribute: style.value.data,
            discreteDefault: style.value.defaultValue,
            discreteValue: { ...style.value.styleValues } // TODO do we need to use spread op?
          }};
    }
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
    console.log(JSON.stringify(changes));
    const change = { style: {...this.state.style, ...changes }};
    this.setState(change);
    this.onStyleChanged(change.style);
  }

  render() {
    return this.state.bypassing
      ? this.renderBypass()
      : this.renderNormal();
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
    return this.props.renderValue(this.state.style.scalarValue, handleChange);
  }

  renderContinuous() {
    const handleMappingChange = mappingValue => this.handleStyleChange({ mappingValue });
    return this.props.renderMapping(this.state.style.mappingValue, handleMappingChange);
  }

  renderDiscrete() {
    const dataVals = this.controller.getDiscreteValueList(this.props.selector, this.state.style.attribute);
    const discreteDefault = this.props.getDiscreteDefault();
    return (
      <List 
        // This style causes this List to scroll and not the entire Popover from the StylePickerButton
        style={{ width: '100%', position: 'relative', overflow: 'auto', maxHeight: 300 }} 
        dense={true}
      >
        {dataVals.map(dataVal => {
          const styleVal = (this.state.style.discreteValue || {})[dataVal] || discreteDefault;
          let dataValText = String(dataVal);
          let abbreviated = false;
          if(dataValText.length > 10) {
            dataValText = dataValText.slice(0, 9) + "...";
            abbreviated = true;
          }
          const handleChange = (newStyleVal) => {
            const discreteValue = { ...this.state.style.discreteValue };
            discreteValue[dataVal] = newStyleVal;
            this.handleStyleChange({ discreteValue });
          };
          return (
            <ListItem key={dataVal}>
              { abbreviated
                ? <Tooltip title={dataVal}><ListItemText primary={dataValText}/></Tooltip>
                : <ListItemText primary={dataValText} />
              }
              <ListItemSecondaryAction>
                { this.props.renderDiscrete
                  ? this.props.renderDiscrete(styleVal, handleChange)
                  : this.props.renderValue(styleVal, handleChange)
                }
              </ListItemSecondaryAction>
            </ListItem>
          );})
        }
        </List>
    );
  }

  renderBypass() {
    const BypassButton = ({ variant }) => {
      const scalarValue = variant == 'add' ? this.props.getDiscreteDefault() : null;
      const onClick = () => { 
        this.handleStyleChange({ mapping: MAPPING.VALUE, scalarValue });
        this.refreshStyleState();
      };
      return <Button variant="outlined" size="small" style={{marginTop:'10px'}} onClick={onClick}>
        { variant == 'add' ? 'Add Bypass' : 'Remove Bypass' }
      </Button>;
    };

    const { bypassType } = this.state;
    if(bypassType == 'mixed') {
      return <div>
        The selected elements have different bypass values.
        <br />
        <BypassButton variant='remove' />
      </div>;
    } else if(bypassType == 'all-same') {
      return <div>
        { this.renderValue() }
        <BypassButton variant='remove' />
      </div>;
    } else if(bypassType == 'all-unset') {
      return <BypassButton variant='add' />; 
    }
  }
}

StylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  renderMapping: PropTypes.func,
  renderValue: PropTypes.func,
  renderDiscrete: PropTypes.func,
  getStyle: PropTypes.func,
  getBypassStyle: PropTypes.func,
  getDiscreteDefault: PropTypes.func,
  onValueSet: PropTypes.func,
  onMappingSet: PropTypes.func,
  onDiscreteSet: PropTypes.func,
  onPassthroughSet: PropTypes.func,
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
    renderValue={(currentColor, setColor) => 
      <StylePopoverButton 
        styleVal={currentColor}
        handleChange={setColor}
        renderButton={color => 
          <ColorSwatch color={color} />
        }
        renderPopover={(color, onSelect) => 
          <ColorSwatches selected={color} onSelect={onSelect} />
        }
      />
    }
    renderMapping={(currentGradient, setGradient) => 
      <StylePopoverButton 
        styleVal={currentGradient}
        handleChange={setGradient}
        renderButton={(gradient) => 
          <ColorGradient value={gradient} /> 
        }
        renderPopover={(gradient, onSelect) => 
          <ColorGradients selected={gradient} onSelect={onSelect} /> 
        }
      />
    }
    getStyle={() => 
      controller.getStyle(selector, styleProps[0])
    }
    getBypassStyle={() =>
      controller.getBypassStyle(selector, styleProps[0])
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


export function ShapeStylePicker({ controller, selector, styleProp, variant }) {
  let valueLabel, discreteLabel;
  if(variant == 'node') {
      valueLabel = "Single Shape";
      discreteLabel = "Shape per Data Value";
  } else if(variant == 'line') {
      valueLabel = "Same for all edges";
      discreteLabel = "Line style per Data Value";
  } else if(variant == 'arrow') {
      valueLabel = "Same for all edges";
      discreteLabel = "Line style per Data Value";
  }
  return <StylePicker 
    controller={controller}
    selector={selector}
    valueLabel={valueLabel}
    discreteLabel={discreteLabel}
    renderValue={(currentShape, setShape) => 
      <StylePopoverButton 
        styleVal={currentShape}
        handleChange={setShape}
        renderButton={(shape) => 
          <ShapeIcon type={variant} shape={shape} />
        }
        renderPopover={(shape, onSelect) => 
          <ShapeIconGroup type={variant} selected={shape} onSelect={onSelect} />
        }
      />
    }
    getStyle={() => 
      controller.getStyle(selector, styleProp)
    }
    getBypassStyle={() =>
      controller.getBypassStyle(selector, styleProp)
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
  />;
}
ShapeStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProp: PropTypes.string,
  variant: PropTypes.oneOf(['node', 'line', 'arrow']),
};



export function SizeStylePicker({ controller, selector, variant, styleProps }) {
  const [min, max] = 
    (variant == 'solid') ? [10, 50] : 
    (variant == 'text')  ? [10, 30] : 
    [0, 10];
  return <StylePicker
    valueLabel="Single Size"
    mappingLabel="Size Mapping"
    discreteLabel="Sized per Data Value"
    controller={controller}
    selector={selector}
    renderValue={(size, onSelect) => 
      <SizeSlider min={min} max={max} defaultValue={size} onSelect={onSelect} /> 
    }
    renderMapping={(minMax, setSize) =>
      <StylePopoverButton 
        styleVal={minMax}
        handleChange={setSize}
        renderButton={(sizeRange) => 
          <SizeGradient variant={variant} selected={sizeRange} reversed={minMax[0] > minMax[1]} /> 
        }
        renderPopover={(gradient, onSelect) =>
          <SizeGradients variant={variant} min={min} max={max} selected={gradient} onSelect={onSelect} />
        }
      />
    }
    renderDiscrete={(minMax, setSize) => 
      <StylePopoverButton 
        styleVal={minMax}
        handleChange={setSize}
        renderButton={size => 
          <Button variant='outlined'>{size}</Button>
        }
        renderPopover={(size, onSelect) => 
          <SizeSlider min={min} max={max} defaultValue={size} onSelect={onSelect} /> 
        }
      />
    }
    getStyle={() => 
      controller.getStyle(selector, styleProps[0])
    }
    getBypassStyle={() =>
      controller.getBypassStyle(selector, styleProps[0])
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
  />;
}
SizeStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProps: PropTypes.array,
  variant: PropTypes.oneOf(['solid', 'border', 'line', 'text']),
};


export class NodeSizeStylePicker extends React.Component {
  constructor(props) {
    super(props);
    // TODO need to initialize with the current style
    // TODO need to support bypassing
    // controller.getStyle(selector, 'width')
    const heightStyle = props.controller.getStyle('node', 'height');
    if(heightStyle.mapping !== MAPPING.DEPENDANT) {
      this.state = {
        error: true,
      };
    } else {
      this.state = {
        multiplier: heightStyle.value.multiplier
      };
    }
    this.handleMultiplier = this.handleMultiplier.bind(this);
  }

  handleMultiplier(multiplier) {
    const { controller } = this.props;
    controller.setNumberDependantMapping('node', 'height', 'width', multiplier);
    this.setState({ multiplier });
    console.log("handleMultiplier: " + multiplier);
  }

  render() {
    if(this.state.error) {
      return <div>Error</div>;  // TODO, how to handle the case that there are separate mappings????
    }
    const { controller } = this.props;
    const [min, max] =  [10, 50];
    const selector = 'node';
    return <StylePicker
      valueLabel="Single Size"
      mappingLabel="Size Mapping"
      discreteLabel="Sized per Data Value"
      controller={this.props.controller}
      selector={selector}
      renderValue={(size, onSelect) =>
        <div>
          <SizeSlider min={min} max={max} defaultValue={size} onSelect={onSelect} />
          <AspectRatioPicker multiplier={this.state.multiplier} onChange={this.handleMultiplier} />
        </div>
      }
      renderMapping={(minMax, setSize) =>
        <div>
          <StylePopoverButton 
            styleVal={minMax}
            handleChange={setSize}
            renderButton={(sizeRange) => 
              <SizeGradient variant='solid' selected={sizeRange} reversed={minMax && (minMax[0] > minMax[1])} /> 
            }
            renderPopover={(gradient, onSelect) =>
              <SizeGradients variant='solid' min={min} max={max} selected={gradient} onSelect={onSelect} />
            }
          />
          <AspectRatioPicker multiplier={this.state.multiplier} onChange={this.handleMultiplier} />
        </div>
      }
      renderDiscrete={(minMax, setSize) => 
        <div>
          <StylePopoverButton 
            styleVal={minMax}
            handleChange={setSize}
            renderButton={size => 
              <Button variant='outlined'>{size}</Button>
            }
            renderPopover={(size, onSelect) => 
              <SizeSlider min={min} max={max} defaultValue={size} onSelect={onSelect} /> 
            }
          />
          {/* <AspectRatioPicker multiplier={this.state.multiplier} onChange={this.handleMultiplier} /> */}
        </div>
      }
      getStyle={() => 
        controller.getStyle(selector, 'width')
      }
      getBypassStyle={() =>
        controller.getBypassStyle(selector, 'width')
      }
      getDiscreteDefault={() =>
        controller.getDiscreteDefault(selector, 'width')
      }
      onValueSet={size =>
        controller.setNumber(selector, 'width', size)
      }
      onMappingSet={(attribute, sizeRange) =>
        controller.setNumberLinearMapping(selector, 'width',  attribute, sizeRange)
      }
      onDiscreteSet={(attribute, valueMap) =>
        controller.setNumberDiscreteMapping(selector, 'width',  attribute, valueMap)
      }
    />;
  }
}
NodeSizeStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};


// export function AspectStylePicker({ controller, selector, styleProp }) {
//   return <StylePicker 
//     controller={controller}
//     selector={selector}
//     renderValue={(multiplier, onChange) =>
//       <AspectRatioPicker multiplier={multiplier} onChange={onChange} />
//     }
//     getStyle={() => 
//       controller.getStyle(selector, styleProp)
//     }
//     getBypassStyle={() =>
//       controller.getBypassStyle(selector, styleProp)
//     }
//     onValueSet={multipler => 
//       // controller.setString(selector, styleProp, text)
//       console.log("set the height multiplier: " + multipler)
//     }
//   />;
// }
// AspectStylePicker.propTypes = {
//   controller: PropTypes.instanceOf(NetworkEditorController),
//   selector: PropTypes.oneOf(['node', 'edge']),
//   styleProp: PropTypes.string
// };


export function TextStylePicker({ controller, selector, styleProp }) {
  return <StylePicker 
    controller={controller}
    selector={selector}
    passthroughLabel="Text Mapping"
    valueSet={"Same Label for all " + (selector == 'node' ? "nodes" : "edges")}
    renderValue={(text, onChange) =>
      <LabelInput value={text} onChange={onChange} />
    }
    getStyle={() => 
      controller.getStyle(selector, styleProp)
    }
    getBypassStyle={() =>
      controller.getBypassStyle(selector, styleProp)
    }
    onValueSet={text => 
      controller.setString(selector, styleProp, text)
    }
    onPassthroughSet={attribute => 
      controller.setStringPassthroughMapping(selector, styleProp, attribute)
    }
  />;
}
TextStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  selector: PropTypes.oneOf(['node', 'edge']),
  styleProp: PropTypes.string
};



export function NodeLabelPositionStylePicker({ controller }) {
  const selector = 'node';
  const defaultValue = LABEL_POS.TOP;
  return <StylePicker 
    controller={controller}
    selector={selector}
    valueLabel='Position'
    discreteLabel='Position per Data Value'
    renderValue={(value, setValue) => 
      <div style={{marginTop:'10px'}}>
        <LabelPosition value={value} onSelect={setValue} />
      </div>
    }
    renderDiscrete={(value, setValue) => 
      <StylePopoverButton 
        styleVal={value}
        handleChange={setValue}
        renderButton={(value) => 
          <PositionButton value={value} />
        }
        renderPopover={(value, onSelect) => 
          <LabelPosition value={value} onSelect={onSelect} />
        }
      />
    }
    getStyle={() => {
      const h = controller.getStyle(selector, 'text-halign');
      const v = controller.getStyle(selector, 'text-valign');
      if(h.mapping == MAPPING.DISCRETE) {
        const styleValues = {};
        for (const key of Object.keys(h.value.styleValues)) {
          const halign = h.value.styleValues[key];
          const valign = v.value.styleValues[key];
          const pos = stylePropsToLabelPos(halign, valign);
          styleValues[key] = pos;
        }
        return {
          type: 'STRING',
          mapping: MAPPING.DISCRETE,
          value: {
            data: h.value.data,
            defaultValue,
            styleValues,
          }
        };
      } else {
        return {
          type: 'STRING',
          mapping: MAPPING.VALUE,
          value: stylePropsToLabelPos(h.value, v.value)
        };
      }
    }}
    getBypassStyle={() => {
      const h = controller.getBypassStyle(selector, 'text-halign');
      const v = controller.getBypassStyle(selector, 'text-valign');
      return {
        type: 'STRING',
        mapping: MAPPING.VALUE,
        value: stylePropsToLabelPos(h.value, v.value)
      };
    }}
    onValueSet={pos => {
      controller.setString(selector, 'text-halign', pos.halign);
      controller.setString(selector, 'text-valign', pos.valign);
    }}
    onDiscreteSet={(attribute, valueMap) => {
      const halignMap = {};
      const valignMap = {};
      for (const [key, {halign, valign}] of Object.entries(valueMap)) {
        halignMap[key] = halign;
        valignMap[key] = valign;
      }
      controller.setStringDiscreteMapping(selector, 'text-halign', attribute, halignMap);
      controller.setStringDiscreteMapping(selector, 'text-valign', attribute, valignMap);
    }}
    getDiscreteDefault={() => defaultValue}  // TODO is it ok to hardcode this?
  />;
}
NodeLabelPositionStylePicker.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};


                
export default StylePicker;