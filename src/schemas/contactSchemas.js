// contactSchemas.js;
import Joi from 'joi';

const contactTypeEnum = ['work', 'home', 'personal'];

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(50),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...contactTypeEnum),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(50),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...contactTypeEnum),
}).min(1);
