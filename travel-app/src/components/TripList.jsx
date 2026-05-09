import { useState } from 'react'
import { supabase } from '../lib/supabase'

import './TripList.css'

export default function TripList({
  trips,
  onEdit,
  onDeleted
}) {

  const [selectedTrip, setSelectedTrip] =
    useState(null)

  const [deleteTarget, setDeleteTarget] =
    useState(null)

  const [deleting, setDeleting] =
    useState(false)

  /* =========================
      削除
  ========================= */

  const handleDelete = async () => {

    if (!deleteTarget) return

    setDeleting(true)

    console.log(
      '削除対象',
      deleteTarget
    )

    const {
      data,
      error
    } =
      await supabase
        .from('trips')
        .delete()
        .eq(
          'id',
          String(deleteTarget.id)
        )
        .select()

    console.log('delete data', data)
    console.log('delete error', error)

    setDeleting(false)

    if (error) {

      console.error(error)

      alert('削除失敗')

      return
    }

    alert('削除しました')

    setDeleteTarget(null)

    // 詳細モーダルも閉じる
    setSelectedTrip(null)

    // 再取得
    if (onDeleted) {
      onDeleted()
    }
  }

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
              右側ボタン
          ===================== */}

          <div
            style={{
              display: 'flex',
              gap: '10px'
            }}
          >

            {/* 編集 */}

            <button
              onClick={(e) => {

                e.stopPropagation()

                setSelectedTrip(null)

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

            {/* 削除 */}

            <button
              onClick={(e) => {

                e.stopPropagation()

                setDeleteTarget(trip)

              }}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '10px',
                background: '#dc2626',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                height: 'fit-content'
              }}
            >
              削除
            </button>

          </div>

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

      {/* =========================
          削除確認モーダル
      ========================= */}

      {deleteTarget && (

        <div className="trip-modal">

          <div className="trip-modal-content">

            <h2>
              本当に削除しますか？
            </h2>

            <p
              style={{
                marginTop: '15px'
              }}
            >
              「{deleteTarget.title}」
              を削除します。
            </p>

            <div
              style={{
                display: 'flex',
                gap: '15px',
                marginTop: '25px',
                justifyContent: 'center'
              }}
            >

              {/* キャンセル */}

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#ccc',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                キャンセル
              </button>

              {/* 削除実行 */}

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {deleting
                  ? '削除中...'
                  : '削除する'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}