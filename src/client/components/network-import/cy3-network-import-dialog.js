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
import { Alert, AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';

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
      error: null,
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
      .then(res => res.json())
      .then(data => this.setState(Object.assign(this.state, { data: data.sort(compareByName), error: null })))
      .catch(err => this.setState(Object.assign(this.state, { error: err })));
  }

  render() {
    const { open } = this.props;
    const { data, value, error } = this.state;
    let content = null;

    if (error) {
      content = (
        <Alert severity="error">
          <AlertTitle>Error Connecting to Cytoscape 3</AlertTitle>
          Please make sure <Link color="error" target="_blank" href='https://cytoscape.org/download.html'>Cytoscape 3</Link> is
          installed and running before you try again.
        </Alert>
      );
    } else if (!data || data.length === 0) {
      content = (
        <Alert severity="info">
          <AlertTitle>No Networks</AlertTitle>
          The current Cytoscape 3 session has no networks.
        </Alert>
      );
    } else {
      content = (
        <RadioGroup
          ref={this.radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={e => this.handleChange(e)}
        >
          {data.map((v) => (
            <FormControlLabel key={v.SUID} value={v.SUID} label={v.name} control={<Radio />} />
          ))}
        </RadioGroup>
      );
    }
    
    const hasData = !error && data && data.length > 0;

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
          {content}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            variant="contained"
            color="default"
            startIcon={<CancelIcon />}
            onClick={() => this.handleCancel()}
          >
            {hasData  ? 'Cancel' : 'Close'}
          </Button>
          {hasData && (
            <Button
              autoFocus
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              disabled={value === null} 
              onClick={() => this.handleOk()}
            >
              Import
            </Button>
          )}
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