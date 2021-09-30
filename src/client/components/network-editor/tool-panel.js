import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton, Divider, Box } from '@material-ui/core';
import { StyleSection, StylePanel, ColorStylePicker, ShapeStylePicker, SizeStylePicker, TextStylePicker } from '../style/style-picker';
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


    return (<div className={"tool-panel " + (tool ? "tool-panel-has-tool" : "tool-panel-no-tool")}>
      <Box className="tool-panel-content" bgcolor="background.paper">
        { toolRender() }
      </Box>

      <Box className="tool-panel-buttons" bgcolor="background.paper" color="secondary.main">

        <ToolButton 
          title="Layout" 
          tool="layout" 
          icon="share" // bubble_chart"  "scatter_plot"  "grain"
          render={() => <LayoutPanel controller={controller} />}>
        </ToolButton>
        
        <Divider />

        <ToolButton 
          title="Node Body" 
          icon="lens"
          tool="node_body"
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
                <ShapeStylePicker
                  controller={controller}
                  selector='node'
                  styleProp='shape'
                  variant='node'
                />
              </StyleSection>
              <StyleSection title="Size">
                <SizeStylePicker
                  controller={controller}
                  selector='node'
                  styleProps={['width', 'height']}
                  variant='solid'
                />
              </StyleSection>
            </StylePanel>
          }
        />

        <ToolButton 
          title="Node Border" 
          icon="trip_origin"
          tool="node_border"
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
          icon="do_not_disturb_on"
          tool="node_label"
          render={() => 
            <StylePanel title="Node Label">
              <StyleSection title="Text">
                <TextStylePicker
                  controller={controller}
                  selector='node'
                  styleProp='label'
                />
              </StyleSection>
              <StyleSection title="Color">
                <div>TODO (already have support for colors)</div>
              </StyleSection>
              <StyleSection title="Font">
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
          tool="edge"
          render={() => 
            <StylePanel title="Edge">
              <StyleSection title="Color">
                <ColorStylePicker
                  controller={controller}
                  selector='edge'
                  styleProps={['line-color', 'source-arrow-color', 'target-arrow-color']}
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
          icon="arrow_back"
          tool="edge_arrows"
          render={() =>
            <StylePanel title="Edge Arrows">
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
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default ToolPanel;