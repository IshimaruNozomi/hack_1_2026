import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import MapView from '../components/MapView'
import TripList from '../components/TripList'
import TripForm from '../components/TripForm'
import './MainPage.css'

export default function MainPage({ user, onLogout, setPage }) {
  const [trips, setTrips] = useState([])
  const [profile, setProfile] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [selectedLat, setSelectedLat] = useState('')
  const [selectedLng, setSelectedLng] = useState('')

  useEffect(() => {
    if (user) {
      fetchTrips()
      fetchProfile()
    }
  }, [user])

  // 旅行データ
  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setTrips(data || [])
    }
  }

  // 👤 プロフィール（居住地）
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
    }
  }

  return (
    <div>
      <Header onLogout={onLogout} setPage={setPage} />

      {/* ＋ボタン */}
      <button
        className="fab"
        onClick={() => setShowForm(true)}
      >
        ＋
      </button>

      {/* ===== モーダル ===== */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => {
                setShowForm(false)
                setSelectedLat('')
                setSelectedLng('')
              }}
            >
              閉じる
            </button>

            <TripForm
              user={user}
              onSaved={() => {
                fetchTrips()
                setShowForm(false)
              }}
              onClose={() => setShowForm(false)}
              latitude={selectedLat}
              longitude={selectedLng}
            />

          </div>
        </div>
      )}

      {/* ===== 地図 ===== */}
      <div className="map-container">
        <MapView
          trips={trips}
          profile={profile}
        />
      </div>

      {/* ===== 一覧 ===== */}
      <div className="trip-list">
        <TripList trips={trips} />
      </div>
    </div>
  )
}