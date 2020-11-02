import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatches, ColorGradients } from '../style/color-swatches';
import { SizeSlider, SizeGradients } from '../style/size-slider';
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
          title="Node Color"
          icon="opacity"
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
          title="Node Size"
          icon="all_out"
          valueLabel="Single Value"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider size={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients selected={sizeRange} onSelect={onSelect} />
          } 
          getStyle={() => controller.cySyncher.getStyle('node', 'width')}
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

StylePanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default StylePanel;