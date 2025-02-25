// Додайте логування для налагодження
console.log('Starting application...');
require('dotenv').config();
console.log('Environment loaded');

const { setupServer } = require('./server');
console.log('Server module loaded');

const { initMongoConnection } = require('./src/db/initMongoConnection');
console.log('MongoDB connection module loaded');

async function startApplication() {
  try {
    console.log('Connecting to MongoDB...');
    await initMongoConnection();
    console.log('MongoDB connected');

    setupServer();
    console.log('Server setup completed');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApplication();
