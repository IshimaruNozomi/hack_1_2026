import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

/**
 * mode:
 *  - "select" → クリックで位置選択
 *  - "view"   → 表示のみ
 *
 * value:
 *  - { lat, lng } 初期位置（編集時用）
 */

function ClickHandler({ onSelect, setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng

      if (typeof onSelect === 'function') {
        onSelect(lat, lng)
      }

      setPosition([lat, lng])
    }
  })
  return null
}

export default function SelectMap({
  mode = 'select',
  onSelect,
  value = null
}) {
  const [position, setPosition] = useState(null)

  // 初期値セット（編集時）
  useEffect(() => {
    if (value?.lat && value?.lng) {
      setPosition([value.lat, value.lng])
    }
  }, [value])

  return (
    <MapContainer
      center={
        position || [36.2048, 138.2529] // 日本中心
      }
      zoom={position ? 10 : 5}
      style={{ height: '300px', width: '100%', marginTop: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* selectモードの時だけクリック有効 */}
      {mode === 'select' && (
        <ClickHandler
          onSelect={onSelect}
          setPosition={setPosition}
        />
      )}

      {/* マーカー表示 */}
      {position && <Marker position={position} />}
    </MapContainer>
  )
}