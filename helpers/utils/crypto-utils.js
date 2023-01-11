const crypto = require("crypto");

const createToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const encryptToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { createToken, encryptToken };
