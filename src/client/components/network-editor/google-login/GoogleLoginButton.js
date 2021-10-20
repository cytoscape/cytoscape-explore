import React from "react";
import PropTypes from "prop-types";
import GoogleLogin from "react-google-login";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { Tooltip } from "@material-ui/core";

const GoogleLoginButton = ({ clientId = "", responseHandler = () => {} }) => (
  <GoogleLogin
    clientId={clientId}
    render={(renderProps) => (
      <Tooltip arrow placement="bottom" title={"Sign in with Google"}>
        <IconButton
          size="small"
          edge="end"
          color="inherit"
          aria-label="menu"
          aria-haspopup="true"
          onClick={renderProps.onClick}
        >
          <AccountCircle />
        </IconButton>
      </Tooltip>
    )}
    buttonText="Login with Google"
    onSuccess={responseHandler}
    onFailure={responseHandler}
    cookiePolicy={"single_host_origin"}
    isSignedIn={true}
  />
);

GoogleLoginButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  responseHandler: PropTypes.func.isRequired,
};

export default GoogleLoginButton;
