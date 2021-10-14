import React from "react";
import { GoogleLogout } from "react-google-login";

const GoogleLogoutButton = ({
  clientId = "",
  onSuccess = () => {
    console.log("Google logout success");
  },
}) => {
  return (
    <GoogleLogout
      clientId={clientId}
      buttonText="Sign Out"
      onLogoutSuccess={onSuccess}
    ></GoogleLogout>
  );
};

export default GoogleLogoutButton;
