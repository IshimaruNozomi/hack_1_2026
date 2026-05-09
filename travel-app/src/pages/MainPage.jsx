import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

import Header from '../components/Header'
import MapView from '../components/MapView'
import TripList from '../components/TripList'
import TripForm from '../components/TripForm'

import './MainPage.css'

/* =========================
   ベクトル生成
========================= */

function buildVector(trips) {
  const SEG = 36

  const vector = new Array(SEG).fill(0)

  trips.forEach((trip) => {
    if (!trip.latitude || !trip.longitude) return

    const lat = trip.latitude
    const lng = trip.longitude

    const angle =
      Math.atan2(lat - 36, lng - 138) + Math.PI

    const index =
      Math.floor(
        (angle / (Math.PI * 2)) * SEG
      )

    const value =
      trip.satisfaction || 3

    vector[index] += value
  })

  return vector
}

/* =========================
   cosine similarity
========================= */

function cosineSimilarity(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return (
    dot /
    (
      Math.sqrt(normA) *
      Math.sqrt(normB)
    )
  )
}

export default function MainPage({
  user,
  onLogout,
  setPage,
  darkMode,
  setDarkMode
}) {

  /* =========================
     state
  ========================= */
  const [trips, setTrips] = useState([])

  const [profile, setProfile] =
    useState(null)

  const [showForm, setShowForm] =
    useState(false)

  const [similarUsers, setSimilarUsers] =
    useState([])

  // タブ
  const [activeTab, setActiveTab] =
    useState('myTrips')

  /* =========================
     初期ロード
  ========================= */

  useEffect(() => {
    if (user) {
      fetchTrips()
      fetchProfile()
    }
  }, [user])

  /* =========================
     trip更新時
  ========================= */

  useEffect(() => {
    if (trips.length > 0) {
      fetchSimilarUsers()
    }
  }, [trips])

  /* =========================
     自分のtrip取得
  ========================= */

  async function fetchTrips() {
    const { data, error } =
      await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order(
          'created_at',
          { ascending: false }
        )

    if (error) {
      console.error(error)
      return
    }

    setTrips(data || [])
  }

  /* =========================
     profile取得
  ========================= */

  async function fetchProfile() {
    const { data, error } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
      console.error(error)
      return
    }

    setProfile(data)
  }

  /* =========================
     類似ユーザー取得
  ========================= */

  async function fetchSimilarUsers() {
    // 全trip取得
    const {
      data: allTrips,
      error: tripError
    } = await supabase
      .from('trips')
      .select('*')

    if (tripError || !allTrips) {
      console.error(tripError)
      return
    }

    // 全profile取得
    const {
      data: profiles,
      error: profileError
    } = await supabase
      .from('profiles')
      .select('*')

    if (profileError || !profiles) {
      console.error(profileError)
      return
    }

    // user_idごと整理
    const userMap = {}

    allTrips.forEach((trip) => {
      if (!userMap[trip.user_id]) {
        userMap[trip.user_id] = []
      }
      userMap[trip.user_id].push(trip)
    })

    // 自分ベクトル
    const myVector = buildVector(trips)

    const results = []

    Object.entries(userMap).forEach(([uid, userTrips]) => {
      // 自分除外
      if (uid === user.id) return

      // ベクトル
      const vec = buildVector(userTrips)

      // 類似度
      const similarity = cosineSimilarity(myVector, vec)

      // profile
      const profile = profiles.find((p) => String(p.id) === String(uid))

      // 満足度最大旅
      const topTrips = [...userTrips]
        .sort((a, b) => (b.satisfaction || 0) - (a.satisfaction || 0))
        .slice(0, 1)

      results.push({
        user_id: uid,
        username: profile?.username || '未設定',
        similarity,
        topTrips
      })
    })

    // 類似度順
    results.sort((a, b) => b.similarity - a.similarity)

    setSimilarUsers(results.slice(0, 5))
  }

  return (
    <div>

      <Header
        onLogout={onLogout}
        setPage={setPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* =========================
          Header
      ========================= */}

      <Header
        onLogout={onLogout}
        setPage={setPage}
      />

      {/* =========================
          FAB
      ========================= */}

      <button
        className="fab"
        onClick={() =>
          setShowForm(true)
        }
      >
        ＋
      </button>

      {/* =========================
          モーダル
      ========================= */}

      {showForm && (
        <div className="modal">

          <div className="modal-content">

            <button
              className="close-btn"
              onClick={() =>
                setShowForm(false)
              }
            >
              閉じる
            </button>

            <TripForm
              user={user}
              onSaved={() => {
                fetchTrips()
                setShowForm(false)
              }}
            />

          </div>

        </div>
      )}

      {/* =========================
          地図
      ========================= */}

      <div className="map-container">
        <MapView
          trips={trips}
          profile={profile}
        />
      </div>

      {/* =========================
    タブ
========================= */}

<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    padding: '20px'
  }}
>

  <div
    style={{
      display: 'flex',
      gap: '15px'
    }}
  >

    {/* 自分 */}
    <button
      onClick={() =>
        setActiveTab('myTrips')
      }
      style={{
        width: '180px',
        padding: '14px 0',

        border: 'none',
        borderRadius: '14px',

        cursor: 'pointer',

        fontSize: '16px',
        fontWeight: 'bold',

        transition: '0.2s',

        background:
          activeTab === 'myTrips'
            ? '#333'
            : '#ddd',

        color:
          activeTab === 'myTrips'
            ? '#fff'
            : '#000'
      }}
    >
      自分の旅
    </button>

    {/* 類似 */}
    <button
      onClick={() =>
        setActiveTab('similar')
      }
      style={{
        width: '180px',
        padding: '14px 0',

        border: 'none',
        borderRadius: '14px',

        cursor: 'pointer',

        fontSize: '16px',
        fontWeight: 'bold',

        transition: '0.2s',

        background:
          activeTab === 'similar'
            ? '#333'
            : '#ddd',

        color:
          activeTab === 'similar'
            ? '#fff'
            : '#000'
      }}
    >
      類似ユーザー
    </button>

  </div>

</div>

      {/* =========================
          タブ内容
      ========================= */}

      <div className="trip-list">

        {/* =====================
            自分の旅
        ===================== */}

        {activeTab === 'myTrips' && (
          <TripList trips={trips} />
        )}

        {/* =====================
            類似ユーザー
        ===================== */}

        {activeTab === 'similar' && (

          <div
            style={{
              padding: '20px'
            }}
          >

            {similarUsers.length === 0 && (
              <p>
                まだ類似ユーザーがいません
              </p>
            )}

            {similarUsers.map((u) => (

              <div
                key={u.user_id}
                style={{
                  marginBottom: '20px',

                  padding: '15px',

                  border:
                    '1px solid #ccc',

                  borderRadius: '10px'
                }}
              >

                {/* 名前 */}
                <h4>
                  {u.username}
                </h4>

                {/* 類似度 */}
                <div>
                  類似度：
                  {(u.similarity * 100)
                    .toFixed(1)}%
                </div>

                {/* おすすめ旅 */}
                <div
                  style={{
                    marginTop: '10px'
                  }}
                >
                  <b>
                    おすすめ旅先
                  </b>
                </div>

                {u.topTrips.map((trip) => (

                  <div
                    key={trip.id}
                    style={{
                      marginTop: '10px',

                      padding: '10px',

                      background: '#f5f5f5',

                      borderRadius: '8px'
                    }}
                  >

                    <div>
                      タイトル：
                      {trip.title}
                    </div>

                    <div>
                      日付：
                      {trip.trip_date ||
                        '未設定'}
                    </div>

                    <div>
                      天気：
                      {trip.weather ||
                        '未設定'}
                    </div>

                    <div>
                      満足度：
                      {trip.satisfaction ||
                        '-'}
                    </div>

                    <div>
                      費用：
                      {trip.cost || '-'}円
                    </div>

                  </div>

                ))}

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  )
}