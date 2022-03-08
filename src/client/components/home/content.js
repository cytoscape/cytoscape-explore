import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AccountButton from '../login/AccountButton';
import ImportWizard from '../network-import/import-wizard';
import Cy3ImportSubWizard from '../network-import/cy3-import-wizard';
import NDExImportSubWizard from '../network-import/ndex-import-wizard';
import ExcelImportSubWizard from '../network-import/excel-import-wizard';
import RecentNetworksGrid from './recent-networks-grid';

import { withStyles } from '@material-ui/core/styles';

import { AppBar, Toolbar } from '@material-ui/core';
import { Grid, Container, Fade } from '@material-ui/core';
import { Tooltip, Typography, Link } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';

import { AppLogoIcon } from '../svg-icons';
import { Cy3LogoIcon, NDExLogoIcon } from '../svg-icons';
import DescriptionIcon from '@material-ui/icons/Description';
import AddIcon from '@material-ui/icons/Add';
import theme from '../../theme';

export class Content extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dialogName: null,
      wizardInfo: null,
    };
  }

  loadNetwork(id, secret) {
    location.href = `/document/${id}/${secret}`;
  }

  createNewNetwork() {
    let create = async () => {
      let res = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {},
          elements: []
        })
      });

      let urls = await res.json();
      this.loadNetwork(urls.id, urls.secret);
    };

    create();
  }

  onCloseDialog() {
    this.setState({
      dialogName: null,
      wizardInfo: null,
    });
  }

  async loadSampleNetwork() {
    // Fetch the sample file
    const res1 = await fetch('/sample-data/galFiltered-cx2.json');
    const cx2 = await res1.json();

    // Ask the server to import the json data
    const res2 = await fetch(`/api/document/cx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cx2),
    });

    // Navigate to the new document
    const urls = await res2.json();
    this.loadNetwork(urls.id, urls.secret);
  }

  render() {
    const { dialogName, wizardInfo } = this.state;
    const { controllers, classes } = this.props;
    const loginController = controllers.loginController;
    
    const wizardProps = {};

    if (wizardInfo) {
      for (const k of wizardInfo.props) {
        if (controllers[k] != null)
          wizardProps[k] = controllers[k];
      }
    }

    return (
      <div className={classes.root} style={{ height: '100%' }}>
        { this.renderHeader() }
        <div className={classes.root} style={{ height: '100%', overflowY: 'scroll' }}>
          <Grid container direction="column" alignItems="stretch" alignContent="stretch" justifyContent="flex-start">
            { /* === TOP Panel ==================================================================== */ }
            <Grid item>
              <Grid container direction="row" alignItems="stretch" alignContent="stretch" justifyContent="center" spacing={3}>
                { /* === LEFT Panel ===================================================== */ }
                <Grid item className={classes.root}>
                  <Container direction="column" className={classes.container}>
                    <Typography variant="body1" gutterBottom className={classes.body1}>
                      Create publication-ready network figures <br />for your papers<br />with Cytoscape Explore.
                    </Typography>
                    <Typography variant="body1" gutterBottom className={classes.body1}>
                      Try this <Link component="a" style={{ cursor: 'pointer' }} onClick={() => this.loadSampleNetwork()}>sample network</Link>.
                    </Typography>
                  </Container>
                </Grid>
                { /* === RIGHT Panel ==================================================== */ }
                <Grid item className={classes.root}>
                  <Grid container direction="row" spacing={3}>
                    <Grid item xs={12}>
                      <Container className={classes.container}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} className={classes.root}>
                            <Typography variant="subtitle1" gutterBottom className={classes.subtitle1}>
                              Start a New Network
                            </Typography>
                          </Grid>
                          <Grid item xs={12} className={classes.root}>
                            { this.renderStart() }
                          </Grid>
                        </Grid>
                      </Container>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            { /* === BOTTOM Panel ================================================================= */ }
            <Grid item>
              <RecentNetworksGrid controller={loginController} />
            </Grid>
          </Grid>
          { dialogName === 'network-import' && (
            <ImportWizard
              id="network-import"
              open={true}
              wizard={wizardInfo.wizard}
              wizardProps={wizardProps}
              onClose={() => this.onCloseDialog()}
            />
          )}
        </div>
      </div>
    );
  }

  renderHeader() {
    const { classes, controllers } = this.props;
    const loginController = controllers.loginController;

    return (
      <AppBar position="static" color='default'>
        <Toolbar variant="regular">
          <Grid container alignItems='center' justifyContent="space-between">
            <Grid item>
              <Grid container alignItems='center'>
                <Grid item>
                  <Tooltip arrow placement="bottom" title="Cytoscape Explore Home">
                    <IconButton 
                      aria-label='close' 
                      onClick={() => location.href = '/'}
                    >
                      <AppLogoIcon viewBox="0 0 64 64" fontSize="large" p={0} m={0} />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Typography variant="h5" className={classes.h5}>Cytoscape Explore</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <AccountButton controller={loginController} size='medium' />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    );
  }

  renderStart() {
    const { classes } = this.props;

    return (
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={4}>
        <Grid item>
          <Grid container direction="column" className={classes.root} spacing={2}>
            <Grid item>
              <Typography variant="subtitle2">Create New:</Typography>
            </Grid>
            <Grid item>
              <Button
                aria-label='create empty network'
                variant="contained"
                color="default"
                size="large"
                classes={{
                  root: classes.button,
                  startIcon: classes.startIcon,
                  label: classes.emptyButtonLabel,
                }}
                style={{ minWidth: 172, minHeight: 176 }}
                startIcon={<AddIcon style={{ fontSize: 44 }} />}
                onClick={() => this.createNewNetwork()}
              >
                Empty
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="column" className={classes.root} spacing={2}>
            <Grid item>
              <Typography variant="subtitle2">Import From:</Typography>
            </Grid>
            <Grid item>
              { this.renderImportSelector() }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  renderImportSelector() {
    const { classes } = this.props;

    const handleClick = (w) => {
      this.setState({ 
        dialogName: 'network-import',
        wizardInfo: w,
      });
    };

    return (
      <Grid container direction="column" alignItems="stretch" justifycontent="center" spacing={2}>
        { WIZARDS.map((w) => (
          <Grid key={w.id} item>
            <Tooltip
              arrow
              placement="right"
              enterDelay={500}
              TransitionComponent={Fade}
              TransitionProps={{timeout: 600}}
              title={<span style={{fontSize: '0.8rem'}}>{w.tooltip}</span>}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                style={{backgroundColor: w.color, fontWeight: 'bold', minWidth: 176, justifyContent: "flex-start"}}
                startIcon={w.icon}
                onClick={() => handleClick(w)}
              >
                { w.label }
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    );
  }
}

const logoIconProps = {
  viewBox: '0 0 64 64',
  p: 0,
  m: 0,
};

const logoIconStyle = {
  width: 'auto',
  fontSize: '2rem',
  margin: 0, 
  fill: '#fff',
};

const WIZARDS = [
  {
    id: "ndex",
    label: "NDEx",
    tooltip: "ndexbio.org",
    icon: <NDExLogoIcon {...logoIconProps} style={{...logoIconStyle}} />,
    color: '#0087d2',
    wizard: NDExImportSubWizard,
    props: [ 'loginController' ],
  },
  {
    id: "excel",
    label: "Excel File",
    tooltip: "Excel or CSV file",
    icon: <DescriptionIcon style={{...logoIconStyle}} />,
    color: '#107c41',
    wizard: ExcelImportSubWizard,
    props: [],
  },
  {
    id: "cy3",
    label: "Cytoscape 3",
    tooltip: "Cytoscape Desktop",
    icon: <Cy3LogoIcon {...logoIconProps} style={{...logoIconStyle}} />,
    color: '#ea9123',
    wizard: Cy3ImportSubWizard,
    props: [],
  },
];

const useStyles = theme => ({
  root: {
    alignContent: 'center',
  },
  container: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    overflow: 'auto',
  },
  paper: {
    padding: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  item: {
    margin: 0,
  },
  button: {
    margin: 0,
    textTransform: 'unset',
  },
  startIcon: {
    marginLeft: 0,
    marginRight: 0,
  },
  emptyButtonLabel: {
    flexDirection: 'column',
    paddingTop: 25,
  },
  h5: {
    flexGrow: 1,
  },
  subtitle1: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body1: {
    marginTop: theme.spacing(6),
    textAlign: 'center',
    lineHeight: '200%',
  },
});

Content.propTypes = {
  controllers: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(Content);