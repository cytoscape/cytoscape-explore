import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import CircularProgress from '@material-ui/core/CircularProgress';
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
      loading: true,
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

  async handleOk() {
    this.setState({ loading: true });

    // Return array of View SUIDs
    const fetchViewIds = async (netId) => {
      const res = await fetch(`${CY3_URL}/v1/networks/${netId}/views`);
      return res.ok ? await res.json() : [];
    };

    // Return Network or View data (json) 
    const fetchNetworkOrView = async (netId, viewId) => {
      // If no views, import just the network
      const url = viewId ?
        `${CY3_URL}/v1/networks/${netId}/views/${viewId}` :
        `${CY3_URL}/v1/networks/${netId}`; 
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`CyREST error! status: ${res.status}`);
      } else {
        return await res.json();
      }
    };

    // Return the Style for the passed view
    const fetchStyle = async (netId, viewId) => {
      const res = await fetch(`${CY3_URL}/v1/networks/${netId}/views/${viewId}/currentStyle`);
      
      if (!res.ok) {
        throw new Error(`CyREST error! status: ${res.status}`);
      } else {
        return await res.json();
      }
    };

    try {
      const netId = this.state.value;
      const viewIds = await fetchViewIds(netId);
      const viewId = viewIds && viewIds.length > 0 ? viewIds[0] : undefined;
      const net = await fetchNetworkOrView(netId, viewId);
      const style = viewId ? await fetchStyle(netId, viewId) : undefined;
      
      this.controller.setNetwork(net.elements, net.data, style);
    } catch(e) {
      console.log(e); // TODO Show error to user
    }

    this.onClose();
  }

  handleChange(event) {
    this.setState({ value: Number(event.target.value) });
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
      .then(data => this.setState({ data: data.sort(compareByName), error: null, loading: false }))
      .catch(err => this.setState({ error: err, loading: false }));
  }

  render() {
    const { open } = this.props;
    const { data, value, error, loading } = this.state;
    let content = null;

    if (loading) {
      content = (
        <div style={{ textAlign: 'center', }}>
          <CircularProgress color="secondary" />
        </div>
      );
    } else if (error) {
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
            {hasData || loading  ? 'Cancel' : 'Close'}
          </Button>
          {hasData && (
            <Button
              autoFocus
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              disabled={value === null || loading} 
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