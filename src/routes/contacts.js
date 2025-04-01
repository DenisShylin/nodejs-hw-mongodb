// routes/contacts.js
import express from 'express';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody, isValidId } from '../middlewares/validateMiddleware.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactSchemas.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadCloud } from '../utils/cloudinaryService.js';

const router = express.Router();

// Добавляем middleware аутентификации для всех маршрутов
router.use(authenticate);

router.get('/', ctrlWrapper(contactsController.getAllContacts));
router.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.getContactById),
);
router.post(
  '/',
  uploadCloud.single('photo'), // Добавляем middleware для загрузки файлов
  validateBody(createContactSchema),
  ctrlWrapper(contactsController.createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  uploadCloud.single('photo'), // Добавляем middleware для загрузки файлов
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);
router.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.deleteContact),
);

export default router;
