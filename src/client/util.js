import { SERVER_SUB_PATH } from '../client/env';

export const fetchWrap = (resource, opts) => {
  return fetch(`${SERVER_SUB_PATH}/${resource}`, opts);
};

