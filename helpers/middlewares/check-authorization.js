const OpError = require("../operational-error");

const checkAuthorization = (...allowedUsers) => {
  return (req, res, next) => {
    const isUserRoleAllowed = allowedUsers.includes(req.authenticatedUser.role);
    const isOwnerRoleAllowed = allowedUsers.findIndex((r) => r === "owner") > -1 ? true : false;
    /* For reviews routes the userId is stored in the review document and not as a param */
    const userId = req.params.userId || String(req.review?.user._id);
    const isUserIsOwner = String(req.authenticatedUser._id) === userId;

    if (!(isUserRoleAllowed || (isOwnerRoleAllowed && isUserIsOwner))) {
      if (isOwnerRoleAllowed) {
        return next(new OpError(403, "User role is not authorized to perform this action for a different user."));
      } else {
        return next(new OpError(403, "User role is not authorized to perform this action."));
      }
    }

    next();
  };
};

module.exports = { checkAuthorization };
