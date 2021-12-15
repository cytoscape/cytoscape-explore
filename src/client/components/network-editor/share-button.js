import React from 'react';
import PropTypes from 'prop-types';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import EmailIcon from '@material-ui/icons/Email';
import FileCopyIcon from '@material-ui/icons/FileCopy';
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

  render() {
    const handlePopoverOpen = event => this.setState({ popoverAnchorEl: event.currentTarget, tooltipOpen: false });
    const handlePopoverClose = () => this.setState({ popoverAnchorEl: null, tooltipOpen: false });
    const handleTooltip = open => this.setState({ tooltipOpen: open });

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

    const PopoverForm = () => 
      <div className='share-button-popover-content'>
        <div className='share-button-popover-heading'>
          <ScreenShareIcon/> &nbsp; Share link to network
        </div>
        <TextField defaultValue={this.url} variant="outlined" size="small" />
        <div className='share-button-popover-buttons'>
          <EmailButton/>
          <ClickAwayListener onClickAway={() => handleTooltip(false)}>
            <div>
              <Tooltip arrow
                PopperProps={{ disablePortal: true }}
                onClose={() => handleTooltip(false)}
                open={this.state.tooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                placement="right"
                title="Copied!"
              >
                <Button startIcon={<FileCopyIcon />} onClick={() => { this.handleCopyToClipboard(); handleTooltip(true); }}> 
                  Copy to Clipboard
                </Button>
              </Tooltip>
            </div>
          </ClickAwayListener>
        </div>
      </div>;

    return <div> 
      <div>
        <span onClick={handlePopoverOpen}><IconShareButton/></span>
      </div>
      <Popover
        className='share-button-popover'
        open={Boolean(this.state.popoverAnchorEl)}
        anchorEl={this.state.popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <PopoverForm />
      </Popover>
    </div>;
  }
}
ShareButton.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};


export default ShareButton;