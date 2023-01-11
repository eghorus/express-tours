const mongoose = require("mongoose");
const { User, Tour, Review } = require("../../models/index");
const OpError = require("../operational-error");

const validateIdParam = async (req, res, next, paramValue, paramName) => {
  if (!mongoose.isValidObjectId(paramValue)) {
    return next(new OpError(400, "The id provided is not a valid id."));
  }

  switch (paramName) {
    case "userId":
      const user = await User.findOne({ _id: paramValue });
      if (!user) {
        return next(new OpError(404, `No user found with this id '${paramValue}'.`));
      }
      req.user = user;
      break;

    case "tourId":
      const tour = await Tour.findOne({ _id: paramValue });
      if (!tour) {
        return next(new OpError(404, `No tour found with this id '${paramValue}'.`));
      }
      req.tour = tour;
      break;

    case "reviewId":
      const review = await Review.findOne({ _id: paramValue });
      if (!review) {
        return next(new OpError(404, `No review found with this id '${paramValue}'.`));
      }
      req.review = review;
      break;
  }

  next();
};

module.exports = { validateIdParam };
