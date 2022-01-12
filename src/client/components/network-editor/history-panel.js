import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@material-ui/core";
import { NetworkEditorController } from './controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

export class HistoryPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      snapshots: [],
      snapshotButtonDisabled: false
    };

    // Do an initial load of the snapshots
    // MKTODO move this logic into the controller
    this.props.controller.cySyncher.localDb.get('snapshots')
    .then(doc => this.setState({ snapshots: doc.snapshots }));

    this.busProxy = new EventEmitterProxy(this.props.controller.cySyncher.emitter);
    this.busProxy.addListener('snapshots', snapshots => this.setState({ snapshots }));
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
  }

  handleTakeSnapshot() {
    const netID = this.props.controller.cy.data('id');

    this.setState({ snapshotButtonDisabled: true });

    fetch(`/api/history/snapshot/${netID}`, { method: 'POST' })
    .then(res  => this.setState({ snapshotButtonDisabled: false }))
    .catch(err => this.setState({ snapshotButtonDisabled: false }));
  }

  render() {
    return <div>
      <Button
        className='history-panel-take-snapshot'
        variant='contained'
        disabled={this.state.snapshotButtonDisabled}
        startIcon={<PhotoCameraIcon />} 
        onClick={() => this.handleTakeSnapshot()}>
        Take Snapshot
      </Button>
      <hr />
      { this.state.snapshots.map(snapshot =>
        <div key={snapshot.id}>
          { snapshot.timestamp }
        </div>
      ) }
    </div>;
  }
}
HistoryPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

