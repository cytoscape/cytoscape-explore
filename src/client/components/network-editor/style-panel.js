import { Component } from 'react';
import h from 'react-hyperscript';
import classNames from 'classnames';
import EventEmitterProxy from '../../../model/event-emitter-proxy';

export class StylePanel extends Component {
  constructor(props){
    super(props);

    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('toggleDrawMode', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){
    const { controller } = this.props;

    return h('div.style-panel', [
      h('button.style-panel-button.plain-button', {
        onClick: () => { console.log('set bg colour'); }
      }, [
        h('i.material-icons', 'fiber_manual_record')
      ])
    ]);
  }
}

export default StylePanel;