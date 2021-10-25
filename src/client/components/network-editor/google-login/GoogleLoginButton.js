import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import GoogleLogin from "react-google-login";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { Tooltip } from "@material-ui/core";

import { NetworkEditorController } from '../controller';


// 1. create ref
// 2. hook up bus
// 3. on emit login request
// 4. emit click event on the iconbutton ref

const GoogleLoginButton = ({ clientId = "", responseHandler = () => {}, controller}) => {
  let loginRef = useRef(null);

  useEffect(() => {
    controller.bus.on('openGoogleLogin', () => {
      loginRef.current.click();
    });
  }, loginRef);

  return (
    <GoogleLogin
      clientId={clientId}
      render={(renderProps) => (
        <Tooltip arrow placement="bottom" title={"Sign in with Google"}>
          <IconButton
            ref={loginRef}
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
};

GoogleLoginButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  responseHandler: PropTypes.func.isRequired,
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default GoogleLoginButton;
