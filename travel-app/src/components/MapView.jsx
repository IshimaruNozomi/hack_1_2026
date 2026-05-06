import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// デフォルトアイコン修正（重要）
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// 🟥 旅行ピン（赤）
const tripIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

// 🟦 居住地ピン（青）
const homeIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

export default function MapView({ trips = [], profile = null }) {
  return (
    <MapContainer
      center={[36.2048, 138.2529]}
      zoom={5}
      style={{ height: '300px', margin: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🟥 旅行ピン */}
      {trips.map((trip) => (
        trip.latitude && trip.longitude && (
          <Marker
            key={trip.id}
            position={[trip.latitude, trip.longitude]}
            icon={tripIcon}
          >
            <Popup>
              <b>{trip.title}</b>
              <br />
              {trip.description}
            </Popup>
          </Marker>
        )
      ))}

      {/* 🟦 居住地ピン */}
      {profile?.latitude && profile?.longitude && (
        <Marker
          position={[profile.latitude, profile.longitude]}
          icon={homeIcon}
        >
          <Popup>
            <b>あなたの居住地</b>
            <br />
            {profile.location_name || '未設定'}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}