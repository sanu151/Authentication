const Joi = require("joi");

const userValidationSchema = {
  userRegistrationSchema: Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    createdAt: Joi.date().default(Date.now),
  }),
  userLoginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

module.exports = userValidationSchema;
