import { createMuiTheme }  from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1D6995',
      light: '#5C95B7',
      dark: '#053E60',
      contrastText: '#fff'
    },
    secondary: {
      main: '#1D6995',
      light: '#5C95B7',
      dark: '#053E60',
      contrastText: '#fff'
    }
  },
  typography: {
    fontFamily: 'Open Sans, Helvetica Neue, Helvetica, sans-serif'
  },
  props: {
    MuiButtonBase: {
      // disableRipple: true // No more ripple, on the whole application
    }
  },
});

export default theme;