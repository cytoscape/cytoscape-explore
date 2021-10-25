import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Alert, AlertTitle } from '@material-ui/lab';
import {
  Checkbox,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  TextField,
  FormControlLabel,
  Button,

} from '@material-ui/core';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export class NDExExportDialog extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.onClose = props.onClose;

    this.state = {
      exportPublicNetwork: true,
      loading: false,
      step: 0,
      ndexNetworkURL: null,
    };

  }

  dirty(){
    this.setState({ dirty: Date.now() });
  }

  exportNetworkToNDEx(){
    const cy = this.controller.cy;
    const ndexClient = this.controller.ndexClient;
    const id = cy.data('id');
    this.setState({loading: true});

    if(ndexClient.authenticationType != null && ndexClient._authToken != null){
      let exportNDEx = async () => {
        let result = await fetch('/api/document/cx-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id,
            authToken: ndexClient._authToken,
            makePublic: this.state.exportPublicNetwork
          })
        });

        let body = await result.json();
        let { ndexNetworkURL } = body;

        this.setState({
          step: 1,
          loading: false,
          ndexNetworkURL
        });
      };
      exportNDEx();
    } else {
      this.controller.bus.emit('openGoogleLogin');
    }
  }

  render() {
    if(this.props.controller.ndexClient._authType !== 'g'){
      this.props.controller.bus.emit('openGoogleLogin');
    }

    let renderStep0 = (
      <Dialog
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={this.props.open}
        onBackdropClick={e => this.props.onClose(e)}
        onClose={e => this.props.onClose(e)}
        >
        <DialogTitle id="confirmation-dialog-title">Export Network to NDEx</DialogTitle>
        <DialogContent dividers style={{display: 'flex', flexDirection: 'column'}} >
          <TextField
            style={{marginBottom: '16px'}}
            autoFocus={true}
            label={'Network name'}
            placeholder={'My network'}
            onChange={(evt) => { this.props.controller.cy.data('name', evt.target.value); this.dirty();}}
            value={this.props.controller.cy.data('name')}
          />
          <FormControlLabel control={<Checkbox defaultChecked />} label="Public Network" />
        </DialogContent>
        <DialogActions>
          <Button
              variant="contained"
              color="primary"
              endIcon={<KeyboardArrowRightIcon />}
              onClick={() => this.exportNetworkToNDEx()}
            >
              Continue
          </Button>
        </DialogActions>
      </Dialog>
    );

    let renderStep1 = (
      <Dialog
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={this.props.open}
      onBackdropClick={e => this.props.onClose(e)}
      onClose={e => this.props.onClose(e)}
      >
      <DialogTitle id="confirmation-dialog-title">Export Network to NDEx</DialogTitle>
      <DialogContent dividers style={{display: 'flex', flexDirection: 'column'}} >
        <Alert variant="outlined" severity="success">
            <AlertTitle>Confirm Network Export</AlertTitle>
            <p><b>{this.props.controller.cy.data('name')} has been exported to NDEx</b> </p>
            <div>
              <span>Click </span>
              <a href={this.state.ndexNetworkURL} target={'_blank'} rel={'noreferrer'}>here </a>
              <span>to view it in NDEx.</span>
            </div>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button
            variant="contained"
            color="primary"
            endIcon={<KeyboardArrowLeftIcon />}
            onClick={() => this.setState({step: 0})}
          >
            Back
        </Button>
        <Button
              variant="contained"
              color="primary"
              endIcon={<CheckCircleIcon />}
              onClick={(e) => this.props.onClose(e)}
            >
              Finish
        </Button>
      </DialogActions>
    </Dialog>
    );

    if(this.state.step === 0){
      return renderStep0;
    } else {
      return renderStep1;
    }

  }
}

NDExExportDialog.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NDExExportDialog;