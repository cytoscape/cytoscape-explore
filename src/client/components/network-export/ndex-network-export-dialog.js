import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Alert, AlertTitle } from '@material-ui/lab';
import _ from 'lodash';
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
  Tooltip,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Divider,
  
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterNoneSharpIcon from '@material-ui/icons/FilterNoneSharp';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';

import { CX_DATA_KEY } from '../../../model/import-export/cx/cx-util';

export class CopyLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false
    };
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

    this.onGoogleLogout = () => this.dirty();
    this.onGoogleLogin = () => this.dirty();

    this.props.controller.bus.on('googleLogin', this.onGoogleLogin);
    this.props.controller.bus.on('googleLogout', () => this.onGoogleLogout);

    this.state = {
      exportPublicNetwork: true,
      loading: false,
      step: 0,
      ndexNetworkURL: null,
      ndexNetworkId: null,
    };
  }

  componentWillUnmount(){
    this.props.controller.bus.removeListener('googleLogin', this.onGoogleLogin);
    this.props.controller.bus.removeListener('googleLogout', this.onGoogleLogout);
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
    }
  }

  render() {
    const isAuthenticated = this.props.controller.ndexClient.authenticationType != null && this.props.controller.ndexClient._authToken != null;

    const step0Content = !isAuthenticated ? (
      <DialogContent dividers className="export-ndex-network-content" >
        <Link href="" onClick={(e) => {
          e.preventDefault();
          this.props.controller.bus.emit('openGoogleLogin');
        }}>Sign in to NDEx to export this network to your account</Link> 
      </DialogContent>
    ) : (
      <DialogContent dividers className="export-ndex-network-content" >
      {_.get(this.controller.cy.data(), [CX_DATA_KEY, 'unsupported-cx-properties'], null) != null ?
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Alert className="export-ndex-network-alert" variant="outlined" severity="warning">
            <AlertTitle>Some visual properties are not supported in Cytoscape Explore</AlertTitle>
          </Alert>
        </AccordionSummary>
        <AccordionDetails className="export-ndex-network-property-list">
          <Link color="primary" target="_blank" href="">Learn more about portable Cytoscape styles</Link>
          <div>Unsupported properties found in your network:</div>
            {Object.entries(
              _.groupBy(
                _.get(this.controller.cy.data(), [CX_DATA_KEY, 'unsupported-cx-properties'], []),
                vpName => vpName.split('_')[0]
            )).map(([group, entries]) => {
              return (
                <div key={group}>
                  <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                      {group}
                    </AccordionSummary>
                    <AccordionDetails>
                    <List>
                    {entries.map((e, i) => <div key={i}>{e}</div>)}
                    </List>
                    </AccordionDetails>
                  </Accordion>
                  <Divider/>
                </div>
              );
            })}
        </AccordionDetails>
      </Accordion> : null
      }
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
        <MenuItem value={true}>Unlisted</MenuItem>
        <MenuItem value={false}>Private</MenuItem>
    </Select>
    </DialogContent>
    );

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
        <DialogTitle  disableTypography className="export-ndex-network-header">
          <h2>Export Network to NDEx</h2>
          <IconButton 
            aria-label="close" 
            onClick={(e) => this.props.onClose(e)}>
            <CloseIcon />
          </IconButton>
          </DialogTitle>
          {step0Content}
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

CopyLink.propTypes = {
  title: PropTypes.string.isRequired,
  linkContent: PropTypes.string.isRequired
};

export default NDExExportDialog;