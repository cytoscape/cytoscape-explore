import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { LinearProgress } from '@material-ui/core';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';

export class ImportWizard extends React.Component {

  constructor(props){
    super(props);

    this.wizardCallbacks = {
      _onFinish:   () => null,
      _onContinue: () => null,
      _onCancel:   () => null,
      _onBack:     () => null,
      onFinish:   (f) => this.wizardCallbacks._onFinish = f,
      onContinue: (f) => this.wizardCallbacks._onContinue = f,
      onCancel:   (f) => this.wizardCallbacks._onCancel = f,
      onBack:     (f) => this.wizardCallbacks._onBack = f,
      setSteps:   (s) => this.handleSteps(s),
      setCurrentStep:  (s) => this.handleCurrentStep(s),
      setButtonState:  (s) => this.handleButtonState(s),
      closeWizard:      () => this.setState({ open: false }),
      returnToSelector: () => this.handleReturnToSelector(),
      sanity: 99,
    };

    this.state = {
      open: true,
      steps: null,
      step: null,
      loading: false,
      // button state... can be 'enabled', 'disabled' or 'hidden'
      nextButton: 'hidden',
      backButton: 'hidden',
      finishButton: 'hidden',
    };
  }

  handleCancel() {
    this.setState({ open: false });

    this.wizardCallbacks._onClose && this.wizardCallbacks._onClose();
    this.wizardCallbacks._onCancel && this.wizardCallbacks._onCancel();
    
    this.props.onClose && this.props.onClose();
  }

  handleContinue() {
    this.wizardCallbacks._onContinue && this.wizardCallbacks._onContinue();
  }

  handleBack() {
    this.wizardCallbacks._onBack();
  }

  handleFinish() {
    this.setState({ loading: true });
    this.wizardCallbacks._onFinish && this.wizardCallbacks._onFinish();
  }

  handleReturnToSelector() {
    this.setState({ 
      backButton: 'hidden',
      nextButton: 'hidden',
      finishButton: 'hidden',
      steps: null,
      step: null,
    });
  }

  handleSteps({ steps }) {
    if (steps)
      this.setState({ steps });
  }

  handleCurrentStep({ step }) {
    if (step)
      this.setState({ step });
  }

  handleButtonState({ nextButton, backButton, finishButton }) {
    if (nextButton)
      this.setState({ nextButton });
    if (backButton)
      this.setState({ backButton });
    if (finishButton)
      this.setState({ finishButton });
  }

  render() {
    const { steps, step, loading } = this.state;
    const Wizard = this.props.wizard;
    const wizardProps = this.props.wizardProps || {};
    
    let optional = false;
    let title;

    if (steps && step && steps.length > 0) {
      optional = steps[step - 1].optional === true;
      title = steps[step - 1].label;
    
      if (steps.length > 1)
        title = step + ' of ' + steps.length + (title ? " \u2014 " + title : '');
    }

    return (
      <Dialog
        className='import-dialog'
        disableEscapeKeyDown
        fullWidth
        maxWidth='sm'
        scroll='paper'
        open={this.state.open}
      >
        <DialogTitle
          disableTypography
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 24px' }}
        >
          <h2>{ title }{ optional ? <sup style={{ fontWeight: 'normal', fontSize: 'smaller', paddingLeft: 10 }}>(optional)</sup> : '' }</h2>
          <IconButton 
            aria-label='close' 
            onClick={() => this.handleCancel()}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          style={{ padding: '8px 24px' }}
          dividers
        >
          <>
            { loading &&
              <LinearProgress />
            }
            { <Wizard wizardCallbacks={this.wizardCallbacks} {...wizardProps} /> }
          </>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="space-between" spacing={2}>
            { this.state.backButton !== 'hidden' &&
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading || this.state.backButton !== 'enabled'}
                  startIcon={<KeyboardArrowLeftIcon />}
                  onClick={() => this.handleBack()}
                >
                  Back
                </Button>
              </Grid>
            }
            <Grid item style={{ flexGrow: 1 }} />
            { this.state.finishButton !== 'hidden' &&
              <Grid item>
                <Button
                  disabled={loading || this.state.finishButton !== 'enabled'}
                  variant="contained"
                  color="primary"
                  endIcon={<CheckCircleIcon />}
                  onClick={() => this.handleFinish()}
                >
                  Import
                </Button>
              </Grid>
            }
            { this.state.nextButton !== 'hidden' &&
              <Grid item>
                <Button
                  autoFocus
                  disabled={loading || this.state.nextButton !== 'enabled'}
                  variant="contained"
                  color="primary"
                  endIcon={<KeyboardArrowRightIcon />}
                  onClick={() => this.handleContinue()}
                >
                  Next
                </Button>
              </Grid>
            }
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

const useStyles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    margin: 0,
  },
  item: {
    margin: 0,
  },
  button: {
    margin: 0,
    textTransform: 'unset',
  },
  label: {
    textTransform: 'none',
  },
  startIcon: {
    marginLeft: 0,
    marginRight: 0,
  },
});

ImportWizard.propTypes = {
  wizard: PropTypes.func.isRequired,
  wizardProps: PropTypes.any,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withStyles(useStyles)(ImportWizard);