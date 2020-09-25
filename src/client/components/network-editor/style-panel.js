import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import Tippy from '@tippy.js/react';
import { ColorSwatches } from '../color-swatches';

export class StylePanel extends Component {
  constructor(props){
    super(props);

    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){
    const { controller } = this.props;

    return (
      <div className="style-panel">
        <Tippy
          interactive={true}
          trigger='click'
          theme='light'
          content={
            <div>
              <ColorSwatches 
                onSelectColor={color => {
                  console.log('set color', color);

                  controller.setNodeColor({
                    r: color.rgb[0],
                    g: color.rgb[1],
                    b: color.rgb[2],
                  });
                }} />
            </div>
          }>
          <button 
            onClick={() => console.log('set bg colour')}
            className="style-panel-button plain-button">
            <i className="material-icons">opacity</i>
          </button>
        </Tippy>
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