import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Alert, AlertTitle } from '@material-ui/lab';
import {
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Box

} from '@material-ui/core';

import FilterNoneSharpIcon from '@material-ui/icons/FilterNoneSharp';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';

export class CopyLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false
    }
  }
  
  handleCopyClick(content){
    navigator.clipboard.writeText(content).then(() => {
      this.setState({
        copied: true
      });  
    });
  }

  render(){
    const { title, linkContent } = this.props;
    return (
    <div className="ndex-link-container" onClick={ (e) => this.handleCopyClick(linkContent)}> 
      <div className="ndex-link-title">{title}</div>  
      <div className="ndex-link-content">
        <div className="ndex-link-value">{linkContent}</div>
        <div className="ndex-link-copy">
          <FilterNoneSharpIcon/>
        </div>
      </div>
      <Snackbar
        open={this.state.copied}
        autoHideDuration={4000}
        onClose={() => this.setState({copied: false})}
      >
        <Alert severity="info">
          {`${title} copied!`}
        </Alert>
      </Snackbar>
    </div>
    );
  }
} 


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
      ndexNetworkId: null,
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
        let { uuid: ndexNetworkId, ndexNetworkURL } = body;

        this.setState({
          step: 1,
          loading: false,
          ndexNetworkURL,
          ndexNetworkId
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
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        aria-labelledby="confirmation-dialog-title"
        open={this.props.open}
        onClose={e => this.props.onClose(e)}
        >
        <DialogTitle 
          disableTypography
          className="export-ndex-network-header"
        >
          <h2>Export Network to NDEx</h2>
          <IconButton 
            aria-label="close" 
            onClick={(e) => this.props.onClose(e)}>
            <CloseIcon />
          </IconButton>
          </DialogTitle>
        <DialogContent dividers className="export-ndex-network-content" >
          <TextField
            className="export-ndex-network-content-block"
            autoFocus={true}
            label={'Network name'}
            placeholder={'My network'}
            onChange={(evt) => { this.props.controller.cy.data('name', evt.target.value); this.dirty();}}
            value={this.props.controller.cy.data('name')}
          />
          <InputLabel id="network-visibility-select">Visibility</InputLabel>
          <Select
            labelId="network-visibility-select"
            value={this.state.exportPublicNetwork}
            onChange={e => this.setState({exportPublicNetwork: e.target.value})}
          >
            <MenuItem value={true}>Public</MenuItem>
            <MenuItem value={false}>Private</MenuItem>
          </Select>
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
      maxWidth="sm"
      fullWidth
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="confirmation-dialog-title"
      open={this.props.open}
      onBackdropClick={e => this.props.onClose(e)}
      onClose={e => this.props.onClose(e)}
      >
        <DialogTitle 
          disableTypography
          className="export-ndex-network-header"
        >
          <h2>Export Network to NDEx</h2>
          <IconButton 
            aria-label="close" 
            onClick={e => this.props.onClose(e)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>      
        <DialogContent dividers className="export-ndex-network-content" >
        <Alert variant="outlined" severity="success">
            <AlertTitle>Confirm Network Export</AlertTitle>
            <p><b>{this.props.controller.cy.data('name')} has been exported to NDEx</b> </p>
        </Alert>

        <CopyLink title={'NDEx Network URL'} linkContent={this.state.ndexNetworkURL}/>
        <CopyLink title={'NDEx Network ID'} linkContent={this.state.ndexNetworkId}/>
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