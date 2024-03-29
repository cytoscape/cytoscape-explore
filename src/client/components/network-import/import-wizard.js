import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { LinearProgress, MobileStepper } from '@material-ui/core';
import { Slide } from '@material-ui/core';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CloseIcon from '@material-ui/icons/Close';

export class ImportWizard extends React.Component {

  constructor(props){
    super(props);

    this.wizardCallbacks = {
      _onFinish:    () => null,
      _onContinue:  () => null,
      _onCancel:    () => null,
      _onBack:      () => null,
      onFinish:    (f) => this.wizardCallbacks._onFinish = f,
      onContinue:  (f) => this.wizardCallbacks._onContinue = f,
      onCancel:    (f) => this.wizardCallbacks._onCancel = f,
      onBack:      (f) => this.wizardCallbacks._onBack = f,
      setCanContinue:  (b) => this.handleCanContinue(b),
      setSteps:        (s) => this.handleSteps(s),
      setCurrentStep:  (s) => this.handleCurrentStep(s),
      closeWizard:      () => this.setState({ open: false }),
      sanity: 99,
    };

    this.state = {
      open: true,
      steps: null,
      step: null,
      forward: false,
      backward: false,
      loading: false,
      canContinue: false,
    };

    this.lastStep = 0;
    this.exited = true; // Will indicate whether or not the next/back transition has exited
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

  handleSteps({ steps }) {
    if (steps)
      this.setState({ steps });
  }

  handleCurrentStep({ step }) {
    if (step) {
      const forward = step > 0 && step > this.state.step;
      const backward = step > 0 && step < this.state.step;
      this.setState({ step, forward, backward });
    }
  }

  handleCanContinue({ canContinue }) {
    this.setState({ canContinue });
  }

  render() {
    const { steps, step, forward, backward, loading, canContinue } = this.state;
    const { classes } = this.props;
    const Wizard = this.props.wizard;
    const wizardProps = this.props.wizardProps || {};
    
    let optional = false;
    let title;

    if (steps && step && steps.length > 0) {
      optional = steps[step - 1].optional === true;
      title = steps[step - 1].label;
    }

    const PROGRESS_HEIGHT = 4;
    
    // The animation on the wizard content must always exit before it enters the trasition again,
    // so we need to keep track of this 'exited' flag in order to trigger the forward/backward state in the right moment.
    const onEntered = () => {
      this.exited = false;
      this.lastStep = step;
    };
    const onExited = () => {
      this.exited = true;
      this.setState({ forward, backward });
    };

    const enterAnimation = (forward || backward) && this.exited;
    const animate =
      enterAnimation && step != this.lastStep // don't animate the same step again (it may me re-rendered to update a component)
      && ((forward && this.lastStep > 0) || (backward && this.lastStep > 1)); // don't animate the first step, unless it's going backwards from step 2.

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
          <IconButton aria-label='close' onClick={() => this.handleCancel()}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          style={{ padding: '8px 24px' }}
          dividers
        >
          <Slide
            in={enterAnimation}
            direction={forward ? 'left' : 'right'}
            exit={false}
            timeout={{ enter: (animate ? 250 : 0) }} // To look like we turned off the animation when rendering the same step again
            onEntered={onEntered}
            onExited={onExited}
          >
            <Wizard wizardCallbacks={this.wizardCallbacks} {...wizardProps} />
          </Slide>
        </DialogContent>
        <LinearProgress style={{ height: PROGRESS_HEIGHT, visibility: loading ? 'inherit' : 'hidden' }} />
        <DialogActions style={{ marginTop: -PROGRESS_HEIGHT }}>
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item className={classes.root}>
              { steps && (
                <MobileStepper
                  variant="dots"
                  steps={steps.length}
                  position="static"
                  activeStep={step - 1}
                  classes={{ root: classes.stepperRoot, dots: (steps.length > 1 ? classes.visibleSteps : classes.hiddenSteps) }}
                  backButton={
                    <Button
                      variant="contained"
                      className={classes.button}
                      style={{ visibility: step > 1 ? 'inherit' : 'hidden' }}
                      startIcon={<KeyboardArrowLeftIcon />}
                      onClick={() => this.handleBack()}
                      disabled={step === 1}
                    >
                      Back
                    </Button>
                  }
                  nextButton={
                    <Button
                      variant="contained"
                      color={step === steps.length ? 'primary' : 'default'}
                      className={classes.button}
                      endIcon={step === steps.length ? null : <KeyboardArrowRightIcon />}
                      onClick={() => step === steps.length ? this.handleFinish() : this.handleContinue()}
                      disabled={loading || !canContinue}
                    >
                      { step === steps.length ? 'Import' : 'Next' }
                    </Button>
                  }
                />
              )}
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

const useStyles = theme => ({
  root: {
    flexGrow: 1,
  },
  stepperRoot: {
    backgroundColor: 'transparent',
  },
  visibleSteps: {
    visibility: 'inherit',
  },
  hiddenSteps: {
    visibility: 'hidden',
  },
  button: {
    minWidth: 92, // Just so the 'Back', 'Next' and 'Import' buttons have the same size
    // textTransform: 'unset',
  },
});

ImportWizard.propTypes = {
  classes: PropTypes.object.isRequired,
  wizard: PropTypes.func.isRequired,
  wizardProps: PropTypes.any,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withStyles(useStyles)(ImportWizard);