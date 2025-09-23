import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HttpStatusCode } from "../constants/http-status-code.enum";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        errors: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
