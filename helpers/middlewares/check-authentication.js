const { User } = require("../../models");
const OpError = require("../operational-error");
const { verifyJwtToken } = require("../utils/jwt-utils");

const checkAuthentication = async (req, res, next) => {
  try {
    const accessToken =
      req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;
    if (!accessToken) {
      return next(new OpError(401, "No access token is sent with the request. Please sign in."));
    }

    const decodedAccessToken = await verifyJwtToken(accessToken);

    const user = await User.findOne({ _id: decodedAccessToken.id }).select("+passwordChange.changedAt");
    if (!user) {
      return next(new OpError(404, `No user is associated with this access token.`));
    }

    if (decodedAccessToken.iat * 1000 < user.passwordChange.changedAt.getTime() - 5000) {
      return next(new OpError(401, "Access token is no longer valid because the user has changed password."));
    }

    req.authenticatedUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkAuthentication };
