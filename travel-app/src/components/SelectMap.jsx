import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'

function ClickHandler({ onSelect, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onSelect(lat, lng)
    }
  })
  return null
}

export default function SelectMap({ onSelect }) {
  const [position, setPosition] = useState(null)

  return (
    <MapContainer
      center={[36.2048, 138.2529]}
      zoom={5}
      style={{ height: '300px', width: '100%', marginTop: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <ClickHandler
        onSelect={onSelect}
        setPosition={setPosition}
      />

      {position && <Marker position={position} />}
    </MapContainer>
  )
}