const sanitizeMongoQuery = async (req, res, next) => {
  const sanitizedQueryStr = JSON.stringify(req.query).replace(/\$/g, "");
  const sanitizedQuery = JSON.parse(sanitizedQueryStr);
  req.query = sanitizedQuery;

  const sanitizedBodyStr = JSON.stringify(req.body).replace(/\$/g, "");
  const sanitizedBody = JSON.parse(sanitizedBodyStr);
  req.body = sanitizedBody;
  next();
};

module.exports = sanitizeMongoQuery;
