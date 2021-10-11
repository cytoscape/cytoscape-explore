import React from 'react';
import PropTypes from 'prop-types';
import { Button, Step, StepLabel, Stepper } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import { NetworkEditorController } from '../network-editor/controller';

const CY3_URL = 'http://localhost:1234';


export class Cy3ImportSubWizard extends React.Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.state = {
      step: 1,
      data: null,
      error: null,
      loading: true,
      selectedSUID: null
    };
  }

  componentDidMount() {
    this.updateButtons(this.state);
    this.fetchNetworkData();
  }

  updateButtons(state) {
    console.log("updateButtons: " + JSON.stringify(state));
    const { step, data, error, loading, selectedSUID } = state;
    const { setButtonState } = this.props.wizardCallbacks;

    // Note: backButton is always visible by default
    if(step == 1) {
      if (loading || error || !data || data.length === 0) {
        setButtonState({ continueButton: 'hidden', cancelButton: 'enabled', finishButton: 'hidden' });
      } else {
        setButtonState({ continueButton: 'enabled', cancelButton: 'hidden', finishButton: 'hidden' });
      }
    } else if(step == 2) {
      if(selectedSUID) {
        setButtonState({ continueButton: 'enabled', cancelButton: 'hidden', finishButton: 'hidden'  });
      } else {
        setButtonState({ continueButton: 'disbled', cancelButton: 'hidden', finishButton: 'hidden'  });
      }
    } else if(step == 3) {
      setButtonState({ continueButton: 'hidden', cancelButton: 'hidden', finishButton: 'enabled'});
    }
  }

  fetchNetworkData() {
    const compareByName = (a, b) => {
      const na = a.name.toUpperCase();
      const nb = b.name.toUpperCase();
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    };

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
      .then(data => data.sort(compareByName))
      .then(data => this.setState({ data, error: null, loading: false }))
      .then(() => this.updateButtons({ ...this.state, loading: false }))
      .catch(err => this.setState({ error: err, loading: false }))
    )
    .catch(err => this.setState({ error: err, loading: false }));
  }

  handleRetry() {
    this.setState({ step: 1, data: null, error: null, loading: true });
    this.fetchNetworkData();
  }

  async handleFinish() {
    this.setState({ loading: true });

    // Return array of View SUIDs
    const fetchViewIds = async (netId) => {
      const res = await fetch(`${CY3_URL}/v1/networks/${netId}/views`);
      return res.ok ? await res.json() : [];
    };

    // Return Network or View data (json) 
    const fetchNetworkOrView = async (netId, viewId) => {
      // If no views, import just the network
      const url = viewId ?
        `${CY3_URL}/v1/networks/${netId}/views/${viewId}` :
        `${CY3_URL}/v1/networks/${netId}`; 
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`CyREST error! status: ${res.status}`);
      } else {
        return await res.json();
      }
    };

    // Return the Style for the passed view
    const fetchStyle = async (netId, viewId) => {
      const res = await fetch(`${CY3_URL}/v1/networks/${netId}/views/${viewId}/currentStyle`);
      
      if (!res.ok) {
        throw new Error(`CyREST error! status: ${res.status}`);
      } else {
        return await res.json();
      }
    };

    try {
      const netId = this.state.selectedSUID;
      const viewIds = await fetchViewIds(netId);
      const viewId = viewIds && viewIds.length > 0 ? viewIds[0] : undefined;
      const net = await fetchNetworkOrView(netId, viewId);
      const style = viewId ? await fetchStyle(netId, viewId) : undefined;
      
      this.controller.setNetwork(net.elements, net.data, style);
    } catch(e) {
      console.log(e); // TODO Show error to user
    }

    this.props.wizardCallbacks.closeWizard();
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.setState({ step });
    this.updateButtons({ ...this.state, step });
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

  render() {
    return (
      <div>
        <div>
        <Stepper alternativeLabel activeStep={this.state.step-1} >
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
      if (loading) {
        return this.renderLoading();
      } else {
        return this.renderConfirm();
      }
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
    const network = this.state.data.filter(net => net.SUID == this.state.selectedSUID)[0];
    return (
      <Alert variant="outlined" severity="success">
        <AlertTitle>Confirm Network Import</AlertTitle>
        <p> The network <b>{network.name}</b> will be imported into Cytoscape Explore. </p>
        { this.renderNetworkImage(network.SUID, 300, 150) }
      </Alert>
    );
  }

  renderError() {
    return (
      <Alert severity="error">
        <AlertTitle>Error Connecting to Cytoscape 3</AlertTitle>
        Please make sure <Link color="error" target="_blank" href='https://cytoscape.org/download.html'>Cytoscape Desktop</Link> is
        installed and running before you try again.
        <p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.handleRetry()}
          >
            Retry
          </Button>
        </p>
      </Alert>
    );
  }

  renderEmpty() {
    return (
      <Alert severity="info">
        <AlertTitle>No Networks</AlertTitle>
        The current Cytoscape 3 session has no networks.
        <p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.handleRetry()}
          >
            Retry
          </Button>
        </p>
      </Alert>
    );
  }

  renderNetworkImage(suid, w, h) {
    // This cyREST endpoint only acceps 'w' or 'h' but not both at the same time.
    const imgUrl = (w > h)
      ? `${CY3_URL}/v1/networks/${suid}/views/first.png?w=${w}`
      : `${CY3_URL}/v1/networks/${suid}/views/first.png?h=${h}`;

    return <div style={{
      backgroundImage: `url(${imgUrl})`,
      width: w,
      height: h,
      backgroundPosition: 'center',
      backgroundSize: 'cover'
    }}/>;
  }


  renderNetworkList() {
    const { data } = this.state;

    const handleNetworkSelect = (selectedSUID) => {
      this.setState({ selectedSUID });
      this.updateButtons({ ...this.state, selectedSUID });
    };

    return (
      <div>
        <div><h3>Select a network for import</h3></div>
        <List>
        { data.map(net => (
          <ListItem 
            button
            key={net.SUID} 
            selected={this.state.selectedSUID === net.SUID}
            onClick={() => handleNetworkSelect(net.SUID)}
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
                { this.renderNetworkImage(net.SUID, 250, 120) }
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
  controller: PropTypes.instanceOf(NetworkEditorController),
  wizardCallbacks: PropTypes.any
};

export default Cy3ImportSubWizard;