const Contact = require('../models/Contact');

const getAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    console.log('Найдено контактов:', contacts.length);
    return contacts;
  } catch (error) {
    console.error('Ошибка сервиса - getAllContacts:', error);
    throw error;
  }
};

const getContactById = async contactId => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error(`Service error - getContactById (${contactId}):`, error);
    throw error;
  }
};

module.exports = {
  getAllContacts,
  getContactById,
};
