import React, { Component } from 'react';
import Tippy from '@tippy.js/react';
import StylePicker from '../style/style-picker';

export class StylePickerButton extends Component {
  render() {
    const ref = React.createRef();
    return (
      <Tippy
        interactive={true}
        trigger='click'
        theme='light'
        onShow={() => ref.current.onShow && ref.current.onShow()}
        content={
            <StylePicker ref={ref} {...this.props} />
        }>
        <button className="style-panel-button plain-button">
          <i className="material-icons">{this.props.buttonIcon}</i>
        </button>
      </Tippy>
    );
  }
}

export default StylePickerButton;