import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Step, StepLabel, Stepper } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';

const CY3_URL = 'http://localhost:1234';


export class Cy3ImportSubWizard extends Component {

  constructor(props) {
    super(props);

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.state = {
      step: 1,
      data: null,
      value: null,
      error: null,
      loading: true,
      selectedSUID: null
    };
  }

  componentDidMount() {
    console.log("cy3.componentDidMount");
    this.updateButtons(this.state.step);

    // const compareByName = function(a, b) {
    //   var na = a.name.toUpperCase(); // ignore upper and lowercase
    //   var nb = b.name.toUpperCase(); // ignore upper and lowercase
    //   if (na < nb) return -1;
    //   if (na > nb) return 1;
    //   return 0;
    // };
    
    this.fetchNetworkData();
  }

  fetchNetworkData() {
    fetch(`${CY3_URL}/v1/networks.names`)
    .then(res => res.json())
    .then(networks =>
      Promise.all(
        networks.map(net =>
          Promise.all([
            fetch(`${CY3_URL}/v1/networks/${net.SUID}/nodes/count`).then(res => res.json()),
            fetch(`${CY3_URL}/v1/networks/${net.SUID}/edges/count`).then(res => res.json())
          ])
          .then(counts => ({ 
              name: net.name, 
              SUID: net.SUID, 
              nodeCount: counts[0].count, 
              edgeCount: counts[1].count 
            }
          ))
        )
      )
      .then(data => this.setState({ data, error: null, loading: false }))
      .then(() => this.updateButtons())
      .catch(err => this.setState({ error: err, loading: false }))
    )
    .catch(err => this.setState({ error: err, loading: false }));
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.setState({ step });
    this.updateButtons();
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
        <Stepper alternativeLabel activeStep={this.state.step-1}>
          <Step><StepLabel>Connect to Cytoscape Desktop</StepLabel></Step>
          <Step><StepLabel>Select a Network</StepLabel></Step>
          <Step><StepLabel>Import Network</StepLabel></Step>
        </Stepper>
        </div>
        <div>
          { this.renderContent() }
        </div>
      </div>
    );
  }

  updateButtons() {
    const { step, data, error, loading } = this.state;
    const { setButtonState } = this.props.wizardCallbacks;
    if(step == 1) {
      if (loading || error || !data || data.length === 0) {
        setButtonState({ continueButton: 'hidden', cancelButton: 'enabled' });
      } else {
        setButtonState({ continueButton: 'enabled', cancelButton: 'hidden' });
      }
    } else if(step == 3) {
      setButtonState({ continueButton: 'hidden', finishButton: 'enabled'});
    }
  }

  renderContent() {
    const { step, data, error, loading } = this.state;
    if(step == 1) {
      if (loading) {
        return this.renderLoading();
      } else if (error) {
        return this.renderError();
      } else if (!data || data.length === 0) {
        return this.renderEmpty();
      } else {
        return this.renderContinue();
      }
    } else if(step == 2) {
      return this.renderNetworkList();
    } else if(step == 3) {
      return this.renderConfirm();
    }
  }

  renderLoading() {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress color="secondary" />
      </div>
    );
  }

  renderContinue() {
    const { length } = this.state.data;
    return (
      <Alert variant="outlined" severity="success">
        <AlertTitle>Connected to Cytoscape Desktop</AlertTitle>
        { length == 1
          ? <div>The current Cytoscape session has 1 network available for import.</div>
          : <div>The current Cytoscape session has {this.state.data.length} networks available for import.</div>
        }
      </Alert>
    );
  }

  renderConfirm() {
    return (
      <Alert severity="success">
        <AlertTitle>Confirm Network Import</AlertTitle>
        The network (insert network name) will be imported into Cytoscape Explore.
      </Alert>
    );
  }

  renderError() {
    return (
      <Alert severity="error">
        <AlertTitle>Error Connecting to Cytoscape 3</AlertTitle>
        Please make sure <Link color="error" target="_blank" href='https://cytoscape.org/download.html'>Cytoscape Desktop</Link> is
        installed and running before you try again.
        { JSON.stringify(this.state.error) }
      </Alert>
    );
  }

  renderEmpty() {
    return (
      <Alert severity="info">
        <AlertTitle>No Networks</AlertTitle>
        The current Cytoscape 3 session has no networks.
      </Alert>
    );
  }

  renderNetworkList() {
    const { data } = this.state;

    const createNetImageStyle = (suid, w, h) => {
      // This cyREST endpoint only acceps 'w' or 'h' but not both at the same time.
      const imgUrl = (w > h)
        ? `${CY3_URL}/v1/networks/${suid}/views/first.png?w=${w}`
        : `${CY3_URL}/v1/networks/${suid}/views/first.png?h=${h}`;

      return {
        backgroundImage: `url(${imgUrl})`,
        width: w,
        height: h,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      };
    };

    return (
      <div>
        <div><h4>Select a network for import</h4></div>
        <List>
        { data.map(net => (
          <ListItem 
            button
            key={net.SUID} 
            selected={this.state.selectedSUID === net.SUID}
            onClick={() => this.setState({ selectedSUID: net.SUID })}
          >
            <div key={net.SUID} style={{ border: '1px solid #DCDCDC', width: '100%', display: 'flex', flexDirection: 'row' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }} > 
                <div style={{ padding: '5px' }}>
                  <h4>{net.name}</h4>
                </div>
                <div style={{ padding: '5px' }}>
                  {net.nodeCount} nodes, {net.edgeCount} edges
                </div>
              </div>
              <div>
                <div style={ createNetImageStyle(net.SUID, 300, 150) } />
              </div>
            </div>
          </ListItem>
        ))}
        </List>
      </div>
    );
  }
  
}


Cy3ImportSubWizard.propTypes = {
  wizardCallbacks: PropTypes.any
};

export default Cy3ImportSubWizard;