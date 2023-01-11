const express = require("express");
const reviewsControllers = require("../controllers/reviews.controllers");
const { validateIdParam } = require("../helpers/middlewares/param-validations");
const { checkAuthentication } = require("../helpers/middlewares/check-authentication");
const { checkAuthorization } = require("../helpers/middlewares/check-authorization");

const router = express.Router({ mergeParams: true });

router.param("reviewId", validateIdParam);

router
  .route("/")
  .get(
    reviewsControllers.getAllReviewsOfTour,
    checkAuthentication,
    checkAuthorization("owner", "admin"),
    reviewsControllers.getAllReviewsOfUser
  )
  .post(checkAuthentication, checkAuthorization("user"), reviewsControllers.createReview);
router
  .route("/:reviewId")
  .get(reviewsControllers.getReview)
  .patch(checkAuthentication, checkAuthorization("owner"), reviewsControllers.updateReview)
  .delete(checkAuthentication, checkAuthorization("owner"), reviewsControllers.deleteReview);

module.exports = router;
