import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilePage({ user, setPage }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isEditOpen, setIsEditOpen] = useState(false)

  const [form, setForm] = useState({
    username: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)

  // マウント状態を追跡してアンマウント後の setState を防ぐ
  const isMountedRef = useRef(true)

  const fetchProfile = useCallback(async () => {
    if (!user || !user.id) {
      // user 情報が無ければロードを解除して待つ
      if (isMountedRef.current) setLoading(false)
      return
    }
    console.debug('ProfilePage: fetchProfile start', { user })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('fetchProfile error', error)
      } else if (isMountedRef.current) {
        setProfile(data)
        console.debug('ProfilePage: fetched profile', { data })

        // フォーム初期化
        setForm({
          username: data?.username || '',
          bio: data?.bio || ''
        })
      }
    } catch (err) {
      console.error('fetchProfile failed', err)
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // マウント時および user 変更時に取得
  console.debug('ProfilePage: useEffect firing', { user })
    ;(async () => {
      await fetchProfile()
    })()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchProfile, user])

  const handleSave = async () => {
    if (!user || !user.id) {
      alert('ユーザーが見つかりません')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: form.username,
          bio: form.bio
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('update profile error', error)
        alert('プロフィールの保存に失敗しました')
        return
      }

      // supabase の update(...).select() は配列を返すことがあるため対応
      const updated = Array.isArray(data) ? data[0] : data

      if (isMountedRef.current) {
        // DB の返り値を使って画面を正確に更新
        setProfile((prev) => ({
          ...prev,
          username: updated?.username ?? form.username,
          bio: updated?.bio ?? form.bio
        }))

        setIsEditOpen(false)
      }
    } catch (err) {
      console.error('handleSave failed', err)
      alert('保存中にエラーが発生しました')
    } finally {
      if (isMountedRef.current) setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (!profile) {
    return <div>プロフィールが見つかりません</div>
  }

  return (
    <div style={styles.container}>
      <h2>プロフィール</h2>

      {/* プロフィール表示 */}
      <div style={styles.card}>
        <p><b>名前：</b> {profile.username || '未設定'}</p>
        <p><b>自己紹介：</b></p>
        <p>{profile.bio || 'まだ登録されていません'}</p>
      </div>

      {/* ボタン */}
      <button onClick={() => setIsEditOpen(true)}>
        編集する
      </button>

      <button onClick={() => setPage('main')}>
        戻る
      </button>

      {/* モーダル */}
      {isEditOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>プロフィール編集</h3>

            <input
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="名前"
              style={styles.input}
            />

            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
              placeholder="自己紹介"
              style={styles.textarea}
            />

            <div style={styles.buttonRow}>
              <button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>

              <button onClick={() => setIsEditOpen(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '20px'
  },

  card: {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px'
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  modal: {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '320px'
  },

  input: {
    width: '100%',
    marginBottom: '10px',
    padding: '8px'
  },

  textarea: {
    width: '100%',
    height: '100px',
    padding: '8px',
    marginBottom: '10px'
  },

  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}