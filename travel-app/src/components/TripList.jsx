import { useState } from 'react'
import './TripList.css'

export default function TripList({
  trips,
  onEdit
}) {

  const [selectedTrip, setSelectedTrip] =
    useState(null)

  return (

    <div className="triplist-container">

      {trips.map((trip) => (

        <div
          key={trip.id}
          className="trip-card"
          onClick={() =>
            setSelectedTrip(trip)
          }
        >

          {/* =====================
              左側情報
          ===================== */}

          <div>

            <h3 className="trip-title">
              {trip.title}
            </h3>

            <p className="trip-date">
              {trip.trip_date || '日付なし'}
            </p>

            <p className="trip-satisfaction">
              満足度：
              {trip.satisfaction || '-'}
            </p>

          </div>

          {/* =====================
              編集ボタン
          ===================== */}

          <button
            onClick={(e) => {

              e.stopPropagation()

              console.log(trip)

              // 詳細モーダル閉じる
              setSelectedTrip(null)

              // 編集開始
              onEdit(trip)

            }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              height: 'fit-content'
            }}
          >
            編集
          </button>

        </div>

      ))}

      {/* =========================
          詳細モーダル
      ========================= */}

      {selectedTrip && (

        <div className="trip-modal">

          <div className="trip-modal-content">

            <button
              className="close-btn"
              onClick={() =>
                setSelectedTrip(null)
              }
            >
              ✕
            </button>

            <h2>
              {selectedTrip.title}
            </h2>

            <div className="trip-detail">

              <p>
                <span>日付:</span>
                {' '}
                {selectedTrip.trip_date ||
                  '未設定'}
              </p>

              <p>
                <span>説明:</span>
                {' '}
                {selectedTrip.description ||
                  '未設定'}
              </p>

              <p>
                <span>天気:</span>
                {' '}
                {selectedTrip.weather ||
                  '未設定'}
              </p>

              <p>
                <span>メンバー:</span>
                {' '}
                {selectedTrip.members ||
                  '未設定'}
              </p>

              <p>
                <span>満足度:</span>
                {' '}
                {selectedTrip.satisfaction ||
                  '-'}
              </p>

              <p>
                <span>費用:</span>
                {' '}
                {selectedTrip.cost || '-'}
                円
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}