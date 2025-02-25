require('dotenv').config();
const { setupServer } = require('./server');
const { initMongoConnection } = require('./db/initMongoConnection');

async function startApplication() {
  try {
    await initMongoConnection();

    setupServer();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApplication();
