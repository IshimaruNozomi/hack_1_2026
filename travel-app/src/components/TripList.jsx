import { useState } from 'react'
import './TripList.css'

export default function TripList({ trips }) {
  const [selectedTrip, setSelectedTrip] = useState(null)

  return (
    <div className="triplist-container">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="trip-card"
          onClick={() => setSelectedTrip(trip)}
        >
          <h3 className="trip-title">{trip.title}</h3>
          <p className="trip-date">{trip.trip_date || '日付なし'}</p>
        </div>
      ))}

      {/* モーダル */}
      {selectedTrip && (
        <div className="trip-modal">
          <div className="trip-modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedTrip(null)}
            >
              ✕
            </button>

            <h2>{selectedTrip.title}</h2>

            <div className="trip-detail">
              <p><span>日付:</span> {selectedTrip.trip_date}</p>
              <p><span>説明:</span> {selectedTrip.description}</p>
              <p><span>天気:</span> {selectedTrip.weather}</p>
              <p><span>メンバー:</span> {selectedTrip.members}</p>
              <p><span>満足度:</span> {selectedTrip.satisfaction}</p>
              <p><span>費用:</span> {selectedTrip.cost}円</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}