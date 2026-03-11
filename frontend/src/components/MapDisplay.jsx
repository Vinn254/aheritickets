// frontend/src/components/MapDisplay.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapDisplay({ location }) {
  if (!location || !location.lat || !location.lng) {
    return <p>No location provided.</p>;
  }

  return (
    <div style={{ height: '250px', width: '100%', marginTop: 20, border: '3px solid #43e97b', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
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
        <Marker position={[location.lat, location.lng]}></Marker>
      </MapContainer>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </p>
    </div>
  );
}