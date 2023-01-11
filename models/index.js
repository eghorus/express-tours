const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const { setSchemaOptions } = require("../helpers/mongoose-custom-plugins");

mongoose.plugin(setSchemaOptions);
mongoose.plugin(paginate);

const User = require("./user.model");
const Tour = require("./tour.model");
const Review = require("./review.model");

module.exports = { User, Tour, Review };
