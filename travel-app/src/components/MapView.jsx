import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// デフォルトアイコンを上書き
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})


export default function MapView({ trips = [] }) {
  return (
    <MapContainer
      center={[36.2048, 138.2529]}
      zoom={5}
      style={{ height: '300px', margin: '10px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 旅データからピン生成 */}
      {trips.map((trip) => (
        <Marker
          key={trip.id}
          position={[trip.latitude, trip.longitude]}
        />
      ))}
    </MapContainer>
  )
}