import React from "react";
import { GoogleLogout } from "react-google-login";
import { Button } from "@material-ui/core";

const GoogleLogoutButton = ({
  clientId = "",
  responseHandler = () => {
    console.log("Google logout success");
  },
}) => {
  return (
    <GoogleLogout
      clientId={clientId}
      render={(renderProps) => (
        <Button
          variant={"outlined"}
          color={"inherit"}
          onClick={renderProps.onClick}
        >
          Sign Out
        </Button>
      )}
      onLogoutSuccess={responseHandler}
      onFailure={responseHandler}
    ></GoogleLogout>
  );
};

export default GoogleLogoutButton;
