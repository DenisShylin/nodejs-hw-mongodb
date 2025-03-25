// validateMiddleware.js;
import Joi from 'joi';
import { isValidObjectId } from 'mongoose';
import createError from 'http-errors';

export const validateBody = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      next(createError(400, error.message));
      return;
    }

    next();
  };
};

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    next(createError(400, `${contactId} is not a valid id format`));
    return;
  }

  next();
};
