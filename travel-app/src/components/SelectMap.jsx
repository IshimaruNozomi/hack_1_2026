import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'

function ClickHandler({ onMapClick, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onMapClick(lat, lng)
    }
  })
  return null
}

export default function SelectMap({ onMapClick }) {
  const [position, setPosition] = useState(null)

  return (
    <MapContainer
      center={[36.2048, 138.2529]}
      zoom={5}
      style={{ height: '300px', margin: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClickHandler
        onMapClick={onMapClick}
        setPosition={setPosition}
      />

      {position && <Marker position={position} />}
    </MapContainer>
  )
}