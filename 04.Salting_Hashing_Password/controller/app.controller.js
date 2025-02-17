const routeError = (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "Page not found",
  });
};

const serverError = (err, req, res, next) => {
  res.status(501).json({
    status: 501,
    message: "Internal Server Error",
    err,
  });
};

const homeRoute = (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Welcome to Home Route",
  });
};

module.exports = { routeError, serverError, homeRoute };
