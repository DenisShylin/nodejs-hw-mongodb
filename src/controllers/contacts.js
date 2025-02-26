import * as contactsService from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactsService.getAllContacts();

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    console.error('Error getting all contacts:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await contactsService.getContactById(contactId);

    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    console.error(
      `Error getting contact with id ${req.params.contactId}:`,
      error,
    );
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
