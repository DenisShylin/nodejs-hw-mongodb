const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');

router.get('/', contactsController.getAllContacts);

router.get('/:contactId', contactsController.getContactById);

module.exports = router;
