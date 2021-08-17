import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { AppLogoIcon } from '../svg-icons';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import DescriptionIcon from '@material-ui/icons/Description';
import { NetworkEditorController } from '../network-editor/controller';

const PARENT_STEP = {
  SELECT_A_WIZARD: "SELECT_A_WIZARD",
  SUB_WIZARD: "SUB_WIZARD",
  CONFIRM: "CONFIRM"
};

const SUB_WIZARD = {
  CY3: "CY3",
  NDEX: "NDEX",
  EXCEL: "EXCEL"
};

export class ImportWizard extends Component {

  constructor(props){
    super(props);
    this.controller = props.controller;

    this.state = {
      open: true,
      subWizardButton: null,
      parentStep: PARENT_STEP.SELECT_A_WIZARD,
    };
  }

  handleEntering() {
    
  }

  handleCancel() {
    this.setState({ open: false });
    this.props.onClose && this.props.onClose();
  }

  route() {
    // controller logic
  }

  render() {
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        onEntering={() => this.handleEntering()}
        aria-labelledby="confirmation-dialog-title"
        open={this.state.open}
      >
        <DialogTitle 
          disableTypography
          style={{ 'display':'flex', 'justify-content':'space-between', 'align-items':'center' }}
        >
          <h2>{this.renderTitleText()}</h2>
          <IconButton 
            aria-label="close" 
            onClick={() => this.handleCancel()}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {this.renderPage()}
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            disabled={!this.state.subWizardButton}
            variant="contained"
            color="primary"
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => this.handleCancel()}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderTitleText() {
    switch(this.state.parentStep) {
      case PARENT_STEP.SELECT_A_WIZARD: 
        return "Import Network";
    }
  }

  renderPage() {
    switch(this.state.parentStep) {
      case PARENT_STEP.SELECT_A_WIZARD: 
        return this.renderWizardSelector();
    }
  }

  renderWizardSelector() {
    const handleButton = (subWizardButton) => this.setState({ subWizardButton });
    return (
      <List subheader={<ListSubheader>Import From...</ListSubheader>}>
        <ListItem
          button
          selected={this.state.subWizardButton === SUB_WIZARD.CY3}
          onClick={() => handleButton(SUB_WIZARD.CY3)}
        >
          <ListItemIcon>
            <img width={32} height={32} src={'/images/cytoscape_logo_512.png'} />
          </ListItemIcon>
          <ListItemText primary="Cytoscape Desktop" />
        </ListItem>
        <ListItem
          button
          selected={this.state.subWizardButton === SUB_WIZARD.NDEX}
          onClick={() => handleButton(SUB_WIZARD.NDEX)}
        >
          <ListItemIcon>
            <img width={32} height={32} src={'/images/ndex_400x400.jpeg'} />
          </ListItemIcon>
          <ListItemText primary="NDEx (ndexbio.org)" />
        </ListItem>
        <ListItem
          button
          selected={this.state.subWizardButton === SUB_WIZARD.EXCEL}
          onClick={() => handleButton(SUB_WIZARD.EXCEL)}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Excel File" />
        </ListItem>
      </List>
    );
  }

}

ImportWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default ImportWizard;