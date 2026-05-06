import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SelectMap from '../components/SelectMap'
import './ProfilePage.css'

export default function ProfilePage({ user, setPage }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isEditOpen, setIsEditOpen] = useState(false)

  const [form, setForm] = useState({
    username: '',
    bio: ''
  })

  const [location, setLocation] = useState({
    name: '',
    lat: null,
    lng: null
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(error)
    } else {
      setProfile(data)

      setForm({
        username: data.username || '',
        bio: data.bio || ''
      })

      setLocation({
        name: data.location_name || '',
        lat: data.latitude || null,
        lng: data.longitude || null
      })
    }

    setLoading(false)
  }

  const handleSave = async () => {
    console.log("保存開始", form, location)

    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        bio: form.bio,
        location_name: location.name,
        latitude: location.lat,
        longitude: location.lng
      })
      .eq('id', user.id)
      .select()

    console.log("結果:", data)
    console.log("エラー:", error)

    if (error) return

    setProfile(data[0])

    await fetchProfile()
    setIsEditOpen(false)
  }

  if (loading) return <div>Loading...</div>

  if (!profile) {
    return <div>プロフィールが見つかりません</div>
  }

  return (
    <div className="profile-container">
      <h2>プロフィール</h2>

      {/* 表示 */}
      <div className="profile-card">
        <p><b>名前：</b> {profile.username || '未設定'}</p>
        <p><b>自己紹介：</b></p>
        <p>{profile.bio || 'まだ登録されていません'}</p>

        <p><b>居住地：</b></p>
        <p>{profile.location_name || '未設定'}</p>

        <p>
          緯度: {profile.latitude}<br />
          経度: {profile.longitude}
        </p>
      </div>

      <button className="profile-btn profile-btn-primary"　onClick={() => setIsEditOpen(true)}>
        編集する
      </button>

      <button className="profile-btn profile-btn-secondary" onClick={() => setPage('main')}>
        戻る
      </button>

      {/* モーダル */}
      {isEditOpen && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <h3>プロフィール編集</h3>

            <input
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="名前"
              className="profile-input"
            />

            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
              placeholder="自己紹介"
              className="profile-textarea"
            />

            <h4>居住地</h4>

            <input
              value={location.name}
              onChange={(e) =>
                setLocation({ ...location, name: e.target.value })
              }
              placeholder="場所名"
              className="profile-input"
            />

            <SelectMap
              onSelect={(lat, lng) =>
                setLocation((prev) => ({
                  ...prev,
                  lat,
                  lng
                }))
              }
            />

            <p>
              緯度: {location.lat}<br />
              経度: {location.lng}
            </p>

            <div className="profile-btn">
              <button className="profile-btn profile-btn-primary" onClick={handleSave}>
                保存
              </button>

              <button className="profile-btn profile-btn-secondary" onClick={() => setIsEditOpen(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

