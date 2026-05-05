import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TripForm({
  user,
  onSaved,
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

  // 地図クリック → フォームに反映
  useEffect(() => {
    if (latitude && longitude) {
      setLat(latitude)
      setLng(longitude)
    }
  }, [latitude, longitude])

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
      console.error('insert error:', error)
      alert('保存失敗')
    } else {
      alert('保存成功！')

      // 入力リセット
      setTitle('')
      setDescription('')
      setDate('')
      setLat('')
      setLng('')

      onSaved()
    }
  }

  return (
    <div style={styles.container}>
      <h2>旅を記録</h2>

      <input
        placeholder="タイトル（例：京都旅行）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        value={lat}
        placeholder="緯度（地図クリックで自動入力）"
        readOnly
      />

      <input
        value={lng}
        placeholder="経度（地図クリックで自動入力）"
        readOnly
      />

      <input
        placeholder="天気（例：晴れ）"
        value={weather}
        onChange={(e) => setWeather(e.target.value)}
        />

        <input
        placeholder="メンバー"
        value={members}
        onChange={(e) => setMembers(e.target.value)}
        />

        <input
        placeholder="満足度（1〜5）"
        value={satisfaction}
        onChange={(e) => setSatisfaction(e.target.value)}
        />

        <input
        placeholder="費用（円）"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    borderBottom: '1px solid #ddd'
  }
}