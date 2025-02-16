const Joi = require("joi");

exports.validationSchema = {
  userRegestrationSchema: Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    createdAt: Joi.date().default(Date.now),
  }),
  userLoginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};
