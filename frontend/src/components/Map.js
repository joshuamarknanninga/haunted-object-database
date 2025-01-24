import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import './Map.css';
import Modal from './Modal'; // Assuming you add a modal component for input

const containerStyle = {
  width: '100%',
  height: '80vh'
};

// Default center of the map (center of USA)
const defaultCenter = {
  lat: 39.8283, 
  lng: -98.5795
};

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({});

  useEffect(() => {
    // Fetch existing haunted locations from backend
    axios.get('http://localhost:5000/api/locations')
      .then(response => setLocations(response.data))
      .catch(error => alert('Error fetching locations: ' + error.message));
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewLocation({ latitude: lat, longitude: lng });
    setIsModalOpen(true);
  };

  const handleSubmit = (name, description) => {
    if (!name || !description) {
      alert("Both name and description are required.");
      return;
    }

    const locationData = { name, description, latitude: newLocation.latitude, longitude: newLocation.longitude };

    axios.post('http://localhost:5000/api/locations', locationData)
      .then(response => {
        setLocations([...locations, response.data]);
        setIsModalOpen(false);
      })
      .catch(error => alert('Error adding location: ' + error.message));
  };

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
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

      {/* Modal for adding new location */}
      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          latitude={newLocation.latitude}
          longitude={newLocation.longitude}
        />
      )}
    </div>
  );
};

export default Map;
