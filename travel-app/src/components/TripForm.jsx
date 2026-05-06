import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SelectMap from '../components/SelectMap'
import './TripForm.css'

export default function TripForm({
  user,
  onSaved,
  onClose,
  latitude,
  longitude
}) {

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState('')
  const [members, setMembers] = useState('')
  const [satisfaction, setSatisfaction] = useState('')
  const [cost, setCost] = useState('')
  

  const handleSubmit = async () => {
    if (!title || !lat || !lng) {
      alert('タイトルと位置は必須です')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('trips').insert({
      user_id: user.id,
      title,
      description,
      trip_date: date || null,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      weather,
      members,
      satisfaction: satisfaction ? parseInt(satisfaction) : null,
      cost: cost ? parseInt(cost) : null
    })

    setLoading(false)

    if (error) {
      console.error(error)
      alert('保存失敗')
      return
    }

    alert('保存成功！')

    setTitle('')
    setDescription('')
    setDate('')
    setLat('')
    setLng('')
    setWeather('')
    setMembers('')
    setSatisfaction('')
    setCost('')

    onSaved()
  }

  return (
    <div className="trip-form">
      <h2 className="form-title">旅を記録</h2>
      <button
        type="button"
        onClick={onClose}
        className="form-close"
      >
        閉じる
      </button>

      {/* 入力群 */}
      <input
        className="form-input"
        placeholder="タイトル（例：京都旅行）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="form-textarea"
        placeholder="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="form-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* 🗺️ 地図（ここに1回だけ） */}
      <div className="map-section">
        <SelectMap
          mode="select"
          onSelect={(lat, lng) => {
            setLat(lat)
            setLng(lng)
          }}
        />
      </div>

      {/* 緯度経度 */}
      <input
        className="form-input"
        value={lat}
        placeholder="緯度"
        readOnly
      />

      <input
        className="form-input"
        value={lng}
        placeholder="経度"
        readOnly
      />

      {/* その他 */}
      <input
        className="form-input"
        placeholder="天気"
        value={weather}
        onChange={(e) => setWeather(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="メンバー"
        value={members}
        onChange={(e) => setMembers(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="満足度"
        value={satisfaction}
        onChange={(e) => setSatisfaction(e.target.value)}
      />

      <input
        className="form-input"
        placeholder="費用"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />

      {/* ボタン（最後） */}
      <button
        className="form-button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  )
}