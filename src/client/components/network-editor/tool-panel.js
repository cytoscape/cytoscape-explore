import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton, Divider, Box, Button } from '@material-ui/core';
import { ColorSwatch, ColorSwatches, ColorGradient, ColorGradients } from '../style/colors';
import { SizeSlider, SizeGradients, SizeGradient } from '../style/sizes';
import { ShapeIcon, ShapeIconGroup } from '../style/shapes';
import { LabelInput } from '../style/labels';
import { StylePicker, StyleSection, StylePanel } from '../style/style-picker';
import { LayoutPanel } from '../layout/layout-panel';


export function ColorStylePicker({ controller, selector, styleProps }) {
  return <StylePicker
    controller={controller}
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
      styleProps.forEach(p => controller.getDiscreteDefault(selector, p))
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


    return (<div className={"tool-panel " + (tool ? "tool-panel-has-tool" : "tool-panel-no-tool")}>
      <Box className="tool-panel-content" bgcolor="background.paper">
        { toolRender() }
      </Box>

      <Box className="tool-panel-buttons" bgcolor="background.paper" color="secondary.main">

        <ToolButton 
          title="Layout" 
          tool="layout" 
          icon="share" // bubble_chart" // "scatter_plot"  "grain"
          render={() => <LayoutPanel controller={controller} />}>
        </ToolButton>
        
        <Divider />

        <ToolButton 
          title="Node Body" 
          icon="lens"
          render={() => 
            <StylePanel title="Node Body">
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['background-color']}
                />
              </StyleSection>
              <StyleSection title="Shape">
                <StylePicker 
                  controller={controller}
                  valueLabel="Single Shape"
                  discreteLabel="Shape per Data Value"
                  renderValueButton={(shape) => 
                    <ShapeIcon type='node' shape={shape} />
                  }
                  renderValuePicker={(shape, onSelect) => 
                    <ShapeIconGroup type='node' selected={shape} onSelect={onSelect} />
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
              <StyleSection title="Size">
                <StylePicker
                  title="Size"
                  valueLabel="Single Size"
                  mappingLabel="Size Mapping"
                  discreteLabel="Sized per Data Value"
                  controller={controller}
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
                    <SizeGradients variant='solid' min={10} max={50} selected={sizeRange} onSelect={onSelect} /> 
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
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Node Border" 
          icon="trip_origin"
          render={() => 
            <StylePanel title="Node Border">
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['border-color']}
                />
              </StyleSection>
              <StyleSection title="Width">
                <StylePicker
                  controller={controller}
                  renderValueButton={(size) => 
                    <Button variant="outlined">{size}</Button>
                  }
                  renderValuePicker={(size, onSelect) => 
                    <SizeSlider min={0} max={10} defaultValue={size} onSelect={onSelect} />
                  }
                  renderMappingButton={(size) => 
                    <SizeGradient selected={size} /> 
                  }
                  renderMappingPicker={(sizeRange, onSelect) => 
                    <SizeGradients variant='border' min={0} max={10} selected={sizeRange} onSelect={onSelect} />
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
                  onMappingSet={(attribute, sizeRange) => 
                    controller.setNumberLinearMapping('node', 'border-width',  attribute, sizeRange)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setNumberDiscreteMapping('node', 'border-width',  attribute, valueMap);
                  }}
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Node Label" 
          icon="do_not_disturb_on"
          render={() => 
            <StylePanel title="Node Label">
              <StyleSection title="Text">
                <StylePicker
                  controller={controller}
                  renderValueButton={(text, onChange) => 
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
              </StyleSection>
              <StyleSection title="Font">
                <div>TODO</div>
              </StyleSection>
              <StyleSection title="Color">
                <div>TODO</div>
              </StyleSection>
              <StyleSection title="Position">
                <div>TODO</div>
              </StyleSection>
            </StylePanel>
          }
        />

        <Divider />

        <ToolButton 
          title="Edge" 
          icon="remove"
          render={() => 
            <StylePanel title="Edge">
              <StyleSection title="Color">
                <ColorStylePicker
                  selector='edge'
                  controller={controller}
                  styleProps={['line-color', 'source-arrow-color', 'target-arrow-color']}
                />
              </StyleSection>
              <StyleSection title="Width">
                <StylePicker 
                  selector='edge'
                  controller={controller}
                  renderValueButton={(size) => 
                    <Button variant="outlined">{size}</Button>
                  }
                  renderValuePicker={(size, onSelect) => 
                    <SizeSlider min={0} max={10} defaultValue={size} onSelect={onSelect} />
                  }
                  renderMappingButton={(size) => 
                    <SizeGradient selected={size} /> 
                  }
                  renderMappingPicker={(sizeRange, onSelect) => 
                    <SizeGradients variant='line' min={0} max={10} selected={sizeRange} onSelect={onSelect} />
                  } 
                  getStyle={() => 
                    controller.getStyle('edge', 'width')
                  }
                  getDiscreteDefault={() =>
                    controller.getDiscreteDefault('edge', 'width')
                  }
                  onValueSet={size => 
                    controller.setNumber('edge', 'width', size)
                  }
                  onMappingSet={(attribute, sizeRange) => 
                    controller.setNumberLinearMapping('edge', 'width',  attribute, sizeRange)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setNumberDiscreteMapping('edge', 'width',  attribute, valueMap);
                  }}
                />
              </StyleSection>
              <StyleSection title="Line Style">
                <StylePicker
                  selector='edge'
                  controller={controller}
                  renderValuePicker={(shape, onSelect) => 
                    <ShapeIconGroup type='line' selected={shape} onSelect={onSelect} />
                  }
                  renderValueButton={(shape) => 
                    <ShapeIcon type='line' shape={shape} />
                  }
                  getStyle={() => 
                    controller.getStyle('edge', 'line-style')
                  }
                  getDiscreteDefault={() =>
                    controller.getDiscreteDefault('edge', 'line-style')
                  }
                  onValueSet={shape => 
                    controller.setString('edge', 'line-style', shape)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setStringDiscreteMapping('edge', 'line-style',  attribute, valueMap);
                  }}
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Edge Arrows" 
          icon="arrow_back"
          render={() =>
            <StylePanel title="Edge Arrows">
              <StyleSection title="Source Arrow">
                <StylePicker
                  selector='edge'
                  controller={controller}
                  renderValuePicker={(shape, onSelect) => 
                    <ShapeIconGroup type='arrow' selected={shape} onSelect={onSelect} />
                  }
                  renderValueButton={(shape) => 
                    <ShapeIcon type='arrow' shape={shape} />
                  }
                  getStyle={() => 
                    controller.getStyle('edge', 'source-arrow-shape')
                  }
                  getDiscreteDefault={() =>
                    controller.getDiscreteDefault('edge', 'source-arrow-shape')
                  }
                  onValueSet={shape => 
                    controller.setString('edge', 'source-arrow-shape', shape)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setStringDiscreteMapping('edge', 'source-arrow-shape',  attribute, valueMap);
                  }}
                /> 
              </StyleSection>
              <StyleSection title="Target Arrow">
                <StylePicker
                  selector='edge'
                  controller={controller}
                  renderValuePicker={(shape, onSelect) => 
                    <ShapeIconGroup type='arrow' selected={shape} onSelect={onSelect} />
                  }
                  renderValueButton={(shape) => 
                    <ShapeIcon type='arrow' shape={shape} />
                  }
                  getStyle={() => 
                    controller.getStyle('edge', 'target-arrow-shape')
                  }
                  getDiscreteDefault={() =>
                    controller.getDiscreteDefault('edge', 'target-arrow-shape')
                  }
                  onValueSet={shape => 
                    controller.setString('edge', 'target-arrow-shape', shape)
                  }
                  onDiscreteSet={(attribute, valueMap) => {
                    controller.setStringDiscreteMapping('edge', 'target-arrow-shape',  attribute, valueMap);
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