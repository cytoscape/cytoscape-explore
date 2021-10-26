import { createTheme }  from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1E68D8',
    },
    secondary: {
      main: '#B4B4B4',
    },
    background: {
      default: '#272728',
      paper: '#242424',
    },
    error: {
      main: '#db4f4f',
    },
    divider: '#3A393A',
    success: {
      main: '#2FBD52',
    },
    warning: {
      main: '#FFC400',
    },
    text: {
      primary: '#E9E9E9',
    },
    info: {
      main: '#1a1a1c',
    },
  },
  typography: {
    fontFamily: 'Open Sans, Helvetica Neue, Helvetica, sans-serif'
  },
  props: {
    MuiAppBar: {
      color: 'transparent',
    },
    MuiSlider: {
      color: 'secondary'
    }
  },
});

export default theme;