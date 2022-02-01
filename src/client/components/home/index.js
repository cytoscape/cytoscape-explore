import _ from 'lodash';
import React, { Component } from 'react';

import theme from '../../theme';
import Content from './content';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

export class Home extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Content />
      </ThemeProvider>
    );
  }
}

export default Home;