import { Component } from 'react';
import h from 'react-hyperscript';
import classNames from 'classnames';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import Tippy from '@tippy.js/react';
import { ColorSwatches } from '../color-swatches';

export class StylePanel extends Component {
  constructor(props){
    super(props);

    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('setStyleTargets', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){
    const { controller } = this.props;

    return h('div.style-panel', [
      h(Tippy, {
        interactive: true,
        trigger: 'click',
        theme: 'light',
        content: (
          h('div', [
            h(ColorSwatches, {
              onSelectColor: color => controller.setColor(color)
            })
          ])
        )
      }, [
        h('button.style-panel-button.plain-button', {
          onClick: () => { console.log('set bg colour'); }
        }, [
          h('i.material-icons', 'opacity')
        ])
      ]),

      // just some dummy buttons to give a better visual sense of things
      h('button.style-panel-button.plain-button', {
        onClick: () => { console.log('dummy button'); }
      }, [
        h('i.material-icons', 'grade')
      ]),
      h('button.style-panel-button.plain-button', {
        onClick: () => { console.log('dummy button'); }
      }, [
        h('i.material-icons', 'grade')
      ]),
      h('button.style-panel-button.plain-button', {
        onClick: () => { console.log('dummy button'); }
      }, [
        h('i.material-icons', 'grade')
      ])
    ]);
  }
}

export default StylePanel;