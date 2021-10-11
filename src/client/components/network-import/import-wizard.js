import React from 'react';
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
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import DescriptionIcon from '@material-ui/icons/Description';
import Cy3ImportSubWizard from './cy3-import-wizard';
import { NetworkEditorController } from '../network-editor/controller';
import NDExImportSubWizard from './ndex-import-wizard';


const PARENT_STEP = {
  SELECT_A_WIZARD: "SELECT_A_WIZARD",
  SUB_WIZARD: "SUB_WIZARD"
};

const SUB_WIZARD = {
  UNSELECTED: null,
  CY3: "CY3",
  NDEX: "NDEX",
  EXCEL: "EXCEL"
};


export class ImportWizard extends React.Component {

  constructor(props){
    super(props);
    this.controller = props.controller;

    this.wizardCallbacks = {
      _onFinish:   () => null,
      _onContinue: () => null,
      _onCancel:   () => null,
      _onBack:     () => null,
      onFinish:   (f) => this.wizardCallbacks._onFinish = f,
      onContinue: (f) => this.wizardCallbacks._onContinue = f,
      onCancel:   (f) => this.wizardCallbacks._onCancel = f,
      onBack:     (f) => this.wizardCallbacks._onBack = f,
      setButtonState:  (s) => this.handleButtonState(s),
      closeWizard:      () => this.setState({ open: false }),
      returnToSelector: () => this.handleReturnToSelector(),
      sanity: 99,
    };

    this.state = {
      open: true,
      parentStep: PARENT_STEP.SELECT_A_WIZARD,
      subWizard: SUB_WIZARD.UNSELECTED,
      subWizardButton: SUB_WIZARD.UNSELECTED,
      // button state... can be 'enabled', 'disabled' or 'hidden'
      continueButton: 'disabled',
      backButton: 'hidden',
      finishButton: 'hidden',
      cancelButton: 'hidden'
    };
  }

  handleEntering() {
    // ???
  }

  handleCancel() {
    this.setState({ open: false });
    this.props.onClose && this.props.onClose();
    this.wizardCallbacks._onCancel();
  }

  handleContinue() {
    if(this.state.parentStep == PARENT_STEP.SELECT_A_WIZARD) {
      this.setState({ 
        parentStep: PARENT_STEP.SUB_WIZARD,
        subWizard: this.state.subWizardButton,
        backButton: 'enabled'
      });
    } 
    this.wizardCallbacks._onContinue();
  }

  handleBack() {
    this.wizardCallbacks._onBack();
  }

  handleFinish() {
    this.wizardCallbacks._onFinish();
  }

  handleReturnToSelector() {
    this.setState({ 
      parentStep: PARENT_STEP.SELECT_A_WIZARD,
      backButton: 'hidden',
      finishButton: 'hidden',
      cancelButton: 'hidden',
      continueButton: this.state.subWizardButton ? 'enabled' : 'disabled'
    });
  }

  handleButtonState({ continueButton, backButton, finishButton, cancelButton }) {
    if(continueButton)
      this.setState({ continueButton });
    if(backButton)
      this.setState({ backButton });
    if(finishButton)
      this.setState({ finishButton });
    if(cancelButton)
      this.setState({ cancelButton });
  }

  render() {
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth
        maxWidth='sm'
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
          { this.state.backButton !== 'hidden' &&
            <Button
              variant="contained"
              color="primary"
              disabled={this.state.backButton !== 'enabled'}
              startIcon={<KeyboardArrowLeftIcon />}
              onClick={() => this.handleBack()}
            >
              Back
            </Button>
          }
          { this.state.continueButton !== 'hidden' &&
            <Button
              autoFocus
              disabled={this.state.continueButton !== 'enabled'}
              variant="contained"
              color="primary"
              endIcon={<KeyboardArrowRightIcon />}
              onClick={() => this.handleContinue()}
            >
              Continue
            </Button>
          }
          { this.state.cancelButton !== 'hidden' &&
            <Button
              disabled={this.state.cancelButton !== 'enabled'}
              variant="contained"
              color="primary"
              endIcon={<CancelIcon />}
              onClick={() => this.handleCancel()}
            >
              Cancel
            </Button>
          }
          { this.state.finishButton !== 'hidden' &&
            <Button
              disabled={this.state.finishButton !== 'enabled'}
              variant="contained"
              color="primary"
              endIcon={<CheckCircleIcon />}
              onClick={() => this.handleFinish()}
            >
              Finish
            </Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
  
  renderTitleText() {
    switch(this.state.parentStep) {
      case PARENT_STEP.SELECT_A_WIZARD: return "Import Network";
      case PARENT_STEP.SUB_WIZARD:
        switch(this.state.subWizard) {
          case SUB_WIZARD.CY3:   return "Import from Cytoscape Desktop";
          case SUB_WIZARD.NDEX:  return "Import from NDEx";
          case SUB_WIZARD.EXCEL: return "Import from Excel File";
        }
        break;
    }
  }

  renderPage() {
    switch(this.state.parentStep) {
      case PARENT_STEP.SELECT_A_WIZARD: 
        return this.renderWizardSelector();
      case PARENT_STEP.SUB_WIZARD:
        return this.renderSubWizard();
    }
  }

  renderWizardSelector() {
    const handleButton = (subWizardButton) => {
      this.setState({ 
        subWizardButton, 
        continueButton: 'enabled' 
      });
    };

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

  renderSubWizard() {
    switch(this.state.subWizard) {
      case SUB_WIZARD.CY3: 
        return <Cy3ImportSubWizard  controller={this.controller} wizardCallbacks={this.wizardCallbacks} />;
      case SUB_WIZARD.NDEX:
        return <NDExImportSubWizard controller={this.controller} wizardCallbacks={this.wizardCallbacks} />;
    }
  }

}

ImportWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default ImportWizard;