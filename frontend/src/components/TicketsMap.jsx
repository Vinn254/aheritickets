// frontend/src/components/TicketsMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TicketsMap({ tickets }) {
  // Filter tickets with locations
  const ticketsWithLocation = tickets.filter(t => t.location && t.location.lat && t.location.lng);

  // Default center to Kisumu if no tickets
  const defaultCenter = ticketsWithLocation.length > 0
    ? [ticketsWithLocation[0].location.lat, ticketsWithLocation[0].location.lng]
    : [-0.1022, 34.7617];

  return (
    <div style={{ height: '400px', width: '100%', marginTop: 20, border: '3px solid #43e97b', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
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
        {ticketsWithLocation.map(ticket => (
          <Marker key={ticket._id} position={[ticket.location.lat, ticket.location.lng]}>
            <Popup>
              <div>
                <strong>{ticket.title}</strong><br />
                Customer: {ticket.customer?.name}<br />
                Status: {ticket.status}<br />
                Priority: {ticket.priority}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}