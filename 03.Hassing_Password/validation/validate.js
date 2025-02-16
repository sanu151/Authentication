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
      return res.status(400).json({
        message: "Invalid Input",
        errorList,
      });
    }
    next();
  };
};

module.exports = runValidation;
