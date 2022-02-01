import _ from 'lodash';
import React, { Component } from 'react';
import EventEmitter from 'eventemitter3';

import { LoginController } from '../login/controller';
import ImportWizard from '../network-import/import-wizard';
import Cy3ImportSubWizard from '../network-import/cy3-import-wizard';
import NDExImportSubWizard from '../network-import/ndex-import-wizard';
import ExcelImportSubWizard from '../network-import/excel-import-wizard';

import { withStyles } from '@material-ui/core/styles';

import { AppBar, Toolbar } from '@material-ui/core';
import { Grid, Paper, Fade } from '@material-ui/core';
import { Tooltip, Typography, Link } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';

import { AppLogoIcon } from '../svg-icons';
import { Cy3LogoIcon, NDExLogoIcon } from '../svg-icons';
import DescriptionIcon from '@material-ui/icons/Description';
import AddIcon from '@material-ui/icons/Add';

export class Content extends Component {

  constructor(props) {
    super(props);

    this.bus = new EventEmitter();
    this.controllers = {
      loginController: new LoginController(this.bus),
    };

    this.state = {
      dialogName: null,
      wizardInfo: null,
    };
  }

  componentWillUnmount() {
    this.bus.removeAllListeners();
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
      location.href = `/document/${urls.id}/${urls.secret}`;
    };

    create();
  }

  onCloseDialog() {
    console.log('... closed ...');

    this.setState({
      dialogName: null,
      wizardInfo: null,
    });
  }

  async loadSampleNetwork() {
    // Fetch the sample file
    const res1 = await fetch('/sample-data/galFiltered-cx2.json');
    const cx2 = await res1.json();
    console.log(cx2);

    // Ask the server to import the json data
    const res2 = await fetch( `/api/document/cx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cx2),
    });

    // Navigate to the new document
    const urls = await res2.json();
    location.href = `/document/${urls.id}/${urls.secret}`;
  }

  render() {
    const { dialogName, wizardInfo } = this.state;
    const { classes } = this.props;
    
    const wizardProps = {};

    if (wizardInfo) {
      for (const k of wizardInfo.props) {
        if (this.controllers[k] != null)
          wizardProps[k] = this.controllers[k];
      }
    }

    return (
        <div
          className={classes.root}
          style={{ height: '100%', /*background: 'url(/images/home-banner.png)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top'*/ }}
        >
          { this.renderHeader() }
          <Grid container direction="column" spacing={3} className={classes.root}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography variant="body1" gutterBottom className={classes.body1}>
                  Use Cytoscape Explore to visualize and analyze complex networks.
                </Typography>
              </Paper>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={3} className={classes.root}>{ /* LEFT Panel... */ }</Grid>
              <Grid item xs={6} className={classes.root}>
                <Grid container direction="column" spacing={3}>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} className={classes.root}>
                          <Typography variant="subtitle1" gutterBottom className={classes.subtitle1}>
                            Create a New Network:
                          </Typography>
                        </Grid>
                        <Grid item xs={12} className={classes.root}>
                          { this.renderStart() }
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} className={classes.root}>
                    <Paper className={classes.paper}>
                      <Typography variant="body1" gutterBottom className={classes.body1}>
                        You can also try this <Link component="button" variant="body1" onClick={() => this.loadSampleNetwork()} >sample network</Link>.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>{ /* RIGHT Panel... */ }</Grid>
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
        
    );
  }

  renderHeader() {
    const { classes } = this.props;

    return (
      <AppBar position="static" color='default'>
        <Toolbar variant="regular">
          <Tooltip arrow placement="bottom" title="Cytoscape Explore Home">
            <IconButton 
              aria-label='close' 
              onClick={() => location.href = '/'}
            >
              <AppLogoIcon viewBox="0 0 64 64" fontSize="large" p={0} m={0} />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" className={classes.h5}>Cytoscape Explore</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  renderStart() {
    const { classes } = this.props;

    return (
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item>
          <Grid
            container
            direction="column"
            className={classes.root}
            spacing={2}
          >
            <Grid item>
              <Typography variant="subtitle2">Empty:</Typography>
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
                }}
                style={{minWidth: 172, minHeight: 176}}
                startIcon={<AddIcon style={{fontSize: 44}} />}
                onClick={() => this.createNewNetwork()}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid
            container
            direction="column"
            className={classes.root}
            spacing={2}
          >
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
      <Grid container direction="column" justifycontent="center" spacing={2}>
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
    // flexGrow: 1,
    // margin: 0,
    // padding: 0,
    alignContent: 'center',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridGap: theme.spacing(3),
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
  h5: {
    flexGrow: 1,
  },
  subtitle1: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body1: {
    textAlign: 'center',
    lineHeight: '200%',
  },
});

export default withStyles(useStyles)(Content);