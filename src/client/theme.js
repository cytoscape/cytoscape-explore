import { createTheme }  from '@material-ui/core/styles';

import { ThemeOptions } from '@material-ui/core/styles/createTheme';

// Ref. : https://bareynol.github.io/mui-theme-creator
//

/** @type ThemeOptions */
const themeOptions = {
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
      color: 'secondary',
    },
    props: {
      MuiButtonBase: {
        disableRipple: true // no more ripple, on the whole application
      }
    },
  },
};

const theme = createTheme(themeOptions);

// const theme = createMuiTheme({
//   palette: {
//     primary: {
//       main: '#1D6995',
//       light: '#5C95B7',
//       dark: '#053E60',
//       contrastText: '#fff'
//     },
//     secondary: {
//       main: '#1D6995',
//       light: '#5C95B7',
//       dark: '#053E60',
//       contrastText: '#fff'
//     }
//   },
//   typography: {
//     fontFamily: 'Open Sans, Helvetica Neue, Helvetica, sans-serif'
//   },
//   props: {
//     MuiButtonBase: {
//       // disableRipple: true // No more ripple, on the whole application
//     }
//   },
// });

export default theme;