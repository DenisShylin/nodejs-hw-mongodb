// contacts.js;
import Contact from '../models/Contact.js';

export const getAllContacts = async (query = {}, userId) => {
  try {
    const { page = 1, perPage = 10 } = query;
    const skip = (page - 1) * perPage;

    const filter = { userId };
    if (query.type) {
      filter.contactType = query.type;
    }
    if (query.isFavourite !== undefined) {
      filter.isFavourite = query.isFavourite === 'true';
    }

    const sortOptions = {};
    if (query.sortBy) {
      sortOptions[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    }

    const contacts = await Contact.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(perPage));

    const totalItems = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / perPage);

    const paginationInfo = {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };

    return paginationInfo;
  } catch (error) {
    console.error('Помилка сервісу - getAllContacts:', error);
    throw error;
  }
};

export const getContactById = async (contactId, userId) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, userId });
    return contact;
  } catch (error) {
    console.error(`Помилка сервісу - getContactById (${contactId}):`, error);
    throw error;
  }
};

export const createContact = async (contactData, userId) => {
  try {
    const newContact = await Contact.create({ ...contactData, userId });
    return newContact;
  } catch (error) {
    console.error('Помилка сервісу - createContact:', error);
    throw error;
  }
};

export const updateContact = async (contactId, contactData, userId) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      contactData,
      { new: true },
    );
    return updatedContact;
  } catch (error) {
    console.error(`Помилка сервісу - updateContact (${contactId}):`, error);
    throw error;
  }
};

export const deleteContact = async (contactId, userId) => {
  try {
    const result = await Contact.findOneAndDelete({ _id: contactId, userId });
    return result;
  } catch (error) {
    console.error(`Помилка сервісу - deleteContact (${contactId}):`, error);
    throw error;
  }
};
