import React from 'react';
import PropTypes from 'prop-types';
import { Button, Step, StepLabel, Stepper } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { NetworkEditorController } from '../network-editor/controller';


export class NDExImportSubWizard extends React.Component {

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
    };
  }

  fetchSearchResults(searchString) {
    if(!searchString)
      return;

    this.setState({ loading: true });
    fetch("http://public.ndexbio.org/v2/search/network?start=0&size=10",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({searchString})
      }
    )
    .then(res => res.json())
    .then(data => this.setState({ data, error: null, loading: false }))
    .catch(err => this.setState({ error: err, loading: false }));
  }


  render() {
    return (
      <div>
        <div>
          { this.renderSearchBox() }
        </div>
        <div style={{marginTop: 10}}>
          { this.state.data 
            ? this.state.data.networks.length == 0
              ? this.renderEmpty()
              : this.renderNetworkList() 
            : null
          }
        </div>
      </div>
    );
  }

  renderSearchBox() {
    let searchString = "";
    return (
      <Paper component="form" style={{padding: '2px 4px', display: 'flex', alignItems: 'center', width: '100%'}}>
        <InputBase
          style={{marginLeft: '5px', flex: 1 }}
          placeholder="Search NDEx"
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(evt) => searchString = evt.target.value}
        />
        <IconButton 
          style={{padding: 10}} 
          aria-label="search"
          onClick={() => this.fetchSearchResults(searchString)}
        >
          <SearchIcon />
        </IconButton>
        <Divider style={{height: 28, margin: 4}} orientation="vertical" />
        <IconButton 
          color="primary" 
          tyle={{padding: 10}} 
          aria-label="directions"
        >
          <PersonOutlineIcon />
        </IconButton>
      </Paper>
    );
  }

  renderNetworkList() {
    const { networks } = this.state.data;
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
                  <img width={32} height={32} src={'/images/ndex_400x400.jpeg'} />
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

  renderEmpty() {
    return (
      <Alert severity="info">
        <AlertTitle>No Networks</AlertTitle>
        No networks matched the search criteria.
      </Alert>
    );
  }

}


NDExImportSubWizard.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  wizardCallbacks: PropTypes.any
};

export default NDExImportSubWizard;