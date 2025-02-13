const path = require("path");

const homeRoute = (req, res) => {
  res.sendFile(path.join(__dirname, "../view/index.html"));
};

const errorRoute = (req, res, next) => {
  res.status(404).send(`<h2>Error <b>404</b> : Page not Found </h2>`);
};

module.exports = { homeRoute, errorRoute };
