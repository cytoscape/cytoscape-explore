import { createMuiTheme }  from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#333',
      light: '#666',
      dark: '#000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#1D6995',
      light: '#5C95B7',
      dark: '#053E60',
      contrastText: '#fff',
    },
  },
});

export default theme;