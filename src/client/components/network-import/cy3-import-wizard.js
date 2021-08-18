import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';

export class Cy3ImportSubWizard extends Component {

  constructor(props) {
    super(props);

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.state = {
      step: 1
    };
  }

  componentDidMount() {
    this.updateButtons(this.state.step);
  }

  // also gets called when this sub-wizard is first displayed
  updateButtons(step) {
    const { setButtonState } = this.props.wizardCallbacks;
    switch(step) {
      case 1: 
        setButtonState({
          continueButton: 'disabled',
        });
        break;
      case 3:
        setButtonState({
          continueButton: 'hidden',
          finishButton: 'enabled'
        });
        break;
    }
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.updateButtons(step);
    this.setState({ step });
    return step;
  }

  handleContinue() {
    this.updateStep((step) => step + 1);
  }

  handleBack() {
    const step = this.updateStep((step) => step - 1);
    if(step == 0)
      this.props.wizardCallbacks.returnToSelector();
  }

  handleFinish() {
    this.props.wizardCallbacks.closeWizard();
  }

  render() {
    return (
      <div>
        <div>
        <Stepper activeStep={this.state.step}>
          <Step key={1}><StepLabel>Connect to Cytoscape Desktop</StepLabel></Step>
          <Step key={2}><StepLabel>Select a Network</StepLabel></Step>
          <Step key={3}><StepLabel>Import Network</StepLabel></Step>
        </Stepper>
        </div>
        <div>
          {(() => {
            switch(this.state.step) {
              case 1: return this.renderStep1();
              case 2: return this.renderStep2();
              case 3: return this.renderStep3();
            }
          })() }
        </div>
      </div>
    );
  }

  renderStep1() {
    return (
      <div>
        <Typography>Step 1</Typography>
        <Button
          onClick={() => this.props.wizardCallbacks.setButtonState({ continueButton: 'enabled' })}
        >
          You, you know the thing!
        </Button>
      </div>
    );
  }

  renderStep2() {
    return (
      <Typography>Step 2</Typography>
    );
  }

  renderStep3() {
    return (
      <Typography>Step 3</Typography>
    );
  }

}

Cy3ImportSubWizard.propTypes = {
  step: PropTypes.number,
  wizardCallbacks: PropTypes.any
};

export default Cy3ImportSubWizard;