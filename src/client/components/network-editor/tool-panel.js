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
import { HistoryPanel } from './history-panel';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { LayoutIcon } from '../svg-icons';

function SidePanel({ title, onClose, children }) {
  return <div>
    <div className="tool-panel-heading">
      { title || "Panel" }
      <IconButton size="small" onClick={onClose}>
        <KeyboardArrowRightIcon />
      </IconButton>
    </div>
    <div>
      { children }
    </div>
  </div>;
}
SidePanel.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  onClose: PropTypes.func,
};

export class ToolPanel extends Component {
  constructor(props){
    super(props);
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    this.state = {
      toolRender: () => <div></div>,
      panelOpen: false,
    };
  }

  componentDidMount() {
    const dirty = () => this.setState({ dirty: Date.now() });
    this.busProxy.on('toggleDrawMode', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render() {
    const { controller } = this.props;
    const { toolRender } = this.state;

    const openPanel  = () => this.setState({ panelOpen: true });
    const closePanel = () => this.setState({ panelOpen: false });
    const notifyOpen  = () => this.props.onSetOpen(true);
    const notifyClose = () => this.props.onSetOpen(false);
      
    const ToolButton = ({ icon, title, tool, onClick = (() => {}), render = (() => <div></div>) }) => {
        const color = this.state.tool === tool ? 'primary' : 'inherit';
        const buttonOnClick = () => { 
          onClick(); 
          this.setState({ tool, toolRender: render });
          openPanel();
        };
        
        return <Tooltip arrow placement="left" title={title}>
          <IconButton size="small" color={color} onClick={buttonOnClick}>
            {typeof(icon) === 'string' ? (
              <i className="material-icons">{ icon }</i>
            ) : (
              <>{ icon }</>
            )}
          </IconButton>
        </Tooltip>;
    };

    return (<div className="tool-panel">
      <Drawer 
        variant='persistent' 
        anchor='right' 
        open={this.state.panelOpen} 
        style={{ zIndex: -1 }} // MKTODO Is there a better way to do this?
        SlideProps={{ // Notify the network editor *after* the slide animation completes.
          onEntered: notifyOpen,
          onExit: notifyClose
        }}>
        <div className="tool-panel-wrapper" bgcolor="background.paper">
          { toolRender() }
        </div>
      </Drawer>

      <Box className="tool-panel-buttons" bgcolor="background.paper" color="secondary.main">

        <ToolButton 
          title="Layout"
          tool="layout"
          icon={<LayoutIcon />}
          render={() =>
            <SidePanel title="Layout" onClose={closePanel}>
              <LayoutPanel controller={controller} />
            </SidePanel>
          }>
        </ToolButton>
        
        <ToolButton 
          title="History"
          tool="history"
          icon="history"
          render={() =>
            <SidePanel title="History" onClose={closePanel}>
              <HistoryPanel controller={controller} />
            </SidePanel>
          }>
        </ToolButton>

        <Divider />

        <ToolButton 
          title="Node Body" 
          icon="lens"
          tool="node_body"
          render={() =>
            <SidePanel title="Node Body" onClose={closePanel}>
              <StylePanel selector="node" controller={controller}>
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
            </SidePanel>
          }
        />

        <ToolButton 
          title="Node Border" 
          icon="trip_origin"
          tool="node_border"
          render={() => 
            <SidePanel title="Node Border" onClose={closePanel}>
              <StylePanel selector="node" controller={controller}>
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
            </SidePanel>
          }
        />

        <ToolButton 
          title="Node Label" 
          icon="text_format"
          tool="node_label"
          render={() =>
            <SidePanel title="Node Label" onClose={closePanel}>
              <StylePanel selector="node" controller={controller}>
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
            </SidePanel>
          }
        />

        <Divider />

        <ToolButton 
          title="Edge" 
          icon="remove"
          tool="edge"
          render={() =>
            <SidePanel title="Edge" onClose={closePanel}>
              <StylePanel selector="edge" controller={controller}>
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
            </SidePanel>
          }
        />

        <ToolButton 
          title="Edge Arrows" 
          icon="arrow_forward"
          tool="edge_arrows"
          render={() =>
            <SidePanel title="Edge Arrows" onClose={closePanel}>
              <StylePanel selector="edge" controller={controller}>
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
            </SidePanel>
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
ToolPanel.defaultProps ={
  onSetOpen: () => null
};

export default ToolPanel;