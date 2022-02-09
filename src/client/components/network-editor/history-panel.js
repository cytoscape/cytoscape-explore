import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, IconButton, CircularProgress, Tooltip, Collapse } from "@material-ui/core";
import { List, ImageListItem, ImageListItemBar } from "@material-ui/core";
import { TransitionGroup } from 'react-transition-group';
import { NetworkEditorController } from './controller';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import RestoreIcon from '@material-ui/icons/Restore';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ConfirmDialog from './confirm-dialog';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';

const SNAPSHOT_LIMIT = 30; // Totally arbitrary number

export class HistoryPanel extends Component {

  constructor(props) {
    super(props);
    this.netID = this.props.controller.cy.data('id');

    this.expectingEvent = false;
    this.emitter = new EventEmitterProxy(props.controller.cySyncher.emitter);
    this.emitter.on('snapshot', () => {
      if(this.expectingEvent) {
        this.expectingEvent = false;
      } else { // change happend in another tab!
        this.handleGetSnapshots();
      }
    });
    
    this.state = {
      snapshots: [],
      waiting: true,
      dialogOpen: false
    };
  }

  componentWillUnmount() {
    this.emitter.removeAllListeners();
  }

  componentDidMount() {
    this.handleGetSnapshots();
  }

  handleGetSnapshots() {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}`, 'GET');
  }

  handleTakeSnapshot() {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}`, 'POST');
  }

  handleDeleteShapshot(snapID) {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}/${snapID}`, 'DELETE');
  }

  handleRestoreShapshot(snapID) {
    this.setState({
      dialogOpen: true,
      restoreSnapID: snapID,
    });
  }

  handleRestoreConfirm(confirmed) {
    const snapID = this.state.restoreSnapID;
    this.setState({ 
      dialogOpen: false, 
      restoreSnapID: null 
    });
    if(confirmed) {
      this.snapshotApiCall(`/api/history/restore/${this.netID}/${snapID}`, 'POST');
    }
  }

  snapshotApiCall(url, method) {
    if(method !== 'GET') {
      this.expectingEvent = true;
    }
    // All of the endpoints in the history API return the list of snapshots.
    this.setState({ waiting: true });
    fetch(url, { method })
      .then(res => res.json())
      .then(snapshots => snapshots.sort((a, b) => b.timestamp - a.timestamp))
      .then(snapshots  => this.setState({ snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  render() {
    const buttonDisabled = this.state.waiting 
      || (this.state.snapshots && this.state.snapshots.length >= SNAPSHOT_LIMIT);

    return <div style={{ paddingTop: '10px' }}>
      <Button
        className='history-panel-take-snapshot'
        variant='contained'
        disabled={buttonDisabled}
        startIcon={this.state.waiting ? <CircularProgress size={20} /> : <AddAPhotoIcon/>} 
        onClick={() => this.handleTakeSnapshot()}>
        Take Snapshot
      </Button>
      { this.renderImageList() }
      <ConfirmDialog 
        open={this.state.dialogOpen} 
        title='Restore Snapshot?'
        message='This will overwrite the contents of the network with the contents of the Snapshot.'
        onConfirm={() => this.handleRestoreConfirm(true)}
        onCancel= {() => this.handleRestoreConfirm(false)}
      />
    </div>;
  }

  renderImageList() {
    const Thumbnail = ({ snapshot, width=240, height=150 }) => {
      // Multiply the width/height when generating the image, makes it look much crisper on retina displays.
      const [ w, h ] = [ width * 2, height * 2 ];
      return <img
        src={`/api/thumbnail/${this.netID}?snapshot=${snapshot.id}&w=${w}&h=${h}`}
        width={width}
        height={height}
        loading="lazy"
      />;
    };

    const SnapshotImageListItem = ({ snapshot })=> {
      const timestamp = new Date(snapshot.timestamp);
      const date = timestamp.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
      const time = timestamp.toLocaleString("en-US", { minute: 'numeric', hour: 'numeric' });
      return <ImageListItem key={snapshot.id}>
        <div style={{ height: '5px' }} />
        <Thumbnail snapshot={snapshot} />
        <ImageListItemBar title={date} subtitle={time}
          actionIcon={
            <div>
              <Tooltip arrow title="Restore">
                <IconButton size='small' onClick={() => this.handleRestoreShapshot(snapshot.id)}>
                    <RestoreIcon fontSize='small'/>
                </IconButton>
              </Tooltip>
              <Tooltip arrow title="Delete">
                <IconButton size='small' onClick={() => this.handleDeleteShapshot(snapshot.id)}>
                  <DeleteForeverIcon fontSize='small'/>
                </IconButton>
              </Tooltip>
            </div>
          }
        />
      </ImageListItem>;
    };

    return <List sx={{ width: 240 }}>
      <TransitionGroup>
        { this.state.snapshots.map(snapshot =>
          <Collapse key={snapshot.id}>
            <SnapshotImageListItem snapshot={snapshot} />
          </Collapse>
        )}
      </TransitionGroup>
    </List>;
  }

}
HistoryPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

