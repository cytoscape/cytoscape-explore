import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@material-ui/core/styles';
import { NetworkEditorController } from './controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { Tooltip, InputBase } from '@material-ui/core';

/**
 * The network title editor. Shows and edits the attribute `cy.data('name')`.
 * - **ENTER** key or `blur()`: Commits the changes and renames the network.
 * - **ESCAPE** key: Cancels the changes and shows the previous network name again.
 * @param {Object} props React props
 */
export class TitleEditor extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    this.state = {
      networkName: this.controller.cy.data('name'),
    };

    this.onDataChanged = this.onDataChanged.bind(this);
  }

  componentDidMount() {
    const onSetNetwork = (cy) => {
      this.setState({ networkName: cy.data('name') });
      this.addCyListeners();
    };
    this.busProxy.on('setNetwork', onSetNetwork);
    this.addCyListeners();
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
    this.removeCyListeners();
  }

  addCyListeners() {
    this.controller.cy.on('data', this.onDataChanged);
  }

  removeCyListeners() {
    this.controller.cy.removeListener('data', this.onDataChanged);
  }

  /**
   * Listens to cy.js 'data' events and updates the networkName state
   * when the network's 'name' attribute has changed.
   */
  onDataChanged(event) {
    const name = event.cy.data('name');
    
    if (this.state.networkName != name)
      this.setState({ networkName: name });
  }

  handleNetworkNameKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.input.blur();
    } else if (event.key === 'Escape') {
      this.cancelNetworkNameChange();
      event.preventDefault();
    }
  }

  handleNetworkNameFocus() {
    // Using the uncontrolled input approach here
    if (!this.state.networkName)
      this.input.value = '';
    else
      this.input.select();
  }

  handleNetworkNameBlur() {
    const networkName = this.input.value;
    this.renameNetwork(networkName);
  }

  cancelNetworkNameChange() {
    this.setState({ networkName: this.controller.cy.data('name') });
  }

  renameNetwork(newName) {
    const networkName = newName != null ? newName.trim() : null;
    this.controller.cy.data({ name: networkName });
  }

  render() {
    const { networkName } = this.state;
    
    const CssInputBase = styled(InputBase)(({ theme }) => ({
      '& .MuiInputBase-input': {
        position: 'relative',
        border: '1px solid transparent',
        borderRadius: 5,
        width: '100%',
        maxWidth: 640,
        padding: 2,
        fontWeight: 'bold',
        '&:hover': {
          border: `1px solid ${theme.palette.secondary.main}`,
        },
        '&:focus': {
          border: `1px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.background.focus,
          fontWeight: 'normal',
        },
      },
    }));

    return (
      <Tooltip arrow placement="bottom" title="Rename Network">
        <CssInputBase
          fullWidth={true}
          defaultValue={networkName || 'Untitled Network'}
          onFocus={() => this.handleNetworkNameFocus()}
          onBlur={() => this.handleNetworkNameBlur()}
          onKeyDown={(evt) => this.handleNetworkNameKeyDown(evt)}
          inputRef={ref => (this.input = ref)}
        />
      </Tooltip>
    );
  }
}

TitleEditor.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default TitleEditor;