import express from 'express';
import * as contactsController from '../controllers/contacts.js';

const router = express.Router();

router.get('/', contactsController.getAllContacts);

router.get('/:contactId', contactsController.getContactById);

export default router;
