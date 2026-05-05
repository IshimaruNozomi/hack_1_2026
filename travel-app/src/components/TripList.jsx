import { useState } from 'react'

export default function TripList({ trips }) {
  const [selectedTrip, setSelectedTrip] = useState(null)

  return (
    <div style={styles.container}>
      {trips.map((trip) => (
        <div
          key={trip.id}
          style={styles.card}
          onClick={() => setSelectedTrip(trip)}
        >
          <h3>{trip.title}</h3>
          <p>{trip.trip_date}</p>
        </div>
      ))}

      {/* モーダル */}
      {selectedTrip && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button onClick={() => setSelectedTrip(null)}>
              閉じる
            </button>

            <h2>{selectedTrip.title}</h2>

            <p>日付: {selectedTrip.trip_date}</p>
            <p>説明: {selectedTrip.description}</p>
            <p>天気: {selectedTrip.weather}</p>
            <p>メンバー: {selectedTrip.members}</p>
            <p>満足度: {selectedTrip.satisfaction}</p>
            <p>費用: {selectedTrip.cost}円</p>
            <p>
              位置: {selectedTrip.latitude}, {selectedTrip.longitude}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px'
  },
  card: {
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer'
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
    maxWidth: '400px',
    borderRadius: '10px'
  }
}