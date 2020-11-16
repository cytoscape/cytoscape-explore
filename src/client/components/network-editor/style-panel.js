import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatch, ColorSwatches, ColorGradients } from '../style/color-swatches';
import { SizeSlider, SizeGradients } from '../style/size-slider';
import { LabelInput } from '../style/label-input';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';

export class StylePanel extends Component {
  constructor(props){
    super(props);
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });
    this.busProxy.on('setStyleTargets', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){ 
    /** @type {NetworkEditorController} */
    const controller = this.props.controller;

    return (
      <div className="style-panel">

        <StylePickerButton 
          title="Node Label"
          icon="format_quote"
          controller={controller}
          renderValue={(text, onChange) => 
            <LabelInput value={text} onChange={onChange} />
          }
          getStyle={() => 
            controller.getStyle('node', 'label')
          }
          onValueSet={text => 
            controller.setString('node', 'label', text)
          }
          onPassthroughSet={attribute => 
            controller.setStringPassthroughMapping('node', 'label', attribute)
          }
        />

        <StylePickerButton 
          title="Node Color"
          icon="lens"
          controller={controller}
          renderValue={(color, onSelect) => 
            <ColorSwatches selected={color} onSelect={onSelect} />
          }
          renderMapping={(gradient, onSelect) => 
            <ColorGradients selected={gradient} onSelect={onSelect} /> 
          }
          renderDiscreteIcon={color => 
            <ColorSwatch color={color} />
          }
          getStyle={() => 
            controller.getStyle('node', 'background-color')
          }
          getDiscreteDefault={() =>
            controller.getDiscreteDefault('node', 'background-color')
          }
          onValueSet={color => 
            controller.setColor('node', 'background-color', color)
          }
          onMappingSet={(attribute, gradient) => 
            controller.setColorLinearMapping('node', 'background-color', attribute, gradient)
          }
          onDiscreteSet={(attribute, valueMap) => 
            controller.setColorDiscreteMapping('node', 'background-color', attribute, valueMap)
          }
        />

        <StylePickerButton 
          title="Node Border Color"
          icon="trip_origin"
          controller={controller}
          renderValue={(color, onSelect) => 
            <ColorSwatches selected={color} onSelect={onSelect} />
          }
          renderMapping={(gradient, onSelect) => 
            <ColorGradients selected={gradient} onSelect={onSelect} /> 
          } 
          renderDiscreteIcon={color => 
            <ColorSwatch color={color} />
          }
          getStyle={() => 
            controller.getStyle('node', 'border-color')
          }
          getDiscreteDefault={() =>
            controller.getDiscreteDefault('node', 'border-color')
          }
          onValueSet={color => 
            controller.setColor('node', 'border-color', color)
          }
          onMappingSet={(gradient, attribute) => 
            controller.setColorLinearMapping('node', 'border-color', gradient, attribute)
          }
          onDiscreteSet={(attribute, valueMap) => 
            controller.setColorDiscreteMapping('node', 'border-color', attribute, valueMap)
          }
        />

        <StylePickerButton 
          title="Node Size"
          icon="bubble_chart"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={10} max={50} defaultValue={size} onSelect={onSelect} /> 
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients min={10} max={50} selected={sizeRange} onSelect={onSelect} /> 
          } 
          renderDiscreteIcon={(size) => 
            <Button variant="outlined">{size}</Button>
          }
          getStyle={() => 
            controller.getStyle('node', 'width')
          }
          getDiscreteDefault={() =>
            controller.getDiscreteDefault('node', 'width')
          }
          onValueSet={size => { 
            controller.setNumber('node', 'width',  size);
            controller.setNumber('node', 'height', size);
          }}
          onMappingSet={(attribute, sizeRange) => {
            controller.setNumberLinearMapping('node', 'width',  attribute, sizeRange);
            controller.setNumberLinearMapping('node', 'height', attribute, sizeRange);
          }}
          onDiscreteSet={(attribute, valueMap) => {
            controller.setNumberDiscreteMapping('node', 'width',  attribute, valueMap);
            controller.setNumberDiscreteMapping('node', 'height', attribute, valueMap);
          }}
        />

        <StylePickerButton 
          title="Node Border Width"
          icon="toll"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={0} max={10} defaultValue={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients min={0} max={10} border={true} selected={sizeRange} onSelect={onSelect} />
          } 
          renderDiscreteIcon={(size) => 
            <Button variant="outlined">{size}</Button>
          }
          getStyle={() => 
            controller.getStyle('node', 'border-width')
          }
          getDiscreteDefault={() =>
            controller.getDiscreteDefault('node', 'border-width')
          }
          onValueSet={size => 
            controller.setNumber('node', 'border-width', size)
          }
          onMappingSet={(sizeRange, attribute) => 
            controller.setNumberLinearMapping('node', 'border-width',  attribute, sizeRange)
          }
          onDiscreteSet={(attribute, valueMap) => {
            controller.setNumberDiscreteMapping('node', 'border-width',  attribute, valueMap);
          }}
        />

      </div>
    );
  }
}

StylePanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default StylePanel;