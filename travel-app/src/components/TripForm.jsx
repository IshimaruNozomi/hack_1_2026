import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SelectMap from '../components/SelectMap'

import './TripForm.css'

export default function TripForm({
  user,
  onSaved,
  onClose,
  editTrip
}) {

  /* =========================
      state
  ========================= */

  const [title, setTitle] =
    useState(editTrip?.title || '')

  const [description, setDescription] =
    useState(editTrip?.description || '')

  const [date, setDate] =
    useState(
      editTrip?.trip_date
        ? editTrip.trip_date.replaceAll('/', '-')
        : ''
    )

  const [lat, setLat] =
    useState(editTrip?.latitude || '')

  const [lng, setLng] =
    useState(editTrip?.longitude || '')

  const [loading, setLoading] =
    useState(false)

  const [weather, setWeather] =
    useState(editTrip?.weather || '')

  const [members, setMembers] =
    useState(editTrip?.members || '')

  const [satisfaction, setSatisfaction] =
    useState(
      editTrip?.satisfaction || ''
    )

  const [cost, setCost] =
    useState(editTrip?.cost || '')

  /* =========================
      保存
  ========================= */

  const handleSubmit = async () => {

    // 必須チェック
    if (
      !title ||
      !lat ||
      !lng ||
      !satisfaction
    ) {

      alert(
        'タイトル・位置・満足度は必須です'
      )

      return
    }

    setLoading(true)

    // YYYY-MM-DD → YYYY/MM/DD
    const formattedDate = date
      ? date.replaceAll('-', '/')
      : null

    /* =====================
        保存データ
    ===================== */

    const payload = {

      title,
      description,

      trip_date: formattedDate,

      latitude: parseFloat(lat),
      longitude: parseFloat(lng),

      weather,
      members,

      satisfaction: parseInt(
        satisfaction
      ),

      cost: cost
        ? parseInt(cost)
        : null
    }

    let error = null

    /* =====================
        編集
    ===================== */

    if (editTrip) {

      const result =
        await supabase
          .from('trips')
          .update(payload)
          .eq('id', editTrip.id)

      error = result.error
    }

    /* =====================
        新規追加
    ===================== */

    else {

      const result =
        await supabase
          .from('trips')
          .insert({
            user_id: user.id,
            ...payload
          })

      error = result.error
    }

    setLoading(false)

    /* =====================
        エラー
    ===================== */

    if (error) {

      console.error(error)

      alert(
        editTrip
          ? '更新失敗'
          : '保存失敗'
      )

      return
    }

    /* =====================
        成功
    ===================== */

    alert(
      editTrip
        ? '更新成功！'
        : '保存成功！'
    )

    // リセット
    setTitle('')
    setDescription('')
    setDate('')

    setLat('')
    setLng('')

    setWeather('')
    setMembers('')
    setSatisfaction('')
    setCost('')

    onSaved()
  }

  return (

    <div className="trip-form">

      {/* 閉じる */}

      <button
        type="button"
        onClick={() => {

          if (
            typeof onClose === 'function'
          ) {
            onClose()
          }

        }}
        className="form-close"
      >
        閉じる
      </button>

      {/* タイトル */}

      <h2 className="form-title">

        {editTrip
          ? '旅を編集'
          : '旅を記録'}

      </h2>

      {/* タイトル入力 */}

      <input
        className="form-input"
        placeholder="タイトル（例：京都旅行）"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      {/* 説明 */}

      <textarea
        className="form-textarea"
        placeholder="説明"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      {/* 日付 */}

      <input
        className="form-input"
        type="date"
        value={date}
        onChange={(e) =>
          setDate(e.target.value)
        }
      />

      {/* 地図 */}

      <div className="map-section">

        <SelectMap
          mode="select"

          initialLat={lat}
          initialLng={lng}

          onSelect={(lat, lng) => {

            setLat(lat)
            setLng(lng)

          }}
        />

      </div>

      {/* 緯度 */}

      <input
        className="form-input"
        value={lat}
        placeholder="緯度"
        readOnly
      />

      {/* 経度 */}

      <input
        className="form-input"
        value={lng}
        placeholder="経度"
        readOnly
      />

      {/* 天気 */}

      <select
        className="form-input"
        value={weather}
        onChange={(e) =>
          setWeather(e.target.value)
        }
      >

        <option value="">
          天気を選択
        </option>

        <option value="快晴">
          快晴
        </option>

        <option value="晴れ">
          晴れ
        </option>

        <option value="曇り">
          曇り
        </option>

        <option value="雨">
          雨
        </option>

      </select>

      {/* メンバー */}

      <input
        className="form-input"
        placeholder="メンバー"
        value={members}
        onChange={(e) =>
          setMembers(e.target.value)
        }
      />

      {/* 満足度 */}

      <select
        className="form-input"
        value={satisfaction}
        onChange={(e) =>
          setSatisfaction(e.target.value)
        }
      >

        <option value="">
          満足度を選択（必須）
        </option>

        <option value="1">
          1
        </option>

        <option value="2">
          2
        </option>

        <option value="3">
          3
        </option>

        <option value="4">
          4
        </option>

        <option value="5">
          5
        </option>

      </select>

      {/* 費用 */}

      <input
        className="form-input"
        placeholder="費用"
        value={cost}
        onChange={(e) =>
          setCost(e.target.value)
        }
      />

      {/* 保存ボタン */}

      <button
        className="form-button"
        onClick={handleSubmit}
        disabled={loading}
      >

        {loading
          ? (
            editTrip
              ? '更新中...'
              : '保存中...'
          )
          : (
            editTrip
              ? '更新する'
              : '保存'
          )}

      </button>

    </div>
  )
}