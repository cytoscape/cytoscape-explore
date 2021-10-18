import React from "react";
import PropTypes from "prop-types";
import GoogleLogin from "react-google-login";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { Tooltip } from "@material-ui/core";

const GoogleLoginButton = ({ clientId = "", responseHandler = () => {} }) => (
  <Tooltip title={"Sign in with Google"}>
    <div>
      <GoogleLogin
        clientId={clientId}
        render={(renderProps) => (
          <IconButton onClick={renderProps.onClick}>
            <AccountCircle />
          </IconButton>
        )}
        buttonText="Login with Google"
        onSuccess={responseHandler}
        onFailure={responseHandler}
        cookiePolicy={"single_host_origin"}
        isSignedIn={true}
      />
    </div>
  </Tooltip>
);

GoogleLoginButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  responseHandler: PropTypes.func.isRequired,
};

export default GoogleLoginButton;
