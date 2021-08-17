import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { BUTTON_STATE } from './import-wizard';


export class Cy3ImportSubWizard extends Component {

  constructor(props){
    super(props);
  }

  componentDidMount() {
    if(this.props.step == 1) {
      this.props.setButtonState({
        continueButton: BUTTON_STATE.DISABLED,
      });
    }
  }

  render() {
    return (
      <div>
        <div>
        <Stepper activeStep={this.props.step}>
          <Step key={1}><StepLabel>Connect to Cytoscape Desktop</StepLabel></Step>
          <Step key={2}><StepLabel>Select a Network</StepLabel></Step>
          <Step key={3}><StepLabel>Import Network</StepLabel></Step>
        </Stepper>
        </div>
        <div>
          {(() => {
            switch(this.props.step) {
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
          onClick={() => this.props.setButtonState({ continueButton: BUTTON_STATE.ENABLED })}
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
  setButtonState: PropTypes.func,
};

export default Cy3ImportSubWizard;