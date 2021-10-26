import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Button, IconButton, Tooltip, Fade } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { LinearProgress } from '@material-ui/core';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import CancelIcon from '@material-ui/icons/Cancel';
import DescriptionIcon from '@material-ui/icons/Description';
import { Cy3LogoIcon, NDExLogoIcon } from '../svg-icons';
import Cy3ImportSubWizard from './cy3-import-wizard';
import ExcelImportSubWizard from './excel-import-wizard';
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

const itemStyle = {
  padding: '6px',
};

const logoIconProps = {
  viewBox: '0 0 64 64',
  p: 0,
  m: 0,
};

const logoIconStyle = {
  width: 'auto',
  fontSize: '2rem',
  margin: 0, 
  fill: '#fff',
};

const WIZARDS = [
  {
    id: SUB_WIZARD.CY3,
    label: "Cytoscape 3",
    tooltip: "Cytoscape Desktop",
    icon: <Cy3LogoIcon {...logoIconProps} style={{...logoIconStyle}} />,
    color: '#ea9123',
  },
  {
    id: SUB_WIZARD.NDEX,
    label: "NDEx",
    tooltip: "ndexbio.org",
    icon: <NDExLogoIcon {...logoIconProps} style={{...logoIconStyle}} />,
    color: '#0087d2',
  },
  {
    id: SUB_WIZARD.EXCEL,
    label: "Excel File",
    tooltip: "Excel or CSV file",
    icon: <DescriptionIcon style={{...logoIconStyle}} />,
    color: '#107c41',
  },
];

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
      setSteps:   (s) => this.handleSteps(s),
      setCurrentStep:  (s) => this.handleCurrentStep(s),
      setButtonState:  (s) => this.handleButtonState(s),
      closeWizard:      () => this.setState({ open: false }),
      returnToSelector: () => this.handleReturnToSelector(),
      sanity: 99,
    };

    this.state = {
      open: true,
      parentStep: PARENT_STEP.SELECT_A_WIZARD,
      subWizard: SUB_WIZARD.UNSELECTED,
      steps: null,
      step: null,
      loading: false,
      // button state... can be 'enabled', 'disabled' or 'hidden'
      nextButton: 'hidden',
      backButton: 'hidden',
      finishButton: 'hidden',
      cancelButton: 'enabled',
    };
  }

  handleCancel() {
    this.setState({ open: false });
    this.props.onClose && this.props.onClose();
    this.wizardCallbacks._onCancel();
  }

  handleContinue() {
    if (this.state.parentStep == PARENT_STEP.SELECT_A_WIZARD) {
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
    this.setState({ loading: true });
    this.wizardCallbacks._onFinish();
  }

  handleReturnToSelector() {
    this.setState({ 
      parentStep: PARENT_STEP.SELECT_A_WIZARD,
      backButton: 'hidden',
      nextButton: 'hidden',
      finishButton: 'hidden',
      cancelButton: 'enabled',
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

  handleButtonState({ nextButton, backButton, finishButton, cancelButton }) {
    if (nextButton)
      this.setState({ nextButton });
    if (backButton)
      this.setState({ backButton });
    if (finishButton)
      this.setState({ finishButton });
    if (cancelButton)
      this.setState({ cancelButton });
  }

  render() {
    const { steps, step, loading } = this.state;
    let title = steps && step ? steps[step - 1].label : null;

    if (steps && steps.length > 1)
      title = step + '/' + steps.length + " \u2014 " + title;

    return (
      <Dialog
        className='import-dialog'
        disableEscapeKeyDown
        fullWidth
        maxWidth='sm'
        open={this.state.open}
      >
        <DialogTitle
          disableTypography
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 24px' }}
        >
          <h2>{ this.renderTitleText() }</h2>
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
            { steps && step &&
              <h3>{ title }</h3>
            }
            { this.renderPage() }
          </>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="space-between" spacing={10}>
            <Grid item>
              { this.state.backButton !== 'hidden' &&
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading || this.state.backButton !== 'enabled'}
                  startIcon={<KeyboardArrowLeftIcon />}
                  onClick={() => this.handleBack()}
                >
                  Back
                </Button>
              }
            </Grid>
            <Grid item>
              <Grid container justifyContent="space-between" spacing={2}>
                { this.state.cancelButton !== 'hidden' &&
                  <Grid item>
                    <Button
                      disabled={this.state.cancelButton !== 'enabled'}
                      variant="outlined"
                      color="primary"
                      endIcon={<CancelIcon />}
                      onClick={() => this.handleCancel()}
                    >
                      Cancel
                    </Button>
                  </Grid>
                }
                { this.state.finishButton !== 'hidden' &&
                  <Grid item>
                    <Button
                      disabled={loading || this.state.finishButton !== 'enabled'}
                      variant="contained"
                      color="primary"
                      endIcon={<CheckCircleIcon />}
                      onClick={() => this.handleFinish()}
                    >
                      Finish
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
            </Grid>
          </Grid>
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
    const classes = useStyles();

    const handleButton = (subWizardButton) => {
      this.setState({ 
        parentStep: PARENT_STEP.SUB_WIZARD,
        subWizard: subWizardButton,
        backButton: 'enabled'
      });
      this.wizardCallbacks._onContinue();
    };

    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        className={classes.root}
        spacing={2}
        style={{margin: 8}}
      >
        <Grid item xs={12}>
          <Grid container direction="column" justifycontent="center" spacing={4}>
            {WIZARDS.map((w) => (
              <Grid key={w.id} item style={{...itemStyle}}>
                <Tooltip
                  arrow
                  placement="right"
                  enterDelay={500}
                  TransitionComponent={Fade}
                  TransitionProps={{timeout: 600}}
                  title={<span style={{fontSize: '0.8rem'}}>{w.tooltip}</span>}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    className={classes.button}
                    style={{backgroundColor: w.color, textTransform: 'unset', fontWeight: 'bold', minWidth: '180px', justifyContent: "flex-start"}}
                    startIcon={w.icon}
                    onClick={() => handleButton(w.id)}
                  >
                    {w.label}
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  renderSubWizard() {
    switch(this.state.subWizard) {
      case SUB_WIZARD.CY3: 
        return <Cy3ImportSubWizard  controller={this.controller} wizardCallbacks={this.wizardCallbacks} />;
      case SUB_WIZARD.NDEX:
        return <NDExImportSubWizard controller={this.controller} wizardCallbacks={this.wizardCallbacks} />;
      case SUB_WIZARD.EXCEL: 
        return <ExcelImportSubWizard  controller={this.controller} wizardCallbacks={this.wizardCallbacks} />;
    }
  }

}

function useStyles() {
  return makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      width: '100%',
    },
    button: {
      margin: theme.spacing(1),
    },
  }));
}

ImportWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default ImportWizard;