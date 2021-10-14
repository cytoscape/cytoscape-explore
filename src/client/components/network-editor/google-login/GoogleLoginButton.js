import React from "react";
import PropTypes from "prop-types";
import GoogleLogin from "react-google-login";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";

const GoogleLoginButton = ({ clientId = "", responseHandler = () => {} }) => {
  return (
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
      onAutoLoadFinished={(e) => console.log("autoLoadFinished:", e)}
    />
  );
};

// GoogleLoginButton.propTypes = {
//   clientId: PropTypes.string.isRequired,
//   responseHandler: PropTypes.func.isRequired,
// };

export default GoogleLoginButton;
