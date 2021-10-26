import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ImageList, ImageListItem, ImageListItemBar } from '@material-ui/core';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { Alert, AlertTitle, Skeleton } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import { NetworkEditorController } from '../network-editor/controller';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const CY3_URL = 'http://localhost:1234';

const STEPS = [
  {
    label: "Select a Network",
  },
];

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
    const { setSteps, setCurrentStep } = this.props.wizardCallbacks;
    setSteps({ steps: STEPS });
    setCurrentStep(this.state);

    this.updateButtons(this.state);
    this.fetchNetworkData();
  }

  updateButtons(state) {
    const { step, data, error, loading, selectedSUID } = state;
    const { setButtonState } = this.props.wizardCallbacks;

    // Note: backButton is always visible by default
    if (step == 1) {
      if (loading || error || !data || data.length === 0)
        setButtonState({ nextButton: 'hidden', cancelButton: 'enabled', finishButton: 'disbled' });
      else if (selectedSUID)
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'enabled'  });
      else
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'disbled'  });
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

    this.props.wizardCallbacks.setCurrentStep({ step });
    this.updateButtons({ ...this.state, step });
    
    return step;
  }

  handleContinue() {
    this.updateStep((step) => step + 1);
  }

  handleBack() {
    const step = this.updateStep((step) => step - 1);

    if (step == 0)
      this.props.wizardCallbacks.returnToSelector();
  }

  render() {
    const { step, data, error, loading } = this.state;

    if (step === 1) {
      if (error)
        return this.renderError();
      else if (!data || data.length === 0)
        return !loading ? this.renderEmpty() : this.renderNetworkListSkeleton();
      else
        return this.renderNetworkList();
    }
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

  getNetworkImageUrl(suid, w, h) {
    const url = (w > h)
      ? `${CY3_URL}/v1/networks/${suid}/views/first.png?w=${w}`
      : `${CY3_URL}/v1/networks/${suid}/views/first.png?h=${h}`;

    return url;
  }

  renderNetworkListSkeleton() {
    const classes = useStyles();

    return (
      <div className={classes.root} style={{backgroundColor: 'rgba(0, 0, 0, 0.87)'}}>
        <Skeleton variant="rect" width={250} height={180} />
      </div>
    );
  }

  renderNetworkList() {
    const { data, selectedSUID, loading } = this.state;
    const classes = useStyles();

    const handleNetworkSelect = (selectedSUID) => {
      this.setState({ selectedSUID });
      this.updateButtons({ ...this.state, selectedSUID });
    };

    return (
      <div className={classes.root}>
        <ImageList rowHeight={180} className={classes.imageList} style={{backgroundColor: 'rgba(0, 0, 0, 0.87)'}}>
        { data && data.map(net => (
          <ImageListItem 
            button='true'
            key={net.SUID} 
            selected={selectedSUID === net.SUID}
            onClick={() => {
              if (!loading)
                handleNetworkSelect(net.SUID);
            }}
          >
            <img src={this.getNetworkImageUrl(net.SUID, 250, 180)} alt={net.name} />
            <ImageListItemBar
              title={
                <Tooltip title={net.name} key={net.SUID} placement="top" enterDelay={500}>
                  <b>{net.name}</b>
                </Tooltip>
              }
              subtitle={<span>{net.nodeCount} nodes, {net.edgeCount} edges</span>}
              actionIcon={
                <IconButton style={{color: '#fff'}} disabled={loading}>
                  { selectedSUID === net.SUID ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon /> }
                </IconButton>
              }
              actionPosition='left'
            />
          </ImageListItem>
        ))}
        </ImageList>
        { data &&
          <footer style={{textAlign: 'right'}}>
            The current Cytoscape session has {data.length} network{data.length !== 1 ? 's' : ''}.
          </footer>
        }
      </div>
    );
  }
  
}

function useStyles() {
  return makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      // backgroundColor: theme.palette.background.paper,
    },
    imageList: {
      width: 250,
      height: 120,
    },
    icon: {
      color: '#ffffff',
    },
  }));
}

Cy3ImportSubWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  wizardCallbacks: PropTypes.any
};

export default Cy3ImportSubWizard;