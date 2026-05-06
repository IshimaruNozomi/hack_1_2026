import L from 'leaflet'

// デフォルト修正（アイコンが出ないバグ対策）
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
})

// 🟦 自分用ピン（青）
export const homeIcon = new L.Icon({
  iconUrl:
    'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

// 🟥 旅行用ピン（赤）
export const tripIcon = new L.Icon({
  iconUrl:
    'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})