// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 5000;

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
      return res.status(500).json({ error: 'Failed to read data directory' });
    }
    const locations = [];
    files.forEach(file => {
      const data = fs.readFileSync(path.join(dataDir, file));
      locations.push(JSON.parse(data));
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
    createdAt: new Date()
  };
  const filePath = path.join(dataDir, `${newLocation.id}.json`);
  fs.writeFile(filePath, JSON.stringify(newLocation, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save location' });
    }
    res.status(201).json(newLocation);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
