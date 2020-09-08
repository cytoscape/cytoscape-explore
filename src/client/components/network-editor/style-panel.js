import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatch, ColorSwatches, ColorGradient, ColorGradients } from '../style/color-swatches'

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
    return (
      <div className="style-panel">
        <StylePickerButton 
          buttonIcon="opacity"
          title="Node Color"
          valueLabel="Solid Color"
          mappingLabel="Attribute Mapping"
          controller={this.props.controller}
          valuePicker={<ColorSwatches />}
          mappingPicker={<ColorGradients />} 
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