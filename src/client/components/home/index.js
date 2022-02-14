import React, { Component } from 'react';
import PropTypes from 'prop-types';

import theme from '../../theme';
import Content from './content';
import { LoginController } from '../login/controller';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

export class Home extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const controllers = {
      loginController: this.props.loginController,
    };

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Content controllers={controllers} />
      </ThemeProvider>
    );
  }
}

Home.propTypes = {
  loginController: PropTypes.instanceOf(LoginController).isRequired,
};

export default Home;