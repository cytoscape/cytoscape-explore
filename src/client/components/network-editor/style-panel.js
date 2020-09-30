import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatches, ColorGradients } from '../style/color-swatches'
import { SizeSlider, SizeGradients } from '../style/size-slider'

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
          title="Node Color"
          valueLabel="Single Color"
          buttonIcon="opacity"
          controller={controller}
          renderValue={(color, onSelect) => 
            <ColorSwatches selected={color} onSelect={onSelect} />
          }
          renderMapping={(gradient, onSelect) => 
            <ColorGradients selected={gradient} onSelect={onSelect} />
          } 
          onValueSet={color => controller.setNodeColor(color)}
          onMappingSet={(gradient, attribute) => controller.setNodeColorMapping(gradient, attribute)}
        />

        <StylePickerButton 
          title="Node Size"
          valueLabel="Single Value"
          buttonIcon="all_out"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider size={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients selected={sizeRange} onSelect={onSelect} />
          } 
          onValueSet={size => controller.setNodeSize(size)}
          onMappingSet={(sizeRange, attribute) => controller.setNodeSizeMapping(sizeRange, attribute)}
        />

        <button 
          onClick={() => console.log('dummy button')}
          className="button style-panel-button plain-button">
          <i className="material-icons">grade</i>
        </button>
        <button 
          onClick={() => console.log('dummy button')}
          className="button style-panel-button plain-button">
          <i className="material-icons">grade</i>
        </button>
      </div>
    );
  }
}

export default StylePanel;