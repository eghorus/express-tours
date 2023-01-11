const { Tour } = require("../models/index");
const { filterOutObjKeys } = require("../helpers/utils/object-utils");
const OpError = require("../helpers/operational-error");

const createTours = async (req, res, next) => {
  try {
    const filterCreateFields = (obj) => {
      return filterOutObjKeys(obj, ["ratingsAverage", "ratingsQuantity", "createdAt", "updatedAt"]);
    };
    let filteredFields;
    if (Array.isArray(req.body)) {
      filteredFields = req.body.map((i) => filterCreateFields(i));
    } else {
      filteredFields = filterCreateFields(req.body);
    }
    const tours = await Tour.create(filteredFields);
    const resultsCount = tours.length;

    res.status(201).json({
      status: "Success",
      data: { resultsCount, tours },
    });
  } catch (error) {
    next(error);
  }
};

const getTour = async (req, res, next) => {
  try {
    const { tour } = req;
    await tour.populate([
      { path: "guides", select: "name email imagePath role" },
      { path: "reviews" },
      { path: "reviewsCount" },
    ]);

    res.status(200).json({
      status: "Success",
      data: { tour },
    });
  } catch (error) {
    next(error);
  }
};

const getAllTours = async (req, res, next) => {
  try {
    let { page = 1, limit = 5, sort, select } = req.query;
    sort = sort ? sort.replace(/,/g, " ") : "-createdAt";
    select = select ? select.replace(/,/g, " ") : "";

    const filteredQuery = filterOutObjKeys(req.query, ["page", "limit", "sort", "select"]);
    const filteredQueryStr = JSON.stringify(filteredQuery).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const filteredQueryWithOperator = JSON.parse(filteredQueryStr);
    let populates = [];
    if (select === "") populates = [{ path: "guides", select: "name email imagePath role" }, { path: "reviewsCount" }];
    if (select.search("guides") > -1) populates.push({ path: "guides", select: "name email imagePath role" });
    if (select.search(/reviewsCount/i) > -1) populates.push({ path: "reviewsCount" });
    const paginationResults = await Tour.paginate(filteredQueryWithOperator, {
      page,
      limit,
      sort,
      select,
      populate: populates,
    });
    const { docs: tours, ...paginationData } = paginationResults;

    res.status(200).json({
      status: "Success",
      data: { tours, ...paginationData },
    });
  } catch (error) {
    next(error);
  }
};
/* Used the controller above instead */
// const getAllTours = async (req, res, next) => {
//   try {
//     let { page, limit, sort, select } = req.query;

//     const allCount = await Tour.estimatedDocumentCount();
//     page = page || 1;
//     limit = limit || 5;
//     const calcSkipValue = (page, limit, allCount) => {
//       const skip = (page - 1) * limit;
//       if (skip > allCount) return 0;
//       return skip;
//     };
//     const skip = calcSkipValue(page, limit, allCount);

//     sort = sort ? sort.replace(",", " ") : "-createdAt";
//     select = select ? select.replace(",", " ") : "";

//     const filteredQuery = filterOutObjKeys(req.query, ["page", "limit", "sort", "select"]);
//     const filteredQueryStr = JSON.stringify(filteredQuery).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
//     const filteredQueryWithOperator = JSON.parse(filteredQueryStr);
//     const tours = await Tour.find(filteredQueryWithOperator)
//       .skip(skip)
//       .limit(limit)
//       .sort(sort)
//       .select(select)
//       .populate({ path: "guides", select: "name email imagePath role" });
//     const resultsCount = tours.length;

//     res.status(200).json({
//       status: "Success",
//       data: { allCount, resultsCount, tours },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const updateTour = async (req, res, next) => {
  try {
    const { tour } = req;
    const updateFields = filterOutObjKeys(req.body, ["ratingsAverage", "ratingsQuantity", "createdAt", "updatedAt"]);
    for (let field in updateFields) {
      tour[field] = updateFields[field];
    }
    await tour.save();

    res.status(200).json({
      status: "Success",
      data: { tour },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    await Tour.deleteOne({ _id: tourId });

    res.status(204).json({
      status: "Success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const addTop5QueryProps = (req, res, next) => {
  req.query = { limit: 5, sort: "-ratingsAverage -price" };
  next();
};

const getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    if (!distance || !latlng || !unit) {
      return next(new OpError(400, "Distance, longitude, latitude, and unit fields are required."));
    }
    const [latitude, longitude] = latlng.split(",");
    if (!longitude || !latitude) {
      return next(new OpError(400, "Longitude an latitude fields must be provided in the format 'lat,lng'."));
    }

    const radius = unit === "mi" ? distance / 3958.8 : distance / 6378.1;
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } },
    });

    res.status(200).json({
      status: "Success",
      data: {
        results: tours.length,
        tours,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getToursNear = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    if (!latlng || !unit) {
      return next(new OpError(400, "Longitude, latitude, and unit fields are required."));
    }
    const [latitude, longitude] = latlng.split(",");
    if (!longitude || !latitude) {
      return next(new OpError(400, "Longitude an latitude fields must be provided in the format 'lat,lng'."));
    }

    const tours = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001,
          distanceField: "distance",
        },
      },
      {
        $project: {
          name: 1,
          distance: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "Success",
      data: {
        results: tours.length,
        tours,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTours,
  getTour,
  getAllTours,
  updateTour,
  deleteTour,
  addTop5QueryProps,
  getToursWithin,
  getToursNear,
};
