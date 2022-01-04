import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { Drawer } from '@material-ui/core';
import { IconButton, Divider, Box } from '@material-ui/core';
import { StyleSection, StylePanel, OpacityStylePicker } from '../style/style-picker'; 
import { ColorStylePicker, ShapeStylePicker, SizeStylePicker, TextStylePicker } from '../style/style-picker';
import { NodeSizeStyleSection, NodeLabelPositionStylePicker } from '../style/style-picker';
import { LayoutPanel } from '../layout/layout-panel';



export class ToolPanel extends Component {
  constructor(props){
    super(props);
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    this.state = {
      toolRender: () => <div></div>,
      panelOpen: false,
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

    const openPanel = open => {
      this.setState({ panelOpen: open });
      this.props && this.props.onSetOpen(open);
    };

    const ToolButton = ({ icon, title, tool, onClick = (() => {}), render = (() => <div></div>) }) => {
        const color = this.state.tool === tool ? 'primary' : 'inherit';
        const buttonOnClick = () => { 
          onClick(); 
          this.setState({ tool, toolRender: render });
          openPanel(true);
        };
        
        return <Tooltip arrow placement="left" title={title}>
          <IconButton size="small" color={color} onClick={buttonOnClick}>
            <i className="material-icons">{icon}</i>
          </IconButton>
        </Tooltip>;
    };

    const CollapseButton = () =>
      <IconButton size="small" onClick={() => openPanel(false)}>
        <i className="material-icons">keyboard_arrow_right</i>
      </IconButton>;


    return (<div className="tool-panel">
      <Drawer variant='persistent' anchor='right' open={this.state.panelOpen} style={{ zIndex: -1 }}>
        <div style={{ height: '60px'}} />
        <div style={{ marginRight:'52px', width:'300px' }}>
          <div className="tool-panel-wrapper" bgcolor="background.paper">
            { toolRender() }
          </div>
        </div>
      </Drawer>

      <Box className="tool-panel-buttons" bgcolor="background.paper" color="secondary.main">

        <ToolButton 
          title="Layout" 
          tool="layout" 
          icon="bolt" // bubble_chart"  "scatter_plot"  "grain"
          render={() => <LayoutPanel controller={controller} />}>
        </ToolButton>
        
        <Divider />

        <ToolButton 
          title="Node Body" 
          icon="lens"
          tool="node_body"
          render={() => 
            <StylePanel 
              title="Node Body"
              selector="node"
              controller={controller}
              extra={<CollapseButton />}>
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['background-color']}
                />
              </StyleSection>
              <StyleSection title="Shape">
                <ShapeStylePicker
                  controller={controller}
                  selector='node'
                  styleProp='shape'
                  variant='node'
                />
              </StyleSection>
              <NodeSizeStyleSection
                controller={controller}
              />
            </StylePanel>
          }
        />

        <ToolButton 
          title="Node Border" 
          icon="trip_origin"
          tool="node_border"
          render={() => 
            <StylePanel 
              title="Node Border"
              selector="node"
              controller={controller}>
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['border-color']}
                />
              </StyleSection>
              <StyleSection title="Width">
                <SizeStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['border-width']}
                  variant='border'
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Node Label" 
          icon="text_format"
          tool="node_label"
          render={() => 
            <StylePanel 
              title="Node Label"
              selector="node"
              controller={controller}>
              <StyleSection title="Text">
                <TextStylePicker
                  controller={controller}
                  selector='node'
                  styleProp='label'
                />
              </StyleSection>
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['color']}
                />
              </StyleSection>
              <StyleSection title="Size">
                <SizeStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['font-size']}
                  variant='text'
                />
              </StyleSection>
              <StyleSection title="Position">
                <NodeLabelPositionStylePicker
                  controller={controller}
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <Divider />

        <ToolButton 
          title="Edge" 
          icon="remove"
          tool="edge"
          render={() => 
            <StylePanel 
              title="Edge"
              selector="edge"
              controller={controller}>
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='edge'
                  styleProps={['line-color', 'source-arrow-color', 'target-arrow-color']}
                />
              </StyleSection>
              <StyleSection title="Opacity">
                <OpacityStylePicker
                  controller={controller}
                  selector='edge'
                  styleProp='opacity'
                />
              </StyleSection>
              <StyleSection title="Width">
                <SizeStylePicker
                  controller={controller}
                  selector='edge'
                  styleProps={['width']}
                  variant='line'
                />
              </StyleSection>
              <StyleSection title="Line Style">
                <ShapeStylePicker
                  controller={controller}
                  selector='edge'
                  styleProp='line-style'
                  variant='line'
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Edge Arrows" 
          icon="arrow_forward"
          tool="edge_arrows"
          render={() =>
            <StylePanel 
              title="Edge Arrows"
              selector="edge"
              controller={controller}>
              <StyleSection title="Source Arrow">
                <ShapeStylePicker
                  controller={controller}
                  selector='edge'
                  styleProp='source-arrow-shape'
                  variant='arrow'
                />
              </StyleSection>
              <StyleSection title="Target Arrow">
                <ShapeStylePicker
                  controller={controller}
                  selector='edge'
                  styleProp='target-arrow-shape'
                  variant='arrow'
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
  controller: PropTypes.instanceOf(NetworkEditorController),
  onSetOpen: PropTypes.func,
};

export default ToolPanel;