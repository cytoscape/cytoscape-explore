import Tippy from '@tippyjs/react';
import React from 'react';
import PropTypes from 'prop-types';

export const TippyPopover = props => (
  <Tippy 
    theme="light"
    maxWidth="none"
    trigger="click"
    placement="bottom"
    interactive={true}
    hideOnClick={true}
    content={props.content} 
    { ...props }>
      { props.children }
  </Tippy>
);

TippyPopover.propTypes = {
  content: PropTypes.Component,
  children: PropTypes.Component
};

export default TippyPopover;
