import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import MapView from '../components/MapView'      // 表示用
import SelectMap from '../components/SelectMap'  // 登録用
import TripList from '../components/TripList'
import TripForm from '../components/TripForm'

export default function MainPage({ user, onLogout }) {
  const [trips, setTrips] = useState([])

  // モーダル表示
  const [showForm, setShowForm] = useState(false)

  // 登録用座標
  const [selectedLat, setSelectedLat] = useState('')
  const [selectedLng, setSelectedLng] = useState('')

  // データ取得
  useEffect(() => {
    if (user) fetchTrips()
  }, [user])

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setTrips(data)
    }
  }

  // 地図クリック → 座標保存
  const handleMapClick = (lat, lng) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
  }

  return (
    <div>
      <Header />

      <div style={{ padding: '10px' }}>
        <button onClick={onLogout}>ログアウト</button>
      </div>

      {/* ＋ボタン */}
      <button
        style={styles.fab}
        onClick={() => setShowForm(true)}
      >
        ＋
      </button>

      {/* ===== 登録モーダル ===== */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button
              onClick={() => {
                setShowForm(false)
                setSelectedLat('')
                setSelectedLng('')
              }}
            >
              閉じる
            </button>

            {/* フォーム */}
            <TripForm
              user={user}
              onSaved={() => {
                fetchTrips()
                setShowForm(false)
              }}
              latitude={selectedLat}
              longitude={selectedLng}
            />

            {/* 登録用地図（クリックで座標取得） */}
            <SelectMap onMapClick={handleMapClick} />
          </div>
        </div>
      )}

      {/* ===== メイン地図（表示専用） ===== */}
      <MapView trips={trips} />

      {/* 一覧 */}
      <TripList trips={trips} />
    </div>
  )
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    fontSize: '30px',
    background: '#2196f3',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    zIndex: 900
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    width: '90%',
    maxWidth: '500px',
    borderRadius: '10px',
    position: 'relative',
    zIndex: 1001
  }
}