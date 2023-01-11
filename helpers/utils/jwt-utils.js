const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const signJwtToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN });
  return accessToken;
};

const verifyJwtToken = async (accessToken) => {
  const decodedAccessToken = await promisify(jwt.verify)(accessToken, process.env.JWT_SECRET);
  return decodedAccessToken;
};

module.exports = { signJwtToken, verifyJwtToken };
