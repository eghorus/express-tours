const filterOutObjKeys = (obj, keys) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

module.exports = { filterOutObjKeys };
