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
    hideOnClick={false}
    onClickOutside={(instance, event) => {
      const isTippy = target => target.closest('.tippy') != null;
      const isPopover = target => target.closest('.MuiPopover-root') != null;

      if(isTippy(event.target) || isPopover(event.target)){
        // keep open
      } else {
        instance.hide();
      }
    }}
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
