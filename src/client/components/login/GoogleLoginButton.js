import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import GoogleLogin from "react-google-login";

import { LoginController } from './controller';

import { IconButton, Tooltip } from "@material-ui/core";

import AccountCircle from "@material-ui/icons/AccountCircle";

// 1. create ref
// 2. hook up bus
// 3. on emit login request
// 4. emit click event on the iconbutton ref

const GoogleLoginButton = ({ clientId = "", responseHandler = () => {}, controller, size = "small" }) => {
  let loginRef = useRef(null);

  useEffect(() => {
    controller.bus.on('openGoogleLogin', () => {
      loginRef != null ? loginRef.current.click() : null;
    });
  }, [loginRef]);

  return (
    <GoogleLogin
      clientId={clientId}
      render={(renderProps) => (
        <Tooltip arrow placement="bottom" title={"Sign in with Google"}>
          <IconButton
            ref={loginRef}
            size={size}
            edge="end"
            color="inherit"
            aria-label="menu"
            aria-haspopup="true"
            onClick={renderProps.onClick}
          >
            <AccountCircle fontSize={size === 'small' ? 'medium' : 'large' } />
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
};

GoogleLoginButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  responseHandler: PropTypes.func.isRequired,
  controller: PropTypes.instanceOf(LoginController),
  size: PropTypes.oneOf(['small', 'medium']),
};

export default GoogleLoginButton;
