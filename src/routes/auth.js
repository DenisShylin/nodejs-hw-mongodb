import express from 'express';
import * as authController from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { registerSchema, loginSchema } from '../schemas/userSchemas.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(authController.register),
);

router.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(authController.login),
);

router.post('/refresh', ctrlWrapper(authController.refresh));

router.post('/logout', authenticate, ctrlWrapper(authController.logout));

export default router;
