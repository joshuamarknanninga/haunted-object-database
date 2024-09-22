// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir);
}

// GET all locations
app.get('/api/locations', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ error: 'Failed to read data directory' });
    }
    const locations = [];
    files.forEach(file => {
      const data = fs.readFileSync(path.join(dataDir, file));
      try {
        const location = JSON.parse(data);
        locations.push(location);
      } catch (parseErr) {
        console.error(`Error parsing JSON from file ${file}:`, parseErr);
      }
    });
    res.json(locations);
  });
});

// POST a new location
app.post('/api/locations', (req, res) => {
  const { name, description, latitude, longitude } = req.body;
  if (!name || !description || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newLocation = {
    id: uuidv4(),
    name,
    description,
    latitude,
    longitude,
    createdAt: new Date().toISOString()
  };
  const filePath = path.join(dataDir, `${newLocation.id}.json`);
  fs.writeFile(filePath, JSON.stringify(newLocation, null, 2), (err) => {
    if (err) {
      console.error('Error writing new location file:', err);
      return res.status(500).json({ error: 'Failed to save location' });
    }
    res.status(201).json(newLocation);
  });
});

// Optional: GET a single location by ID
app.get('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(dataDir, `${id}.json`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file for ID ${id}:`, err);
      return res.status(404).json({ error: 'Location not found' });
    }
    try {
      const location = JSON.parse(data);
      res.json(location);
    } catch (parseErr) {
      console.error(`Error parsing JSON for ID ${id}:`, parseErr);
      res.status(500).json({ error: 'Failed to parse location data' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
