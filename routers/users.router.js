const express = require("express");
const usersControllers = require("../controllers/users.controllers");
const { validateIdParam } = require("../helpers/middlewares/param-validations");
const { checkAuthentication } = require("../helpers/middlewares/check-authentication");
const { checkAuthorization } = require("../helpers/middlewares/check-authorization");
const reviewsRouter = require("./reviews.router");

const router = express.Router();

router.param("userId", validateIdParam);

router.use("/:userId/reviews", reviewsRouter);

router.route("/").get(checkAuthentication, checkAuthorization("admin"), usersControllers.getAllUsers);
router.route("/signup").post(usersControllers.createUser);
router.route("/signin").post(usersControllers.authenticateUser);
router.route("/forgotpassword").post(usersControllers.forgotPassword);
router.route("/resetpassword/:resetToken").patch(usersControllers.resetPassword);
router
  .route("/:userId/updatepassword")
  .patch(checkAuthentication, checkAuthorization("owner", "admin"), usersControllers.updatePassword);
router
  .route("/:userId")
  .get(checkAuthentication, usersControllers.getUser)
  .patch(checkAuthentication, checkAuthorization("owner", "admin"), usersControllers.updateUser)
  .delete(checkAuthentication, checkAuthorization("owner", "admin"), usersControllers.deleteUser);

module.exports = router;
