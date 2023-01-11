const { Review } = require("../models/index");
const { filterOutObjKeys } = require("../helpers/utils/object-utils");

const createReview = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const inputReview = {
      review: req.body.review,
      rating: req.body.rating,
      user: req.authenticatedUser._id,
      tour: tourId,
    };
    const review = await Review.create(inputReview);

    res.status(201).json({
      status: "Success",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

const getReview = (req, res, next) => {
  try {
    const { review } = req;

    res.status(200).json({
      status: "Success",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

const getAllReviewsOfTour = async (req, res, next) => {
  try {
    if (req.params.userId) return next();
    const { tourId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const paginationResults = await Review.paginate({ tour: tourId }, { page, limit, sort });
    const { docs: reviews, ...paginationData } = paginationResults;

    res.status(200).json({
      status: "Success",
      data: { reviews, paginationData },
    });
  } catch (error) {
    next(error);
  }
};

const getAllReviewsOfUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const paginationResults = await Review.paginate({ user: userId }, { page, limit, sort });
    const { docs: reviews, ...paginationData } = paginationResults;

    res.status(200).json({
      status: "Success",
      data: { reviews, paginationData },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { review } = req;
    const updateFields = filterOutObjKeys(req.body, ["user", "tour", "createdAt", "updatedAt"]);
    for (let field in updateFields) {
      review[field] = updateFields[field];
    }
    await review.save();

    res.status(200).json({
      status: "Success",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { review } = req;
    await review.deleteOne();

    res.status(204).json({
      status: "Success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getReview, getAllReviewsOfUser, getAllReviewsOfTour, updateReview, deleteReview };
