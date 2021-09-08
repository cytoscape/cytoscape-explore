import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { Input } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import Cytoscape from 'cytoscape';
import uuid from 'uuid';


import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import { importCX } from '../../../model/import-export/cx';
import CytoscapeSyncher from '../../../model/cytoscape-syncher';



import FormControl from '@material-ui/core/FormControl';

import Button from '@material-ui/core/Button';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';

import * as ndex from 'ndex-client';

const NDEX_URL = 'https://dev.ndexbio.org';

export class NDExNetworkImportDialog extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.onClose = props.onClose;

    this.state = {
      ndexUrl: `${NDEX_URL}`,
      uuid: "135fe4e5-9896-11eb-81d5-525400c25d22",
      error: null,
      loading: true,
    };
  }

  handleCancel() {
    this.onClose();
  }

  async handleOk() {
    this.setState({ loading: true });

    const ndex0 = new ndex.NDEx(NDEX_URL + '/v2');

    // Return the Style for the passed view

    try {
      const ndexuuid = this.state.uuid;
      //const ndexUrl = this.state.ndexUrl;

      const rawcx2 = await ndex0.getCX2Network(ndexuuid);

      const cy = new Cytoscape();

      const tid = 'cy' + uuid();

      cy.data({ id: tid });

      const cySyncher = new CytoscapeSyncher(cy, 'secret');

      importCX(cy, rawcx2);

      this.controller.setNetwork(cy.elements, cy.data, cy.style());

    } catch (e) {
      console.log(e); // TODO Show error to user
    }

    this.onClose();
  }

  handleChange(event) {
    switch (event.target.id) {
      case 'ndex-server-input': this.setState({ ndexUrl: event.target.value }); return;
      case 'network-uuid-input': this.setState({ uuid: event.target.value }); return;
    }
  }

  componentDidMount() {
 /*   const compareByName = function (a, b) {
      var na = a.name.toUpperCase(); // ignore upper and lowercase
      var nb = b.name.toUpperCase(); // ignore upper and lowercase
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    };

    fetch(`${NDEX_URL}/v1/networks.names`)
      .then(res => res.json())
      .then(data => this.setState({ data: data.sort(compareByName), error: null, loading: false }))
      .catch(err => this.setState({ error: err, loading: false })); */
  }



  render() {
    const { open } = this.props;
    const { ndexUrl, loading, uuid, error } = this.state;
    let content = null;


    content = (
      <form noValidate autoComplete="off">
        <FormControl>
          <InputLabel htmlFor="component-simple">NDEx Server</InputLabel>
          <Input id="ndex-server-input" value={ndexUrl} onChange={e => this.handleChange(e)} />
        </FormControl>
        <FormControl>
          <InputLabel htmlFor="component-simple">Network UUID</InputLabel>
          <Input id="network-uuid-input" value={uuid} onChange={e => this.handleChange(e)} />
        </FormControl>
      </form>
    );


    const hasData = !error;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"

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
            {hasData || loading ? 'Cancel' : 'Close'}
          </Button>

          <Button
            autoFocus
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => this.handleOk()}
          >
            Import
            </Button>

        </DialogActions>
      </Dialog>
    );
  }
}

NDExNetworkImportDialog.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NDExNetworkImportDialog;