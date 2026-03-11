// frontend/src/components/LocationPicker.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPicker({ location, setLocation }) {
  // Default to Kisumu, Kenya
  const defaultCenter = [-0.1022, 34.7617];

  return (
    <div style={{ height: '250px', width: '100%', marginBottom: 20, border: '3px solid #43e97b', borderRadius: '8px', overflow: 'hidden' }}>
      <p style={{ marginBottom: 8, fontWeight: 600 }}>Click on the map to set your location:</p>
      <MapContainer center={location || defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri'
          maxZoom={19}
          opacity={0.8}
        />
        <LocationMarker position={location} setPosition={setLocation} />
      </MapContainer>
      {location && (
        <p style={{ marginTop: 8, fontSize: 14 }}>
          Selected location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}