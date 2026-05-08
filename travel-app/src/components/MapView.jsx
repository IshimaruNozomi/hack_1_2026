import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// デフォルトアイコン修正
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// ピン
const tripIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
})

const homeIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

// 満足度 → 半径倍率
function getMultiplier(s) {
  switch (parseInt(s)) {
    case 5: return 0.8
    case 4: return 0.9
    case 3: return 1.0
    case 2: return 1.1
    case 1: return 1.2
    default: return 1.0
  }
}

// 方位角
function bearingRad(from, to) {
  const dLat = (to[0] - from[0]) * Math.PI / 180
  const dLng = (to[1] - from[1]) * Math.PI / 180
  return Math.atan2(dLat, dLng)
}

// 距離（m）
function distanceM(a, b) {
  const dx = (b[0] - a[0]) * 111000
  const dy = (b[1] - a[1]) * 111000 * Math.cos((a[0] * Math.PI) / 180)
  return Math.sqrt(dx * dx + dy * dy)
}

// 角度差
function angleDiff(a, b) {
  let d = Math.abs(a - b)
  if (d > Math.PI) d = 2 * Math.PI - d
  return d
}

// 指定方向へ移動
function destPoint(home, angle, dist) {
  const dLat = (dist / 111000) * Math.sin(angle)
  const dLng =
    (dist / (111000 * Math.cos((home[0] * Math.PI) / 180))) *
    Math.cos(angle)
  return [home[0] + dLat, home[1] + dLng]
}

// 歪んだポリゴン生成
function buildDistortedPolygon(home, trips) {
  if (!home || trips.length === 0) return []

  const samples = trips
    .filter(t => t.latitude && t.longitude)
    .map(t => {
      const pos = [t.latitude, t.longitude]
      return {
        angle: bearingRad(home, pos),
        dist: distanceM(home, pos),
        mult: getMultiplier(t.satisfaction)
      }
    })

  const SEG = 180
  const result = []

  for (let i = 0; i < SEG; i++) {
    const a = (i / SEG) * 2 * Math.PI

    let wSum = 0
    let rSum = 0

    samples.forEach(s => {
      const d = angleDiff(a, s.angle)

      // 角度が近いほど強く影響（ガウス風）
      const w = Math.exp(-(d * d) / 0.5)

      wSum += w
      rSum += w * s.dist * s.mult
    })

    const radius = wSum > 0 ? rSum / wSum : 500000

    result.push(destPoint(home, a, radius))
  }

  return result
}

export default function MapView({ trips = [], profile = null }) {
  const home =
    profile?.latitude && profile?.longitude
      ? [profile.latitude, profile.longitude]
      : null

  const polygon = home ? buildDistortedPolygon(home, trips) : []

  return (
    <MapContainer
      center={home || [36.2048, 138.2529]}
      zoom={5}
      style={{ height: '300px', margin: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 居住地 */}
      {home && (
        <Marker position={home} icon={homeIcon}>
          <Popup>あなたの居住地</Popup>
        </Marker>
      )}

      {/* 旅行ピン（そのまま） */}
      {trips.map((trip) =>
        trip.latitude && trip.longitude ? (
          <Marker
            key={trip.id}
            position={[trip.latitude, trip.longitude]}
            icon={tripIcon}
          >
            <Popup>
              <b>{trip.title}</b>
              <br />
              満足度: {trip.satisfaction}
            </Popup>
          </Marker>
        ) : null
      )}

      {/* 歪みレイヤー（1つだけ） */}
      {polygon.length > 0 && (
        <Polygon
          positions={polygon}
          pathOptions={{
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.15,
            weight: 2
          }}
        />
      )}
    </MapContainer>
  )
}