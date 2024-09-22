import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import './Map.css';

const containerStyle = {
  width: '100%',
  height: '80vh'
};

// Default center of the map (you can adjust as needed)
const center = {
  lat: 39.8283, // Center of USA
  lng: -98.5795
};

const Map = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Fetch existing haunted locations from backend
    axios.get('http://localhost:5000/api/locations')
      .then(response => setLocations(response.data))
      .catch(error => console.error('Error fetching locations:', error));
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Open a form/modal to submit new haunted location
    // For simplicity, using prompt (replace with a proper form/modal)
    const name = prompt("Enter haunted location name:");
    if (!name) return; // If user cancels or doesn't enter a name

    const description = prompt("Enter description:");
    if (!description) return; // If user cancels or doesn't enter a description

    const newLocation = { name, description, latitude: lat, longitude: lng };
    
    axios.post('http://localhost:5000/api/locations', newLocation)
      .then(response => setLocations([...locations, response.data]))
      .catch(error => console.error('Error adding location:', error));
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
        onClick={handleMapClick}
      >
        {locations.map(location => (
          <Marker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            title={location.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
