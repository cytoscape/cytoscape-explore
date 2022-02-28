import React from 'react';
import PropTypes from 'prop-types';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import EmailIcon from '@material-ui/icons/Email';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ImageIcon from '@material-ui/icons/Image';
import LandscapeIcon from '@material-ui/icons/Landscape';
import { Button, ClickAwayListener, IconButton, Paper, Popover, TextField, Tooltip } from '@material-ui/core';
import { NetworkEditorController } from './controller';

export class ShareButton extends React.Component {

  constructor(props) {
    super(props);
    this.url = window.location.href;
    this.state = {
      popoverAnchorEl: null,
      tooltipOpen: false,
    };
  }

  handleOpenEmail() {
    const subject = "Sharing Network from Cytoscape Explore";
    const body = "Here is the network: " + this.url;
    window.location=`mailto:?subject=${subject}&body=${body}`;
  }

  handleCopyToClipboard() {
    navigator.clipboard.writeText(this.url);
  }

  handleExportImage(type) {
    if(type === 'png') {
      console.log("Export PNG!");
    } else if(type === 'jpg') {
      console.log("Export JPG!");
    }
  }

  handlePopoverOpen(target) {
    this.setState({ 
      popoverAnchorEl: target, 
      tooltipOpen: false 
    });
  }

  handlePopoverClose() {
    this.setState({ 
      popoverAnchorEl: null, 
      tooltipOpen: false 
    });
  }

  handleTooltip(tooltipOpen) {
    this.setState({ tooltipOpen });
  }

  render() {
    const SectionHeader = ({ icon, text }) => 
      <div className='share-button-popover-heading'>
        {icon} &nbsp; {text}
      </div>;

    const IconShareButton = () => 
      <Tooltip arrow placement="bottom" title="Share">
        <IconButton size="small" color="inherit">
          <ScreenShareIcon />
        </IconButton>
      </Tooltip>;

    const EmailButton = () => 
      <Button startIcon={<EmailIcon />} onClick={() => this.handleOpenEmail()}>
        Send by email
      </Button>;

    const ShareLinkForm = () => 
      <div className='share-button-popover-content'>
        <SectionHeader icon={<ScreenShareIcon/>} text="Share link to network" />
        <TextField defaultValue={this.url} variant="outlined" size="small" />
        <div className='share-button-popover-buttons'>
          <EmailButton/>
          <ClickAwayListener onClickAway={() => this.handleTooltip(false)}>
            <div>
              <Tooltip arrow disableFocusListener disableHoverListener disableTouchListener
                PopperProps={{ disablePortal: true }}
                onClose={() => this.handleTooltip(false)}
                open={this.state.tooltipOpen}
                placement="right"
                title="Copied!"
              >
                <Button startIcon={<FileCopyIcon />} onClick={() => { this.handleCopyToClipboard(); this.handleTooltip(true); }}> 
                  Copy to Clipboard
                </Button>
              </Tooltip>
            </div>
          </ClickAwayListener>
        </div>
      </div>;

    const ImageExportButton = ({ type }) =>
      <Button startIcon={<ImageIcon />} onClick={() => this.handleExportImage(type)}>
        Export { type === 'png' ? "PNG" : "JPEG" } Image
      </Button>;

    const ExportImageForm = () => 
      <div className='share-button-popover-content'>
        <SectionHeader icon={<LandscapeIcon/>} text="Export Image" />
        <div className='share-button-popover-buttons'>
          <ImageExportButton type='png' />
          <ImageExportButton type='jpg' />
        </div>
      </div>; 

    return <div> 
      <div>
        <span onClick={evt => this.handlePopoverOpen(evt.currentTarget)}>
          <IconShareButton/>
        </span>
      </div>
      <Popover
        className='share-button-popover'
        open={Boolean(this.state.popoverAnchorEl)}
        anchorEl={this.state.popoverAnchorEl}
        onClose={() => this.handlePopoverClose()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <ShareLinkForm />
        <ExportImageForm />
      </Popover>
    </div>;
  }
}
ShareButton.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};


export default ShareButton;