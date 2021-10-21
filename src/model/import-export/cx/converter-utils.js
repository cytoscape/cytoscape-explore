

export const isAspectKeyInArray = (aspect, aspectKeyArray) => {
  let output = false;
  aspectKeyArray.forEach( aspectKey => {
      if (aspect[aspectKey]) {
          output = true;
      }
  });
  return output;
};