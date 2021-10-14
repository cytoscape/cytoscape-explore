import React, { FC, ReactElement } from "react";
import { Avatar, Button, Grid, Typography } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import { blue } from "@material-ui/core/colors";

const UserInfoPopover = (props) => {

	const {onClose, isOpen, anchorEl} = props;
  return (
    <Popover
      id="account-popper"
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      anchorEl={anchorEl}
      open={isOpen}
      disableRestoreFocus={true}
    >
      <Grid
        justifyContent={"center"}
        alignItems={"center"}
        container
        direction="column"
      ></Grid>
    </Popover>
  );
};

export default UserInfoPopover;
