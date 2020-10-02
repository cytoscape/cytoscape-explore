import React, { Component } from 'react';
import Tippy from '@tippy.js/react';
import StylePicker from '../style/style-picker';

export function StylePickerButton(props)  {
  const ref = React.createRef();
  const tooltip = props.title;
  return (
    <Tippy
      interactive={true}
      trigger='click'
      theme='light'
      onShow={() => ref.current.onShow && ref.current.onShow()}
      content={
        <StylePicker ref={ref} {...props} />
      }>
      <Tippy content={tooltip}>
        <button className="style-panel-button plain-button">
          <i className="material-icons">{props.buttonIcon}</i>
        </button>
      </Tippy>
    </Tippy>
  );
}

export default StylePickerButton;