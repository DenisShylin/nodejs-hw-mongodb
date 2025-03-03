import Contact from '../models/Contact.js';

export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    console.log('Найдено контактов:', contacts.length);
    return contacts;
  } catch (error) {
    console.error('Ошибка сервиса - getAllContacts:', error);
    throw error;
  }
};

export const getContactById = async contactId => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error(`Service error - getContactById (${contactId}):`, error);
    throw error;
  }
};

export const createContact = async contactData => {
  try {
    const newContact = await Contact.create(contactData);
    return newContact;
  } catch (error) {
    console.error('Service error - createContact:', error);
    throw error;
  }
};

export const updateContact = async (contactId, contactData) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      contactData,
      { new: true },
    );
    return updatedContact;
  } catch (error) {
    console.error(`Service error - updateContact (${contactId}):`, error);
    throw error;
  }
};

export const deleteContact = async contactId => {
  try {
    const result = await Contact.findByIdAndDelete(contactId);
    return result;
  } catch (error) {
    console.error(`Service error - deleteContact (${contactId}):`, error);
    throw error;
  }
};
