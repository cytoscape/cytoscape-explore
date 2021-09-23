import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton, Divider, Box, Button } from '@material-ui/core';
import { ColorSwatch, ColorSwatches, ColorGradients } from '../style/colors';
import { SizeSlider, SizeGradients } from '../style/sizes';
import { ShapeIcon, ShapeIconGroup } from '../style/shapes';
import { LabelInput } from '../style/labels';
import { StylePicker, StyleSection, StylePanel } from '../style/style-picker';
import { LayoutPanel } from '../layout/layout-panel';

export class ToolPanel extends Component {
  constructor(props){
    super(props);

    this.busProxy = new EventEmitterProxy(this.props.controller.bus);

    this.state = {
      toolRender: () => <div></div>
    };
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('toggleDrawMode', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){
    const { controller } = this.props;
    const { toolRender, tool } = this.state;

    const ToolButton = ({ icon, title, tool, onClick = (() => {}), render = (() => <div></div>) }) => {
        const color = this.state.tool === tool ? 'primary' : 'inherit';
        const buttonOnClick = () => { onClick(); this.setState({ tool, toolRender: render }); };
        
        return <Tooltip arrow placement="left" title={title}>
          <IconButton size="small" color={color} onClick={buttonOnClick}>
            <i className="material-icons">{icon}</i>
          </IconButton>
        </Tooltip>;
    };

    const StyleToolButton = ({ icon, title, tool, onClick, ...otherProps }) => {
      const ref = React.createRef();
      const pickerProps = { icon, title, ...otherProps };
      const render = () => <StylePicker initialized={true} ref={ref} {...pickerProps} />;

      return <ToolButton icon={icon} title={title} tool={tool} onClick={onClick} render={render}></ToolButton>;
    };


    return (<div className={"tool-panel " + (tool ? "tool-panel-has-tool" : "tool-panel-no-tool")}>
      <Box className="tool-panel-content" bgcolor="background.paper">
        { toolRender() }
      </Box>

      <Box className="tool-panel-buttons" bgcolor="background.paper" color="secondary.main">
        <ToolButton title="Layout" tool="layout" icon="offline_bolt" render={() => <LayoutPanel controller={controller} />}></ToolButton>
        
        <Divider />

        <ToolButton 
          title="Node Fill" 
          icon="lens"
          render={() => 
            <StylePanel title="Node Fill">
              <StyleSection title="Color">
                <StylePicker
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
              </StyleSection>
              <StyleSection title="Shape">
                <StylePicker 
                  controller={controller}
                  renderValue={(shape, onSelect) => 
                    <ShapeIconGroup type='node' selected={shape} onSelect={onSelect} />
                  }
                  renderDiscreteIcon={(shape) => 
                    <ShapeIcon type='node' shape={shape} />
                  }
                  getStyle={() => 
                    controller.getStyle('node', 'shape')
                  }
                  getDiscreteDefault={() =>
                    controller.getDiscreteDefault('node', 'shape')
                  }
                  onValueSet={shape => 
                    controller.setString('node', 'shape', shape)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setStringDiscreteMapping('node', 'shape',  attribute, valueMap);
                  }}
                />
              </StyleSection>
            </StylePanel>
          }
        />

      </Box>
    </div>);
  }
}

ToolPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default ToolPanel;