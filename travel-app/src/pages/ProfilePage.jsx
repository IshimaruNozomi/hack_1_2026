import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilePage({ user, setPage }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // 編集機能は不要なので削除。表示専用にする。

  // マウント状態を追跡してアンマウント後の setState を防ぐ
  const isMountedRef = useRef(true)

  const fetchProfile = useCallback(async () => {
    if (!user || !user.id) {
      // user 情報が無ければロードを解除して待つ
      if (isMountedRef.current) setLoading(false)
      return
    }
    console.log('ProfilePage: fetchProfile start', { user })
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
        console.log('ProfilePage: fetched profile', { data })

        // 表示データは profile に入れるだけ（読み取り専用）
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

  // 編集・保存機能は削除済み
  // ページ全体をローディングで置き換えず、まずはユーザー情報（email など）を先に表示する。
  const displayName = profile?.username || user?.email || '未設定'

  return (
    <div style={styles.container}>
      <h2>プロフィール</h2>

      {/* プロフィール表示（読み取り専用） */}
      <div style={styles.card}>
        <p><b>名前：</b> {loading && !profile ? '読み込み中...' : displayName}</p>
        <p><b>自己紹介：</b></p>
        <p>{loading && !profile ? '読み込み中...' : (profile?.bio || 'まだ登録されていません')}</p>
      </div>

      <button onClick={() => setPage('main')}>
        戻る
      </button>
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