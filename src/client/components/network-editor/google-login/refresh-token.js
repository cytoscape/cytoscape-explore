const refreshToken = (googleResponse) => {
  let refreshTiming = getTiming(googleResponse.tokenObj.expires_in);

  const refreshToken = async () => {
    const newAuthRes = await googleResponse.reloadAuthResponse();
    refreshTiming = getTiming(newAuthRes.expires_in);
    // saveUserToken(newAuthRes.access_token);  <-- save new token
    localStorage.setItem("authToken", newAuthRes.id_token);

    setTimeout(refreshToken, refreshTiming);
  };

  setTimeout(refreshToken, refreshTiming);
};

const getTiming = (expIn) => (expIn || 3600 - 5 * 60) * 1000;

export { refreshToken };
