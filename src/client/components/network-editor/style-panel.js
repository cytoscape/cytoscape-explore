import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatches, ColorGradients } from '../style/color-swatches';
import { SizeSlider, SizeGradients } from '../style/size-slider';
import { LabelInput } from '../style/label-input';
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
    const controller = this.props.controller;

    return (
      <div className="style-panel">
        <StylePickerButton 
          title="Node Label"
          icon="format_quote"
          valueLabel="Single Label"
          controller={controller}
          renderValue={(text, onChange) => 
            <LabelInput value={text} onChange={onChange} />
          }
          getStyle={() => controller.cySyncher.getStyle('node', 'label')}
          onValueSet={text => controller.setNodeLabel(text)}
          onPassthroughSet={attribute => controller.setNodeLabelPassthrough(attribute)}
        />

        <StylePickerButton 
          title="Node Color"
          icon="lens"
          valueLabel="Single Color"
          controller={controller}
          renderValue={(color, onSelect) => 
            <ColorSwatches selected={color} onSelect={onSelect} />
          }
          renderMapping={(gradient, onSelect) => 
            <ColorGradients selected={gradient} onSelect={onSelect} />
          } 
          getStyle={() => controller.cySyncher.getStyle('node', 'background-color')}
          onValueSet={color => controller.setNodeColor(color)}
          onMappingSet={(gradient, attribute) => controller.setNodeColorMapping(gradient, attribute)}
        />

        <StylePickerButton 
          title="Node Border Color"
          icon="trip_origin"
          valueLabel="Single Color"
          controller={controller}
          renderValue={(color, onSelect) => 
            <ColorSwatches selected={color} onSelect={onSelect} />
          }
          renderMapping={(gradient, onSelect) => 
            <ColorGradients selected={gradient} onSelect={onSelect} />
          } 
          getStyle={() => controller.cySyncher.getStyle('node', 'border-color')}
          onValueSet={color => controller.setNodeBorderColor(color)}
          onMappingSet={(gradient, attribute) => controller.setNodeBorderColorMapping(gradient, attribute)}
        />

        <StylePickerButton 
          title="Node Size"
          icon="bubble_chart"
          valueLabel="Single Value"
          controller={controller}
          renderValue={(size, onSelect) =>
            <SizeSlider min={20} max={40} defaultValue={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients min={20} max={40} selected={sizeRange} onSelect={onSelect} />
          } 
          getStyle={() => controller.cySyncher.getStyle('node', 'width')}
          onValueSet={size => controller.setNodeSize(size)}
          onMappingSet={(sizeRange, attribute) => controller.setNodeSizeMapping(sizeRange, attribute)}
        />

        <StylePickerButton 
          title="Node Border Width"
          icon="toll"
          valueLabel="Single Value"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={0.5} max={10.0} defaultValue={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients min={0.5} max={10.0} border={true} selected={sizeRange} onSelect={onSelect} />
          } 
          getStyle={() => controller.cySyncher.getStyle('node', 'border-width')}
          onValueSet={size => controller.setNodeBorderWidth(size)}
          onMappingSet={(sizeRange, attribute) => controller.setNodeBorderWidthMapping(sizeRange, attribute)}
        />

      </div>
    );
  }
}

StylePanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default StylePanel;