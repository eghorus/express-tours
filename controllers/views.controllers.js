const { Tour } = require("../models/index");

const getHome = async (req, res, next) => {
  try {
    const tours = await Tour.find();

    res.status(200).render("home.pug", { tours });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHome };
