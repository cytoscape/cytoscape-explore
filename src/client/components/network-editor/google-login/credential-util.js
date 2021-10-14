export const getUserInfo = googleResponse => {
  const userInfo = googleResponse['profileObj'];
  return userInfo;
};

const key = "CE-LOGIN";

export const getCredential = () => {
  const googleResponseString = window.localStorage.getItem(key);
  if (
    !googleResponseString === undefined ||
    googleResponseString === null ||
    googleResponseString === ""
  ) {
    return null;
  }
  const googleResponse = JSON.parse(googleResponseString);
  console.log("Restored:", googleResponse);
  return googleResponse;
};

export const saveResponse = (googleResponse) => {
  window.localStorage.setItem(key, JSON.stringify(googleResponse));
};
