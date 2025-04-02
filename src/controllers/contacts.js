// controllers/contacts.js
import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import { uploadImage } from '../utils/cloudinaryService.js';

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
  try {
    const contactData = { ...req.body };

    // Якщо був завантажений файл, додаємо URL до даних контакту
    if (req.file) {
      try {
        const photoUrl = await uploadImage(req.file);
        if (photoUrl) {
          contactData.photo = photoUrl;
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        // Продовжуємо без фото у разі помилки
      }
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
  } catch (error) {
    console.error('Create contact error:', error);
    throw error;
  }
};

export const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contactData = { ...req.body };

    // Якщо був завантажений новий файл, оновлюємо URL фото
    if (req.file) {
      try {
        const photoUrl = await uploadImage(req.file);
        if (photoUrl) {
          contactData.photo = photoUrl;
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        // Продовжуємо без оновлення фото у разі помилки
      }
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
  } catch (error) {
    console.error('Update contact error:', error);
    throw error;
  }
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await contactsService.deleteContact(contactId, req.user._id);

  if (!result) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
