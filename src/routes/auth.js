// routes/auth.js
import express from 'express';
import * as authController from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { registerSchema, loginSchema } from '../schemas/userSchemas.js';
import {
  resetEmailSchema,
  resetPasswordSchema,
} from '../schemas/passwordSchemas.js';
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

router.post('/logout', ctrlWrapper(authController.logout));

// Новые маршруты для сброса пароля
router.post(
  '/send-reset-email',
  validateBody(resetEmailSchema),
  ctrlWrapper(authController.sendResetEmail),
);

router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(authController.resetPassword),
);

export default router;
