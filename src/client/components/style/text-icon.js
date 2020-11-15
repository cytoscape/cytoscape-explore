import React from 'react';
import PropTypes from 'prop-types';

export function TextIcon(props) {
  return (
    <div style={{cursor: 'pointer'}}>
      {props.text}
    </div>
  );
}

TextIcon.propTypes = {
  text: PropTypes.string,
};
TextIcon.defaultProps = {
  text: 'default',
};

export default TextIcon;