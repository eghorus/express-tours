const mongoose = require("mongoose");
const Tour = require("./tour.model");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review text field is required."],
    minLength: [5, "Review text field must be at least 5 characters."],
    maxLength: [2000, "Review text field must be at most 2000 characters."],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Review rating field is required."],
    enum: {
      values: [1, 2, 3, 4, 5],
      message: "Review rating field must be from 1 to 5.",
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review user field is required."],
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: [true, "Review tour field is required."],
  },
});

reviewSchema.pre(/\b(find|findOne)\b/, function (next) {
  this.populate("user", "name imagePath").populate("tour", "name");
  next();
});

/* Used an index on review model instead */
// reviewSchema.pre("save", async function (next) {
//   const isDuplicateReview = await this.constructor.findOne({ tour: this.tour, user: this.user });
//   if (isDuplicateReview) return next(new OpError(401, "Users can create only one review on each tour."));
//   next();
// });

reviewSchema.post("save", async function (doc, next) {
  doc.constructor.calcAverageTourRatings(doc.tour._id);
  next;
});

reviewSchema.post("deleteOne", { document: true, query: false }, function (doc, next) {
  doc.constructor.calcAverageTourRatings(doc.tour._id);
  next();
});

reviewSchema.statics.calcAverageTourRatings = async function (tourId) {
  const ratingsStats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        ratingsQuantity: { $sum: 1 },
        ratingsSum: { $sum: "$rating" },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

  const tour = await Tour.findOne({ _id: tourId });
  tour.ratingsAverage = ratingsStats[0] ? Number(ratingsStats[0].ratingsAverage) : 0;
  tour.ratingsQuantity = ratingsStats[0] ? Number(ratingsStats[0].ratingsQuantity) : 0;
  await tour.save();
};

reviewSchema.index({ tour: 1, createdAt: -1 });
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
