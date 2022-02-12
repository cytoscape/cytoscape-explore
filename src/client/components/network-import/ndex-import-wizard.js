import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import { Alert, AlertTitle } from '@material-ui/lab';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import { LoginController } from '../login/controller';

const STEPS = [
  {
    label: "Import From NDEx",
  },
];

function isAuthenticated(ndexClient){
  return ndexClient.authenticationType != null && ndexClient._authToken != null;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`browse-ndex-tabpanel-${index}`}
      aria-labelledby={`browse-ndexpanel-tab-${index}`}
      {...other}
    >
      {value === index && (children)}
    </div>
  );
}

export class NDExImportSubWizard extends React.Component {

  constructor(props) {
    super(props);

    this.controller = props.loginController;

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    this.onGoogleLogin = () => this.setState({
      showAccountNetworksTabs: true,
      searchAccountNetworks: true,
      browseNdexTabId: 0
    }, () => this.fetchMyNetworks());

    this.onGoogleLogout = () => this.setState({
      showAccountNetworksTabs: false,
      searchAccountNetworks: false,
      browseNdexTabId: 1,
      myNetworks: null
    });

    // update state when receiving google login events from the bus
    this.controller.bus.on('googleLogin', this.onGoogleLogin);
    this.controller.bus.on('googleLogout', this.onGoogleLogout);
    
    const authenticated = isAuthenticated(this.controller.ndexClient);

    this.state = {
      step: 1,
      browseNdexTabId: authenticated ? 0 : 1,
      myNetworks: null,
      myNetworksError: null,
      data: null,
      error: null,
      loading: false,
      selectedId: null,
      searchAccountNetworks: isAuthenticated(this.controller.ndexClient),
      showAccountNetworksTabs: isAuthenticated(this.controller.ndexClient)
    };
  }

  componentDidMount() {
    const { setSteps, setCurrentStep } = this.props.wizardCallbacks;
    setSteps({ steps: STEPS });
    setCurrentStep(this.state);

    this.updateCanContinue(this.state);

    if (isAuthenticated(this.controller.ndexClient)) {
      this.fetchMyNetworks();
    }
  }

  componentWillUnmount(){
    this.controller.bus.removeListener('googleLogin', this.onGoogleLogin);
    this.controller.bus.removeListener('googleLogout', this.onGoogleLogout);
  }

  fetchMyNetworks(){
    this.setState({ loading: true });

    const ndexClient = this.controller.ndexClient;

    let searchFn = async () => {
      if(isAuthenticated(ndexClient)){
        let userNetworks = await ndexClient.getAccountPageNetworks(0, 400);
        // return results in a consistent format
        
        return { 
          numFound: userNetworks.length,
          start: 0,
          networks: userNetworks
        };
      }
    };

  return searchFn()
    .then(myNetworks => this.setState({ myNetworks, myNetworksError: null, loading: false }))
    .then(() => this.updateCanContinue({ ...this.state, loading: false }))
    .catch(error => this.setState({ myNetworks: null, myNetworksError: error, loading: false }));
  }


  fetchSearchResults(searchString) {
    if (!searchString)
      return;

    this.setState({ loading: true });

    const ndexClient = this.controller.ndexClient;

    let searchFn = async () => {
        let results = await ndexClient.searchNetworks(searchString);
        // results format: {networks: [], numFound: 0, start: 0};
        return results;
    };

  searchFn()
    .then(data => this.setState({ data, error: null, loading: false }))
    .then(() => this.updateCanContinue({ ...this.state, loading: false }))
    .catch(error => this.setState({ data: null, error, loading: false }));
  }

  updateCanContinue(state) {
    const { step, data, error, selectedId, myNetworks } = state;
    const { setCanContinue } = this.props.wizardCallbacks;

    let b = false;

    if (step === 1 ) {
      if (error || (data == null && myNetworks == null))
        b = false;
      else if (selectedId)
        b = true;
    }

    setCanContinue({ canContinue: b });
  }

  async handleFinish() {
    const bodyObj = { ndexUUID: this.state.selectedId };

    isAuthenticated(this.controller.ndexClient) ? bodyObj.authToken = this.controller.ndexClient._authToken : null;

    const res = await fetch( `/api/document/cx-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyObj)
        }
    );
    
    const urls = await res.json();

    location.replace('/document/' + urls.id);
  }

  handleContinue() {
    const step = this.state.step + 1;
    this.setState({ step });
    this.updateCanContinue({ ...this.state, step });
  }

  handleBack() {
    const step = this.state.step - 1;
    this.setState({ step });
    if(step == 0)
      this.props.wizardCallbacks.returnToSelector();
  }

  render() {
    const { step } = this.state;
    if(step == 1)
      return this.renderSearch();
  }

  renderSearch() {
      const a11yProps = (tabIndex) => {
        return {
          id: `browse-ndex-${tabIndex}`,
          'aria-controls': `browse-ndexpanel-${tabIndex}`,
        };
      };

      const handleTabChange = (e, newTabId) => {
        if(newTabId === 0){
          this.setState({browseNdexTabId: newTabId}, () => this.fetchMyNetworks());
        } else {
          this.setState({browseNdexTabId: newTabId});
        }
      };

      return (
        <div>
          {
            !this.state.showAccountNetworksTabs ? <div style={{marginLeft: '1em'}}>
              <Link href="" onClick={(e) => {
                e.preventDefault();
                this.controller.bus.emit('openGoogleLogin');
              }}>Sign in to NDEx</Link> to browse your networks
            </div> : null
          }
          <Tabs value={this.state.browseNdexTabId} onChange={handleTabChange} aria-label="browse NDEx tabs">
            <Tab label="Browse my networks" {...a11yProps(0)} disabled={!this.state.showAccountNetworksTabs}/>
            <Tab label="SEARCH NDEx" style={{textTransform: 'none'}} {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={this.state.browseNdexTabId} index={0}>
            <div style={{ marginTop: 10 }}>
              { this.renderMyNetworks() }
            </div>
          </TabPanel>
          <TabPanel  value={this.state.browseNdexTabId} index={1}>
            <div>
              { this.renderSearchBox() }
            </div>
            <div style={{ marginTop: 10 }}>
              { this.renderSearchResultsArea() }
            </div>
          </TabPanel>
        </div>
      );
  }

  renderSearchResultsArea() {
    const { loading, data } = this.state;
    if(loading) {
      return this.renderLoading();
    }
    if(data) {
      if(data.networks.length == 0) {
        return this.renderEmpty();
      } else {
        return this.renderNetworkList(data.networks);
      }
    }
    return null;
  }

  renderMyNetworks() {
    const { loading, myNetworks } = this.state;
    if(loading) {
      return this.renderLoading();
    }
    if(myNetworks) {
      if(myNetworks.networks.length == 0) {
        return this.renderEmpty();
      } else {
        return this.renderNetworkList(myNetworks.networks);
      }
    }
    return null;
  }

  renderLoading() {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress color="secondary" />
      </div>
    );
  }

  renderEmpty() {
    return (
      <Alert severity="info">
        <AlertTitle>No Networks</AlertTitle>
        No networks matched the search criteria.
      </Alert>
    );
  }

  renderSearchBox() {
    let searchString = "";
    const runSearch = (event) => {
      event.preventDefault();
      this.setState({ loading: true, selectedId: null });
      this.updateCanContinue( { ...this.state, loading: true });
      this.fetchSearchResults(searchString);
    };

    return (
      <Paper component="form" onSubmit={runSearch} style={{padding: '2px 4px', display: 'flex', alignItems: 'center', width: '100%'}}>
        <InputBase
          autoFocus={true}
          style={{marginLeft: '5px', flex: 1 }}
          placeholder={"Search NDEx"}
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(evt) => searchString = evt.target.value}
        />
        <IconButton
          style={{padding: 10}}
          aria-label="search"
          onClick={runSearch}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    );
  }

  renderNetworkList(ndexNetworkReults) {
    const handleNetworkSelection = (selectedId) => {
      this.setState({ selectedId });
      this.updateCanContinue({ ...this.state, selectedId });
    };
    return (
      <TableContainer component={Paper}>
        <Table size="large" aria-label="network table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Network</TableCell>
              <TableCell align="right">Owner</TableCell>
              <TableCell align="right">Nodes</TableCell>
              <TableCell align="right">Edges</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { ndexNetworkReults.map(network => (
              <TableRow key={network.externalId} 
                selected={this.state.selectedId === network.externalId}
                onClick={() => handleNetworkSelection(network.externalId)}
                className="ndex-import-network-entry"
              >
                <TableCell align="center">
                </TableCell>
                <TableCell component="th" scope="row">{network.name}</TableCell>
                <TableCell align="right">{network.owner}</TableCell>
                <TableCell align="right">{network.nodeCount}</TableCell>
                <TableCell align="right">{network.edgeCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

NDExImportSubWizard.propTypes = {
  loginController: PropTypes.instanceOf(LoginController).isRequired,
  wizardCallbacks: PropTypes.any.isRequired,
};

export default NDExImportSubWizard;