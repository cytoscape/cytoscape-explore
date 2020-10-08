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
    const suid = this.state.value;
    this.onClose();
    fetch(`http://localhost:1234/v1/networks/${suid}`)
      .then(res => res.json())
      .then(data => this.controller.setNetwork(data.elements, data.data));
  }

  handleChange(event) {
    this.setState(Object.assign(this.state, { value: Number(event.target.value) }));
  }

  componentDidMount() {
    fetch('http://localhost:1234/v1/networks.names')
      .then(res => res.json())
      .then(data => this.setState(Object.assign(this.state, { data: data })));
  }

  render() {
    const { open } = this.props;
    const { data, value } = this.state;
    console.log(typeof(value));

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