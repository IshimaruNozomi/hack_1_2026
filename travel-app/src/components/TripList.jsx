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

    /* =========================
        Storage画像削除
    ========================= */

    if (deleteTarget.image_url) {

      try {

        const url =
          deleteTarget.image_url

        /*
          URL例:
          .../storage/v1/object/public/trip-image/USERID/FILENAME.jpg
        */

        const splitTarget = '/trip-images/'

        if (url.includes(splitTarget)) {

          const filePath = url.split(splitTarget)[1]

          console.log('削除ファイルパス', filePath)

          const { error: storageError } = await supabase.storage
            .from('trip-images')
            .remove([filePath])

          if (storageError) {

            console.error(
              'storage delete error',
              storageError
            )

          }

        }

      } catch (e) {

        console.error(e)

      }
    }

    /* =========================
        DB削除
    ========================= */

    const {
      error
    } =
      await supabase
        .from('trips')
        .delete()
        .eq('id', deleteTarget.id)

    setDeleting(false)

    if (error) {

      console.error(error)

      alert('削除失敗')

      return
    }

    alert('削除しました')

    setDeleteTarget(null)

    // 詳細モーダル閉じる
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
              左側
          ===================== */}

          <div
            style={{
              flex: 1
            }}
          >

            {/* 画像 */}

            {trip.image_url && (

              <img
                src={
                  trip.image_url
                    ? (trip.updated_at
                        ? `${trip.image_url}${trip.image_url.includes('?') ? '&' : '?'}v=${new Date(trip.updated_at).getTime()}`
                        : trip.image_url)
                    : ''
                }
                alt={trip.title}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              />

            )}

            {/* タイトル */}

            <h3 className="trip-title">
              {trip.title}
            </h3>

            {/* 日付 */}

            <p className="trip-date">
              {trip.trip_date || '日付なし'}
            </p>

            {/* 満足度 */}

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
              gap: '10px',
              marginLeft: '15px'
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

            {/* 閉じる */}

            <button
              className="close-btn"
              onClick={() =>
                setSelectedTrip(null)
              }
            >
              ✕
            </button>

            {/* タイトル */}

            <h2>
              {selectedTrip.title}
            </h2>

            {/* 画像 */}

            {selectedTrip.image_url && (

              <img
                src={
                  selectedTrip.image_url
                    ? (selectedTrip.updated_at
                        ? `${selectedTrip.image_url}${selectedTrip.image_url.includes('?') ? '&' : '?'}v=${new Date(selectedTrip.updated_at).getTime()}`
                        : selectedTrip.image_url)
                    : ''
                }
                alt={selectedTrip.title}
                style={{
                  width: '100%',
                  maxHeight: '350px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                  marginTop: '15px',
                  marginBottom: '20px'
                }}
              />

            )}

            {/* 詳細 */}

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

              {/* 削除 */}

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