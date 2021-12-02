import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import { Alert, AlertTitle } from '@material-ui/lab';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import { NetworkEditorController } from '../network-editor/controller';
import AccountButton from '../network-editor/google-login/AccountButton';


function isAuthenticated(ndexClient){
  return ndexClient.authenticationType != null && ndexClient._authToken != null;
}

export class NDExImportSubWizard extends React.Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;

    props.wizardCallbacks.onContinue(() => this.handleContinue());
    props.wizardCallbacks.onFinish(() => this.handleFinish());
    props.wizardCallbacks.onBack(() => this.handleBack());

    // update state when receiving google login events from the bus
    props.controller.bus.on('googleLogin', () => this.setState({
      showAccountNetworksTabs: true,
      searchAccountNetworks: true,
    }));

    props.controller.bus.on('googleLogout', () => this.setState({
      showAccountNetworksTabs: false,
      searchAccountNetworks: false
    }));
    
    this.state = {
      step: 1,
      data: null,
      error: null,
      loading: false,
      selectedId: null,
      searchAccountNetworks: isAuthenticated(this.props.controller.ndexClient),
      showAccountNetworksTabs: isAuthenticated(this.props.controller.ndexClient)
    };
  }

  componentDidMount() {
    this.updateButtons(this.state);
  }

  fetchSearchResults(searchString) {
    if(!searchString)
      return;

    this.setState({ loading: true });

    const ndexClient = this.props.controller.ndexClient;

    let searchFn = async () => {
      if(this.state.searchAccountNetworks){
        let userNetworks = await ndexClient.getAccountPageNetworks(0, 400);
        // return results in a consistent format
        let results = userNetworks.filter( n => (n.name || '').includes(searchString) || (n.description || '').includes(searchString));
        
        return { 
          networks: results
        };
      } else {
        let results = await ndexClient.searchNetworks(searchString);
        // results format: {networks: [], numFound: 0, start: 0};
        return results;  
      }
    };

  searchFn()
    .then(data => this.setState({ data, error: null, loading: false }))
    .then(() => this.updateButtons({ ...this.state, loading: false }))
    .catch(error => this.setState({ data: null, error, loading: false }));
  }

  updateButtons(state) {
    const { step, data, error, loading, selectedId } = state;
    const { setButtonState } = this.props.wizardCallbacks;

    // Note: backButton is always visible by default
    if (step === 1) {
      if (loading) {
        setButtonState({ nextButton: 'hidden', cancelButton: 'enabled', finishButton: 'hidden' });
      } else if (error || !data || !data.numFound) {
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'hidden' });
      } else if (selectedId) {
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'enabled' });
      } else {
        setButtonState({ nextButton: 'hidden', cancelButton: 'hidden', finishButton: 'disabled' });
      }
    }
  }

  async handleFinish() {
    // TODO actually import the network !!!
    const res = await fetch( `/api/document/cx-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ndexUUID: this.state.selectedId })
        }
    );

    const urls = await res.json();

    location.replace('/document/' + urls.id + '/'+ urls.secret);
  }

  handleContinue() {
    const step = this.state.step + 1;
    this.setState({ step });
    this.updateButtons({ ...this.state, step });
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
      return (
        <div>
          {this.state.showAccountNetworksTabs ? (<FormControlLabel
           control={
             <Switch
               checked={this.state.searchAccountNetworks}
               onChange={() => this.setState({searchAccountNetworks: !this.state.searchAccountNetworks})}
               name="checkedB"
               color="primary"
             />
           }
           label="Limit search to my networks"
          />)
          : null
          }
          <div>
            { this.renderSearchBox() }
          </div>
          <div style={{ marginTop: 10 }}>
            { this.renderSearchResultsArea() }
          </div>
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
        return this.renderNetworkList();
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
      this.updateButtons( { ...this.state, loading: true });
      this.fetchSearchResults(searchString);
    };

    return (
      <Paper component="form" onSubmit={runSearch} style={{padding: '2px 4px', display: 'flex', alignItems: 'center', width: '100%'}}>
        <InputBase
          autoFocus={true}
          style={{marginLeft: '5px', flex: 1 }}
          placeholder={this.state.searchAccountNetworks ? "Search my NDEx networks" : "Search NDEx"}
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
        <Divider style={{height: 28, margin: 4}} orientation="vertical" />
        <AccountButton controller={this.controller}/>
      </Paper>
    );
  }

  renderNetworkList() {
    const { networks } = this.state.data;
    const handleRadio = (selectedId) => {
      this.setState({ selectedId });
      this.updateButtons({ ...this.state, selectedId });
    };
    return (
      <TableContainer component={Paper}>
        <Table size="small" aria-label="network table">
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
            { networks.map(network => (
              <TableRow key={network.externalId}>
                <TableCell align="center">
                <Radio
                  checked={this.state.selectedId === network.externalId}
                  onClick={() => handleRadio(network.externalId)}
                  value={network.externalId}
                />
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

NDExImportSubWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  wizardCallbacks: PropTypes.any
};

export default NDExImportSubWizard;