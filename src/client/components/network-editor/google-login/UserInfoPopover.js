import React from "react";
import { Popover, Grid, Avatar, Typography } from "@material-ui/core";
import GoogleLogoutButton from "./GoogleLogoutButton";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  userInfoPopover: {
    padding: theme.spacing(2),
  },
  item: {
    padding: 0,
    marginBottom: theme.spacing(1),
  },
}));

const UserInfoPopover = ({
  userInfo,
  isOpen,
  anchorEl,
  onClose,
  clientId,
  responseHandler,
}) => {
  const classes = useStyles();

  return (
    <Popover
      id="account-popper"
      classes={{
        paper: classes.userInfoPopover,
      }}
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
        container
        justifycontent={"center"}
        alignItems={"center"}
        direction="column"
      >
        <Grid item xs={12} className={classes.item}>
          <Avatar className={classes.avatar} src={userInfo.imageUrl} />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <Typography variant="subtitle2">{`You are signed in as ${userInfo.name}`}</Typography>
        </Grid>
        <Grid item xs={12}>
          <GoogleLogoutButton
            clientId={clientId}
            responseHandler={responseHandler}
          />
        </Grid>
      </Grid>
    </Popover>
  );
};

export default UserInfoPopover;
