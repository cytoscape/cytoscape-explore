import React, { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import GoogleLoginButton from "./GoogleLoginButton";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";

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

  // Handle response from Google
  const responseHandler = (response) => {
    console.info("Success obtaining user info:", response);
    const userInfo = response["profileObj"];
    setUserInfo(userInfo);
  };

  // Account information
  const [userInfo, setUserInfo] = useState(null);

  // useEffect(() => {
  //   if (userInfo !== null) {
  //     console.log("Icon update", userInfo);
  //     const {imageUrl, name} = userInfo;

  //   }
  // }, [userInfo]);

  const handleClick = (e) => {
    e.preventDefault();
    console.log("AccountButton clicked");
  };

  // Default: not logged in
  if (userInfo === null) {
    return (
        <GoogleLoginButton clientId={DEV_SERVER_ID} responseHandler={responseHandler}/>
    );
  }

  return (
    // <Tooltip title={`You are signed in as ${userInfo.name}`}>
      <IconButton aria-label="signed-in" onClick={(e) => handleClick(e)}>
        <Avatar
          className={classes.avatar}
          src={userInfo !== null ? userInfo.imageUrl : ""}
        >
          {/* {userInfo !== null && userInfo.imageUrl !== undefined ? "" : userProfile.userName.trim().substring(0, 1)} */}
        </Avatar>
      </IconButton>
    // </Tooltip>
  );
};

export default AccountButton;
