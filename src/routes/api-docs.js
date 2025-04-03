import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу swagger.json, созданному при сборке
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../docs/swagger.json'), 'utf8'),
);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

export default router;
