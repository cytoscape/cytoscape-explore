import React, { useState } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import GoogleLoginButton from "./GoogleLoginButton";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import UserInfoPopover from "./UserInfoPopover";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

const DEV_SERVER_ID =
  "802839698598-mrrd3iq3jl06n6c2fo1pmmc8uugt9ukq.apps.googleusercontent.com";

const AccountButton = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

  // Account information
  const [userInfo, setUserInfo] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle response from Google
  const responseHandler = (response) => {
    console.info("Success obtaining user info:", response);
    const userInfo = response["profileObj"];
    setUserInfo(userInfo);
  };

  const logoutResponseHandler = (response) => {
    console.info("Logout Success:", response);
    setUserInfo(null);
    setAnchorEl(null);
  };

  const getIcon = (userInfo) => {
    let userName = userInfo.name;
    if (userName === undefined || userName === null) {
      userName = "?";
    }

    let userImageUrl = userInfo.imageUrl;
    if (userImageUrl === undefined || userImageUrl === null) {
      return (
        <Avatar className={classes.avatar}>
          {userName.trim().substring(0, 1)}
        </Avatar>
      );
    } else {
      return (
        <Avatar className={classes.avatar} color="inherit" src={userImageUrl} />
      );
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    console.log("Opening panel clicked");
    setAnchorEl(e.currentTarget);
  };

  // Default: not logged in
  if (userInfo === null) {
    return (
      <GoogleLoginButton
        clientId={DEV_SERVER_ID}
        responseHandler={responseHandler}
      />
    );
  }

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={`You are signed in as ${userInfo.name}`}>
        <IconButton aria-label="signed-in" onClick={(e) => handleClick(e)}>
          {getIcon(userInfo)}
        </IconButton>
      </Tooltip>
      <UserInfoPopover
        userInfo={userInfo}
        anchorEl={anchorEl}
        onClose={handleClose}
        isOpen={isOpen}
        clientId={DEV_SERVER_ID}
        responseHandler={logoutResponseHandler}
      />
    </>
  );
};

export default AccountButton;
