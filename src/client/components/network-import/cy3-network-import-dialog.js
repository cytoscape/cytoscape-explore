import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';

const CY3_URL = 'http://localhost:1234';

export class Cy3NetworkImportDialog extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.onClose = props.onClose;
    this.radioGroupRef = {};
    this.state = {
      data: null,
      value: null,
    };
  }

  handleEntering() {
    if (this.radioGroupRef.current != null) {
      this.radioGroupRef.current.focus();
    }
  }

  handleCancel() {
    this.onClose();
  }

  handleOk() {
    const netId = this.state.value;
    this.onClose();

    fetch(`${CY3_URL}/v1/networks/${netId}/views`)
      .then(res => res.ok ? res.json() : [])
      .then(viewIds => {
        if (!viewIds || viewIds.length === 0) {
          // No views -- Import the network
          fetch(`${CY3_URL}/v1/networks/${netId}`)
            .then(res => res.json())
            .then(data => this.controller.setNetwork(data.elements, data.data));
        } else {
          // Import the first view of the network and its style
          fetch(`${CY3_URL}/v1/networks/${netId}/views/${viewIds[0]}`)
            .then(res => res.json())
            .then(data => {
              fetch(`${CY3_URL}/v1/networks/${netId}/views/${viewIds[0]}/currentStyle`)
                .then(res => res.json())
                .then(style => this.controller.setNetwork(data.elements, data.data, style));
            });
        }
      });
  }

  handleChange(event) {
    this.setState(Object.assign(this.state, { value: Number(event.target.value) }));
  }

  componentDidMount() {
    const compareByName = function(a, b) {
      var na = a.name.toUpperCase(); // ignore upper and lowercase
      var nb = b.name.toUpperCase(); // ignore upper and lowercase
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    };

    fetch(`${CY3_URL}/v1/networks.names`)
      .then(res => res.ok ? res.json() : [])
      .then(data => this.setState(Object.assign(this.state, { data: data.sort(compareByName) })));
  }

  render() {
    const { open } = this.props;
    const { data, value } = this.state;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        onEntering={() => this.handleEntering()}
        aria-labelledby="confirmation-dialog-title"
        open={open}
      >
        <DialogTitle id="confirmation-dialog-title">Import Network</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            ref={this.radioGroupRef}
            aria-label="ringtone"
            name="ringtone"
            value={value}
            onChange={e => this.handleChange(e)}
          >
            {data && data.map((v) => (
              <FormControlLabel key={v.SUID} value={v.SUID} label={v.name} control={<Radio />} />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => this.handleCancel()} color="primary">
            Cancel
          </Button>
          <Button disabled={value === null} onClick={() => this.handleOk()} color="primary">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

Cy3NetworkImportDialog.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Cy3NetworkImportDialog;