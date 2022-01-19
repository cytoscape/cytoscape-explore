import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, IconButton, Paper, CircularProgress, Tooltip } from "@material-ui/core";
import { NetworkEditorController } from './controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CloudCircleIcon from '@material-ui/icons/CloudCircle';
import RestoreIcon from '@material-ui/icons/Restore';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

export class HistoryPanel extends Component {

  constructor(props) {
    super(props);
    this.netID = this.props.controller.cy.data('id');

    this.state = {
      snapshots: [],
      waiting: true
    };

    // Do an initial load of the snapshots
    // MKTODO move this logic into the controller
    this.props.controller.cySyncher.localDb.get('snapshots')
      .then(doc => this.setState({ snapshots: doc.snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));

    this.busProxy = new EventEmitterProxy(this.props.controller.cySyncher.emitter);
    this.busProxy.addListener('snapshots', snapshots => this.setState({ snapshots }));
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
  }

  handleTakeSnapshot() {
    // Note the snapshots document automatically gets synched by pouchDB, no need to read the response.
    this.setState({ waiting: true });
    fetch(`/api/history/snapshot/${this.netID}`, { method: 'POST' })
      .then(()  => this.setState({ waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  handleDeleteShapshot(snapID) {
    this.setState({ waiting: true });
    fetch(`/api/history/snapshot/${this.netID}/${snapID}`, { method: 'DELETE' })
      .then(()  => this.setState({ waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  handleRestoreShapshot(snapID) {
    this.setState({ waiting: true });
    fetch(`/api/history/restore/${this.netID}/${snapID}`, { method: 'POST' })
      .then(()  => this.setState({ waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  render() {
    const SnapshotButton = () => 
      <Button
        className='history-panel-take-snapshot'
        variant='contained'
        disabled={this.state.waiting}
        startIcon={this.state.waiting ? <CircularProgress size={20} /> : <AddAPhotoIcon/>} 
        onClick={() => this.handleTakeSnapshot()}>
        Take Snapshot
      </Button>;

    const SnapshotTile = ({ snapshot })=> {
      const date = new Date(snapshot.timestamp);
      return <div style={{ padding: '5px' }}>
        <Paper variant='outlined'>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ padding:'10px', display: 'inline-block', alignSelf: 'center' }}>
              <CloudCircleIcon fontSize='large' />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 4, padding:'5px', alignSelf: 'center' }}>
              <div>
                { date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) }
              </div>
              <div>
                { date.toLocaleString("en-US", { minute: 'numeric', hour: 'numeric' }) }
              </div>
            </div>
            <div style={{ padding:'5px', display: 'inline-block', alignSelf: 'center' }}>
              <Tooltip arrow title="Restore">
                <IconButton size='small' color='secondary'
                  onClick={() => this.handleRestoreShapshot(snapshot.id)}>
                  <RestoreIcon fontSize='small'/>
                </IconButton>
              </Tooltip>
              <Tooltip arrow title="Delete">
                <IconButton size='small' color='secondary' 
                  onClick={() => this.handleDeleteShapshot(snapshot.id)}>
                  <DeleteForeverIcon fontSize='small'/>
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </Paper>
      </div>;
    };

    return <div>
      <SnapshotButton />
      { this.state.snapshots.map(snapshot =>
        <SnapshotTile key={snapshot.id} snapshot={snapshot} />
      )}
    </div>;
  }
}
HistoryPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

