import React from 'react';
import Tippy from '@tippy.js/react';
import StylePicker from '../style/style-picker';
import PropTypes from 'prop-types';

/**
 * A style picker button
 * @param {Object} props React props
 * @param {String} props.buttonIcon The CSS icon class of the icon in the button
 * @param {String} props.title Title of the button (shown in tooltip)
 */
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

StylePickerButton.propTypes = {
  buttonIcon: PropTypes.string,
  title: PropTypes.string
};

export default StylePickerButton;