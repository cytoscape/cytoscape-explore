import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export function HierarchicalLayoutIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M27.5 32.5l-12 18" stroke="#151515" strokeWidth="2" />
      <path d="M39.5 50.5l-12-18" stroke="#151515" strokeWidth="2" />
      <path d="M27.5 32.5l21-18" stroke="#151515" strokeWidth="2" />
      <path d="M69.5 32.5l-21-18" stroke="#151515" strokeWidth="2" />
      <path d="M57.5 50.5l12-18" stroke="#151515" strokeWidth="2" />
      <path d="M81.5 50.5l-12-18" stroke="#151515" strokeWidth="2" />
      <path d="M15 56a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM39 56a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM27 38a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM69 38a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM48 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM57 56a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM81 56a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
    </SvgIcon>
  );
}