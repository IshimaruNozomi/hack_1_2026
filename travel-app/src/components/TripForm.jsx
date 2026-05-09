import { useEffect, useState } from 'react'
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
      state (single form object)
  ========================= */

  const [form, setForm] = useState(() => ({
    title: editTrip?.title || '',
    description: editTrip?.description || '',
    trip_date: editTrip?.trip_date
      ? editTrip.trip_date.replaceAll('/', '-')
      : '',
    latitude: editTrip?.latitude || '',
    longitude: editTrip?.longitude || '',
    weather: editTrip?.weather || '',
    members: editTrip?.members || '',
    satisfaction: String(editTrip?.satisfaction || ''),
    cost: String(editTrip?.cost || '')
  }))

  const [loading, setLoading] = useState(false)

  /* =========================
      編集データ反映 — 一度に setForm
  ========================= */

  useEffect(() => {
    if (!editTrip) return

    // schedule setForm asynchronously to avoid synchronous setState in effect
    setTimeout(() => {
      setForm({
      title: editTrip.title || '',
      description: editTrip.description || '',
      trip_date: editTrip.trip_date
        ? editTrip.trip_date.replaceAll('/', '-')
        : '',
      latitude: editTrip.latitude || '',
      longitude: editTrip.longitude || '',
      weather: editTrip.weather || '',
      members: editTrip.members || '',
      satisfaction: String(editTrip.satisfaction || ''),
      cost: String(editTrip.cost || '')
      })
    }, 0)
  }, [editTrip])

  /* =========================
      保存
  ========================= */

  const handleSubmit = async () => {

    // 必須チェック
    if (
      !form.title ||
      !form.latitude ||
      !form.longitude ||
      !form.satisfaction
    ) {

      alert('タイトル・位置・満足度は必須です')
      return
    }

    setLoading(true)

    // YYYY-MM-DD → YYYY/MM/DD
    const formattedDate = form.trip_date
      ? form.trip_date.replaceAll('-', '/')
      : null

    /* =====================
        保存データ
    ===================== */

    const payload = {
      title: form.title,
      description: form.description,
      trip_date: formattedDate,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      weather: form.weather,
      members: form.members,
      satisfaction: parseInt(form.satisfaction),
      cost: form.cost ? parseInt(form.cost) : null
    }


    /* =====================
        編集
    ===================== */

    if (editTrip) {
      const result = await supabase
        .from('trips')
        .update(payload)
        .eq('id', editTrip.id)

      setLoading(false)

      if (result.error) {
        console.error(result.error)
        alert('更新失敗')
        return
      }
    }

    /* =====================
        新規追加
    ===================== */

    else {
      const result = await supabase
        .from('trips')
        .insert({ user_id: user.id, ...payload })

      setLoading(false)

      if (result.error) {
        console.error(result.error)
        alert('保存失敗')
        return
      }
    }

    /* =====================
        成功
    ===================== */

    alert(editTrip ? '更新成功！' : '保存成功！')

    // リセット
    setForm({
      title: '',
      description: '',
      trip_date: '',
      latitude: '',
      longitude: '',
      weather: '',
      members: '',
      satisfaction: '',
      cost: ''
    })

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
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      {/* 説明 */}

      <textarea
        className="form-textarea"
        placeholder="説明"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      {/* 日付 */}

      <input
        className="form-input"
        type="date"
        value={form.trip_date}
        onChange={(e) =>
          setForm({ ...form, trip_date: e.target.value })
        }
      />

      {/* 地図 */}

      <div className="map-section">

        <SelectMap
          key={`${form.latitude}-${form.longitude}`}
          mode="select"

          initialLat={form.latitude}
          initialLng={form.longitude}

          onSelect={(lat, lng) => {
            setForm({ ...form, latitude: lat, longitude: lng })
          }}
        />

      </div>

      {/* 緯度 */}

      <input
        className="form-input"
        value={form.latitude}
        placeholder="緯度"
        readOnly
      />

      {/* 経度 */}

      <input
        className="form-input"
        value={form.longitude}
        placeholder="経度"
        readOnly
      />

      {/* 天気 */}

      <select
        className="form-input"
        value={form.weather}
        onChange={(e) =>
          setForm({ ...form, weather: e.target.value })
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
        value={form.members}
        onChange={(e) =>
          setForm({ ...form, members: e.target.value })
        }
      />

      {/* 満足度 */}

      <select
        className="form-input"
        value={form.satisfaction}
        onChange={(e) =>
          setForm({ ...form, satisfaction: e.target.value })
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
        value={form.cost}
        onChange={(e) =>
          setForm({ ...form, cost: e.target.value })
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