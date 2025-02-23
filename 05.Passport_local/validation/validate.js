const runValidation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      errors: {
        wrap: {
          label: "",
        },
      },
    });
    if (error) {
      const errorList = error.details.map((err) => err.message);
      return res
        .status(400)
        .render("register", { title: "Register Page", errors: errorList });
    }
    next();
  };
};

module.exports = runValidation;
