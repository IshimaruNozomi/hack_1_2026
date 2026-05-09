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
      state
  ========================= */

  const [form, setForm] = useState({
    title: '',
    description: '',
    trip_date: '',
    latitude: '',
    longitude: '',
    weather: '',
    members: '',
    satisfaction: '',
    cost: '',
    image_url: ''
  })

  const [imageFile, setImageFile] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  /* =========================
      編集データ反映
  ========================= */

  useEffect(() => {

    if (!editTrip) return

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

      satisfaction:
        String(editTrip.satisfaction || ''),

      cost:
        String(editTrip.cost || ''),

      image_url:
        editTrip.image_url || ''
    })

  }, [editTrip])

  /* =========================
      保存
  ========================= */

  const handleSubmit = async () => {

    /* 必須 */

    if (
      !user ||
      !user.id
    ) {
      alert('ログインしてください')
      return
    }

    if (
      !form.title ||
      !form.latitude ||
      !form.longitude ||
      !form.satisfaction
    ) {

      alert(
        'タイトル・位置・満足度は必須です'
      )

      return
    }

    setLoading(true)

    /* =========================
        画像アップロード
    ========================= */

    let uploadedImageUrl =
      form.image_url

    if (imageFile) {

      try {

        /* 古い画像削除 */

        if (form.image_url) {

          const oldPath =
            form.image_url
              .split(
                '/object/public/trip-images/'
              )[1]

          if (oldPath) {

            await supabase.storage
              .from('trip-images')
              .remove([oldPath])

          }
        }

        /* 新画像アップロード */

        const fileExt =
          imageFile.name
            .split('.')
            .pop()

        const fileName =
          `${user.id}-${Date.now()}.${fileExt}`

        const filePath =
          `${user.id}/${fileName}`

        const {
          error: uploadError
        } =
          await supabase.storage
            .from('trip-images')
            .upload(
              filePath,
              imageFile,
              {
                upsert: true
              }
            )

        if (uploadError) {

          console.error(uploadError)

          alert('画像アップロード失敗')

          setLoading(false)

          return
        }

        /* 公開URL取得 */

        const { data } =
          supabase.storage
            .from('trip-images')
            .getPublicUrl(filePath)

        uploadedImageUrl =
          data.publicUrl

      } catch (e) {

        console.error(e)

        alert('画像処理失敗')

        setLoading(false)

        return
      }
    }

    /* =========================
        日付変換
    ========================= */

    const formattedDate =
      form.trip_date
        ? form.trip_date.replaceAll('-', '/')
        : null

    /* =========================
        保存データ
    ========================= */

    const payload = {

      title:
        form.title,

      description:
        form.description,

      trip_date:
        formattedDate,

      latitude:
        parseFloat(form.latitude),

      longitude:
        parseFloat(form.longitude),

      weather:
        form.weather,

      members:
        form.members,

      satisfaction:
        parseInt(form.satisfaction),

      cost:
        form.cost
          ? parseInt(form.cost)
          : null,

      image_url:
        uploadedImageUrl
    }

    /* =========================
        編集
    ========================= */

    if (editTrip) {

      const {
        error
      } =
        await supabase
          .from('trips')
          .update(payload)
          .eq('id', editTrip.id)

      setLoading(false)

      if (error) {

        console.error(error)

        alert('更新失敗')

        return
      }
    }

    /* =========================
        新規追加
    ========================= */

    else {

      const {
        error
      } =
        await supabase
          .from('trips')
          .insert({
            user_id: user.id,
            ...payload
          })

      setLoading(false)

      if (error) {

        console.error(error)

        alert('保存失敗')

        return
      }
    }

    /* =========================
        成功
    ========================= */

    alert(
      editTrip
        ? '更新成功！'
        : '保存成功！'
    )

    setForm({
      title: '',
      description: '',
      trip_date: '',
      latitude: '',
      longitude: '',
      weather: '',
      members: '',
      satisfaction: '',
      cost: '',
      image_url: ''
    })

    setImageFile(null)

    if (
      typeof onSaved === 'function'
    ) {
      onSaved()
    }

    if (
      typeof onClose === 'function'
    ) {
      onClose()
    }
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

      {/* タイトル */}

      <input
        className="form-input"
        placeholder="タイトル（例：京都旅行）"
        value={form.title}
        onChange={(e) =>
          setForm({
            ...form,
            title: e.target.value
          })
        }
      />

      {/* 説明 */}

      <textarea
        className="form-textarea"
        placeholder="説明"
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value
          })
        }
      />

      {/* 日付 */}

      <input
        className="form-input"
        type="date"
        value={form.trip_date}
        onChange={(e) =>
          setForm({
            ...form,
            trip_date: e.target.value
          })
        }
      />

      {/* 地図 */}

      <div className="map-section">

        <SelectMap
          key={
            `${form.latitude}-${form.longitude}`
          }

          mode="select"

          initialLat={form.latitude}
          initialLng={form.longitude}

          onSelect={(lat, lng) => {

            setForm({
              ...form,
              latitude: lat,
              longitude: lng
            })

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

      {/* 画像 */}

      <div>

        <div
          style={{
            marginBottom: '8px',
            fontWeight: 'bold'
          }}
        >
          画像
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {

            if (
              e.target.files &&
              e.target.files[0]
            ) {

              setImageFile(
                e.target.files[0]
              )

            }

          }}
        />

      </div>

      {/* 画像プレビュー */}

      {(imageFile || form.image_url) && (

        <img
          src={
            imageFile
              ? URL.createObjectURL(imageFile)
              : form.image_url
          }
          alt="trip"
          style={{
            width: '100%',
            marginTop: '10px',
            borderRadius: '12px',
            maxHeight: '300px',
            objectFit: 'cover'
          }}
        />

      )}

      {/* 天気 */}

      <div className="form-radio-group">

        <div className="form-radio-label">
          天気
        </div>

        {[
          '快晴',
          '晴れ',
          '曇り',
          '雨'
        ].map((w) => (

          <label
            key={w}
            className="form-radio-item"
          >

            <input
              type="radio"
              name="weather"
              value={w}
              checked={
                form.weather === w
              }
              onChange={() =>
                setForm({
                  ...form,
                  weather: w
                })
              }
            />

            <span>{w}</span>

          </label>

        ))}

      </div>

      {/* メンバー */}

      <input
        className="form-input"
        placeholder="メンバー"
        value={form.members}
        onChange={(e) =>
          setForm({
            ...form,
            members: e.target.value
          })
        }
      />

      {/* 満足度 */}

      <div className="form-radio-group">

        <div className="form-radio-label">
          満足度（必須）
        </div>

        {[1, 2, 3, 4, 5]
          .map((n) => (

          <label
            key={n}
            className="form-radio-item"
          >

            <input
              type="radio"
              name="satisfaction"
              value={String(n)}
              checked={
                String(form.satisfaction)
                ===
                String(n)
              }
              onChange={() =>
                setForm({
                  ...form,
                  satisfaction: String(n)
                })
              }
            />

            <span>{n}</span>

          </label>

        ))}

      </div>

      {/* 費用 */}

      <input
        className="form-input"
        placeholder="費用"
        value={form.cost}
        onChange={(e) =>
          setForm({
            ...form,
            cost: e.target.value
          })
        }
      />

      {/* 保存 */}

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