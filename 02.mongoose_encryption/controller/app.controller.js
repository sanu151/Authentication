exports.routeError = (req, res, next) => {
  res.status(404).send(`<h1>Error 404</h1><h2>Page Not Found</h2>`);
  res.end();
};
exports.serverError = (err, req, res, next) => {
  res.status(501).send(`<h1>Error: ${err.status}</h1><h2>Server Error</h2>`);
  res.end();
};

exports.homeRoute = (req, res) => {
  res
    .status(200)
    .send(
      `<h1>Home Page</h1><h2>Encrypting database using mongoose-encryption</h2><p>doc: <a href= "https://www.npmjs.com/package/mongoose-encryption">mongoose-encryption Documentation</a></p>`
    );
};
