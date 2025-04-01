// controllers/contacts.js
import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const contacts = await contactsService.getAllContacts(
    req.query,
    req.user._id,
  );

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.getContactById(contactId, req.user._id);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const contactData = { ...req.body };

  // Если был загружен файл, добавляем URL в данные контакта
  if (req.file) {
    contactData.photo = req.file.path;
  }

  const newContact = await contactsService.createContact(
    contactData,
    req.user._id,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const contactData = { ...req.body };

  // Если был загружен новый файл, обновляем URL фото
  if (req.file) {
    contactData.photo = req.file.path;
  }

  const updatedContact = await contactsService.updateContact(
    contactId,
    contactData,
    req.user._id,
  );

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await contactsService.deleteContact(contactId, req.user._id);

  if (!result) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
