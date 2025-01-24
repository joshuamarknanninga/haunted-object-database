// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const Joi = require('joi');  // For validation
const winston = require('winston');  // For improved logging

const app = express();
const PORT = process.env.PORT || 5000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
(async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    logger.error('Failed to create data directory:', err);
  }
})();

// Validation schema for location
const locationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
});

// GET all locations
app.get('/api/locations', async (req, res) => {
  try {
    const files = await fs.readdir(dataDir);
    const locations = await Promise.all(
      files.map(async (file) => {
        const data = await fs.readFile(path.join(dataDir, file), 'utf8');
        return JSON.parse(data);
      })
    );
    res.json(locations);
  } catch (err) {
    logger.error('Error reading data directory:', err);
    res.status(500).json({ error: 'Failed to read data directory' });
  }
});

// POST a new location
app.post('/api/locations', async (req, res) => {
  try {
    const { error } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, latitude, longitude } = req.body;
    const newLocation = {
      id: uuidv4(),
      name,
      description,
      latitude,
      longitude,
      createdAt: new Date().toISOString()
    };

    const filePath = path.join(dataDir, `${newLocation.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newLocation, null, 2));

    res.status(201).json(newLocation);
  } catch (err) {
    logger.error('Error writing new location file:', err);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// GET a single location by ID
app.get('/api/locations/:id', async (req, res) => {
  const { id } = req.params;
  const filePath = path.join(dataDir, `${id}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const location = JSON.parse(data);
    res.json(location);
  } catch (err) {
    logger.error(`Error reading file for ID ${id}:`, err);
    res.status(404).json({ error: 'Location not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
