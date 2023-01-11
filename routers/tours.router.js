const express = require("express");
const toursControllers = require("../controllers/tours.controllers");
const { validateIdParam } = require("../helpers/middlewares/param-validations");
const { checkAuthentication } = require("../helpers/middlewares/check-authentication");
const { checkAuthorization } = require("../helpers/middlewares/check-authorization");
const reviewsRouter = require("./reviews.router");

const router = express.Router();

router.param("tourId", validateIdParam);

router.use("/:tourId/reviews", reviewsRouter);

router
  .route("/")
  .get(toursControllers.getAllTours)
  .post(checkAuthentication, checkAuthorization("admin", "lead-guide"), toursControllers.createTours);
router.route("/top-5").get(toursControllers.addTop5QueryProps, toursControllers.getAllTours);
router.route("/within/:distance/center/:latlng/unit/:unit").get(toursControllers.getToursWithin);
router.route("/near/:latlng/unit/:unit").get(toursControllers.getToursNear);
router
  .route("/:tourId")
  .get(toursControllers.getTour)
  .patch(checkAuthentication, checkAuthorization("admin", "lead-guide"), toursControllers.updateTour)
  .delete(checkAuthentication, checkAuthorization("admin", "lead-guide"), toursControllers.deleteTour);
module.exports = router;
