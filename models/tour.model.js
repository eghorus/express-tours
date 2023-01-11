const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Tour name field is required."],
    minlength: [5, "Tour name field must be at least 5 characters."],
    maxlength: [100, "Tour name field must be at most 100 characters."],
    validate: {
      validator: function (val) {
        return validator.isAlphanumeric(val, "en-US", { ignore: " -" });
      },
      message: "Tour name field must contain only alphanumeric characters, spaces, and dashes.",
    },
    trim: true,
  },
  durationDays: {
    type: Number,
    required: [true, "Tour duration field is required."],
    min: [1, "Tour duration field must be at least 1."],
    max: [20, "Tour duration field must be at most 20."],
  },
  startDates: {
    type: [Date],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "Tour maxGroupSize field is required."],
    min: [1, "Tour maxGroupSize field must be at least 1."],
    max: [50, "Tour maxGroupSize field must be at most 50."],
  },
  difficulty: {
    type: String,
    required: [true, "Tour difficulty field is required."],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Tour difficulty field must be easy, medium, or difficult.",
    },
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "Tour price field is required."],
    min: [1, "Tour price field must be at least 1 CURR."],
    max: [10000, "Tour price field must be at most 10,000 CURR."],
  },
  discount: {
    type: Number,
    validate: {
      validator: function (val) {
        /* Works only for save or create not updates */
        return val <= this.price;
      },
      message: "Tour discount field must be less than or equal to tour price field.",
    },
    default: 0,
  },
  summary: {
    type: String,
    required: [true, "Tour summary field is required."],
    minLength: [10, "Tour summary field must be at least 10 characters."],
    maxLength: [400, "Tour summary field must be at most 400 characters."],
    trim: true,
  },
  description: {
    type: String,
    minLength: [10, "Tour description field must be at least 10 characters."],
    maxLength: [1000, "Tour description field must be at most 1000 characters."],
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "Tour imageCover field is required."],
    maxLength: [500, "Tour imageCover field must be at most 500 characters."],
  },
  images: {
    type: [String],
  },
  slug: {
    type: String,
  },
  guides: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startLocation: {
    type: {
      type: String,
      required: [true, "Tour location type field is required."],
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "Tour location coordinates field is required."],
    },
    description: {
      type: String,
      maxLength: [200, "Tour location description field must be at most 200 characters."],
    },
    address: {
      type: String,
      maxLength: [200, "Tour location address field must be at most 200 characters."],
    },
  },
  locations: [
    {
      type: {
        type: String,
        required: [true, "Tour location type field is required."],
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Tour location coordinates field is required."],
      },
      description: {
        type: String,
        maxLength: [200, "Tour location description field must be at most 200 characters."],
      },
      address: {
        type: String,
        maxLength: [200, "Tour location address field must be at most 200 characters."],
      },
      day: {
        type: Number,
        required: [true, "Tour location day field is required."],
      },
    },
  ],
});

tourSchema.virtual("durationInWeeks").get(function () {
  return Number((this.durationDays / 7).toFixed(1));
});

tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

tourSchema.virtual("reviewsCount", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
  count: true,
});

tourSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

tourSchema.index({ ratingsAverage: -1, price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
