import React from 'react';
import PropTypes from 'prop-types';
import theme from '../../theme';
import { makeStyles } from '@material-ui/core/styles';
import { ImageList, ImageListItem, ImageListItemBar } from '@material-ui/core';
import { Button, IconButton, Tooltip } from '@material-ui/core';
import { Alert, AlertTitle, Skeleton } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const CY3_URL = 'http://localhost:1234';

const STEPS = [
  {
    label: "Select a Network",
  },
];

const IMG_WIDTH = 275;
const IMG_HEIGHT = 180;
const IMG_GAP = 2;

export class Cy3ImportSubWizard extends React.Component {

  constructor(props) {
    super(props);

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

    this.updateCanContinue(this.state);
    this.fetchNetworkData();
  }

  updateCanContinue(state) {
    const { step, data, error, loading, selectedSUID } = state;
    const { setCanContinue } = this.props.wizardCallbacks;

    let b = false;

    if (step == 1) {
      if (loading || error || !data || data.length === 0)
        b = false;
      else if (selectedSUID)
        b = true;
    }

    setCanContinue({ canContinue: b });
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
            fetch(`${CY3_URL}/v1/networks/${net.SUID}/edges/count`).then(res => res.json()),
            fetch(`${CY3_URL}/v1/networks/${net.SUID}/views`).then(res => res.ok ? res.json() : [])

          ])
          .then(arr => ({ 
              name: net.name, 
              SUID: net.SUID, 
              nodeCount: arr[0].count, 
              edgeCount: arr[1].count,
              views: arr[2], // The SUIDs of the network's views or an empty array
            }
          ))
        )
      )
      .then(data => data.sort(compareByName))
      .then(data => this.setState({ data, error: null, loading: false }))
      .then(() => this.updateCanContinue({ ...this.state, loading: false }))
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
        `${CY3_URL}/v1/networks/${netId}/views/${viewId}.cx?version=2` :
        `${CY3_URL}/v1/networks/${netId}.cx?version=2`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`CyREST error! status: ${res.status}`);
      } else {
        return await res.json();
      }
    };

    const netId = this.state.selectedSUID;
    const viewIds = await fetchViewIds(netId);
    const viewId = viewIds && viewIds.length > 0 ? viewIds[0] : undefined;
    const cx = await fetchNetworkOrView(netId, viewId);

    const res = await fetch( `/api/document/cx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cx),
    });

    const urls = await res.json();
    location.replace(`/document/${urls.id}/${urls.secret}`);
  }

  updateStep(nextStep) {
    const step = nextStep(this.state.step);
    this.setState({ step });

    this.props.wizardCallbacks.setCurrentStep({ step });
    this.updateCanContinue({ ...this.state, step });
    
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

  getNetworkImageUrl(suid, views, w, h) {
    if (views.length > 0) {
      return (w > h)
        ? `${CY3_URL}/v1/networks/${suid}/views/first.png?w=${w}`
        : `${CY3_URL}/v1/networks/${suid}/views/first.png?h=${h}`;
    }

    return '/images/no-views.svg';
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

  renderNetworkListSkeleton() {
    const classes = useStyles();

    return (
      <ImageList rowHeight={IMG_HEIGHT} gap={IMG_GAP} className={classes.imageList} style={{backgroundColor: theme.palette.divider}}>
        {[0, 1].map((val) => (
          <ImageListItem key={val} button='false' cols={1}>
            <Skeleton variant="rect" width={IMG_WIDTH} height={IMG_HEIGHT} />
          </ImageListItem>
        ))}
      </ImageList>
    );
  }

  renderNetworkList() {
    const { data, selectedSUID, loading } = this.state;
    const classes = useStyles();

    const handleNetworkSelect = (selectedSUID) => {
      this.setState({ selectedSUID });
      this.updateCanContinue({ ...this.state, selectedSUID });
    };

    // The first image will fill the entire width of the component,
    // if the list has an odd number of images (otherwise it would show an empty rectangle)
    const odd = data && data.length % 2 !== 0;

    return (
      <div className={classes.root}>
        { data &&
          <header style={{textAlign: 'right'}}>
            The current Cytoscape session has {data.length} network{data.length !== 1 ? 's' : ''}.
          </header>
        }
        <ImageList rowHeight={IMG_HEIGHT} gap={IMG_GAP} className={classes.imageList} style={{backgroundColor: theme.palette.divider}}>
        { data && data.map((net, idx) => (
          <ImageListItem 
            button='true'
            key={net.SUID}
            cols={odd && idx === 0 ? 2 : 1}
            selected={selectedSUID === net.SUID}
            onClick={() => {
              if (!loading)
                handleNetworkSelect(net.SUID);
            }}
          >
            <img
              src={this.getNetworkImageUrl(net.SUID, net.views, (odd && idx === 0 ? IMG_GAP + 2 * IMG_WIDTH : IMG_WIDTH), IMG_HEIGHT)}
              alt={net.name}
              style={{backgroundColor: theme.palette.background.paper}}
            />
            <ImageListItemBar
              title={
                <Tooltip title={net.name} key={net.SUID} placement="top" enterDelay={500}>
                  <b>{net.name}</b>
                </Tooltip>
              }
              subtitle={<span>{net.nodeCount} nodes, {net.edgeCount} edges</span>}
              actionIcon={
                <IconButton disabled={loading}>
                  { selectedSUID === net.SUID ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon /> }
                </IconButton>
              }
              actionPosition='left'
            />
          </ImageListItem>
        ))}
        </ImageList>
      </div>
    );
  }
}

function useStyles() {
  return makeStyles(() => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
    imageList: {
      width: 250,
      height: 120,
    },
  }));
}

Cy3ImportSubWizard.propTypes = {
  wizardCallbacks: PropTypes.any
};

export default Cy3ImportSubWizard;