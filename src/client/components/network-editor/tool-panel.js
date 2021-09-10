import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton, Divider, Box, ButtonBaseTypeMap } from '@material-ui/core';
import StylePickerButton from '../style/style-picker-button';
import { ColorSwatch, ColorSwatches, ColorGradients } from '../style/colors';
import { SizeSlider, SizeGradients } from '../style/sizes';
import { ShapeIcon, ShapeIconGroup } from '../style/shapes';
import { LabelInput } from '../style/labels';
import { StylePicker } from '../style/style-picker';
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

        <StyleToolButton 
          tool="nodeLabel"
          title="Node Label"
          icon="text_format"
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

        <StyleToolButton
          tool="nodeColor" 
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

        <StyleToolButton 
          tool="nodeBorderColor"
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

        <StyleToolButton 
          tool="nodeShape"
          title="Node Shape"
          icon="category"
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
      
        <StyleToolButton 
          tool="nodeSize"
          title="Node Size"
          icon="all_out"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={10} max={50} defaultValue={size} onSelect={onSelect} /> 
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients variant='solid' min={10} max={50} selected={sizeRange} onSelect={onSelect} /> 
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

        <StyleToolButton 
          tool="nodeBorderWidth"
          title="Node Border Width"
          icon="toll"
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={0} max={10} defaultValue={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients variant='border' min={0} max={10} selected={sizeRange} onSelect={onSelect} />
          } 
          renderDiscreteIcon={(size) => 
            <Button variant='outlined'>{size}</Button>
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

        <Divider />

        <StyleToolButton 
          tool="edgeColor"
          title="Edge Color"
          icon="remove"
          selector='edge'
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
            controller.getStyle('edge', 'line-color')
          }
          getDiscreteDefault={() =>
            controller.getDiscreteDefault('edge', 'line-color')
          }
          onValueSet={color => {
            controller.setColor('edge', 'line-color', color);
            controller.setColor('edge', 'source-arrow-color', color);
            controller.setColor('edge', 'target-arrow-color', color);
          }}
          onMappingSet={(attribute, gradient) => {
            controller.setColorLinearMapping('edge', 'line-color', attribute, gradient);
            controller.setColorLinearMapping('edge', 'source-arrow-color', attribute, gradient);
            controller.setColorLinearMapping('edge', 'target-arrow-color', attribute, gradient);
          }}
          onDiscreteSet={(attribute, valueMap) => {
            controller.setColorDiscreteMapping('edge', 'line-color', attribute, valueMap);
            controller.setColorDiscreteMapping('edge', 'source-arrow-color', attribute, valueMap);
            controller.setColorDiscreteMapping('edge', 'target-arrow-color', attribute, valueMap);
          }}
        />

        <StyleToolButton
          tool="edgeWidth" 
          title="Edge Width"
          icon="line_weight"
          selector='edge'
          controller={controller}
          renderValue={(size, onSelect) => 
            <SizeSlider min={0} max={10} defaultValue={size} onSelect={onSelect} />
          }
          renderMapping={(sizeRange, onSelect) => 
            <SizeGradients variant='line' min={0} max={10} selected={sizeRange} onSelect={onSelect} />
          } 
          renderDiscreteIcon={(size) => 
            <Button variant="outlined">{size}</Button>
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

        <StyleToolButton 
          tool="edgeLineStyle"
          title="Edge Line Style"
          icon="line_style"
          selector='edge'
          controller={controller}
          renderValue={(shape, onSelect) => 
            <ShapeIconGroup type='line' selected={shape} onSelect={onSelect} />
          }
          renderDiscreteIcon={(shape) => 
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

        <StyleToolButton 
          tool="edgeSourceArrow"
          title="Edge Source Arrow"
          icon="arrow_back"
          selector='edge'
          controller={controller}
          renderValue={(shape, onSelect) => 
            <ShapeIconGroup type='arrow' selected={shape} onSelect={onSelect} />
          }
          renderDiscreteIcon={(shape) => 
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

        <StyleToolButton 
          tool="edgeTargetArrow"
          title="Edge Target Arrow"
          icon="arrow_forward"
          selector='edge'
          controller={controller}
          renderValue={(shape, onSelect) => 
            <ShapeIconGroup type='arrow' selected={shape} onSelect={onSelect} />
          }
          renderDiscreteIcon={(shape) => 
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
      </Box>
    </div>);
  }
}

ToolPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default ToolPanel;