import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import contactsRouter from './routes/contacts.js';

const pino = pinoHttp();

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pino);

  app.use('/contacts', contactsRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  return app;
};
