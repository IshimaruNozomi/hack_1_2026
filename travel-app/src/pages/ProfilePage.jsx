import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfilePage({ user, setPage }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  // 編集機能は不要なので削除。表示専用にする。

  // マウント状態を追跡してアンマウント後の setState を防ぐ
  const isMountedRef = useRef(true)
  const isFetchingRef = useRef(false)
  const loadingTimeoutRef = useRef(null)

  const fetchProfile = useCallback(async () => {
    if (!user || !user.id) {
      // user 情報が無ければロードを解除して待つ
      if (isMountedRef.current) setLoading(false)
      return
    }
    if (isFetchingRef.current) {
      console.debug('ProfilePage: fetchProfile already running - skip')
      return
    }
    isFetchingRef.current = true
    console.log('ProfilePage: fetchProfile start', { user })
    try {
      // maybeSingle を使うとレコードが無くても error にならない
      const selectPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      const { data, error } = await Promise.race([
        selectPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('select timeout')), 7000))
      ])

      if (error) {
        console.error('fetchProfile error', error)
        if (isMountedRef.current) setFetchError(error.message || String(error))
      }

      if (isMountedRef.current) {
        if (data) {
          setProfile(data)
          setFetchError(null)
          console.log('ProfilePage: fetched profile', { data })
        } else {
          // プロフィールが存在しない場合、自動で初期レコードを作成して表示する
          const defaultName = (user.email || '').split('@')[0] || null
          const insertPromise = supabase
            .from('profiles')
            .insert({ id: user.id, username: defaultName, bio: '' })
            .select()
            .maybeSingle()
          const { data: inserted, error: insertErr } = await Promise.race([
            insertPromise,
            new Promise((_, rej) => setTimeout(() => rej(new Error('insert timeout')), 7000))
          ])

          if (insertErr) {
            console.error('failed to insert default profile', insertErr)
            setFetchError(insertErr.message || String(insertErr))
            // 作成に失敗したら最低限表示できる値を入れておく
            setProfile({ username: defaultName, bio: '' })
          } else {
            setProfile(inserted || { username: defaultName, bio: '' })
            setFetchError(null)
            console.log('ProfilePage: created default profile', { inserted })
          }
        }
      }
    } catch (err) {
      console.error('fetchProfile failed', err)
      if (isMountedRef.current) {
        setFetchError(err.message || String(err))
        // エラー時でも UI を停止させ、最低限の表示を行う
        setProfile({ username: user?.email || '未設定', bio: '' })
      }
    } finally {
      isFetchingRef.current = false
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

  // safety: if loading stays true for too long, force it false so UI doesn't block forever
  useEffect(() => {
    if (loading) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('ProfilePage: loading timeout, forcing loading=false')
          setLoading(false)
        }
      }, 5000)
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [loading])

  // 編集・保存機能は削除済み
  // ページ全体をローディングで置き換えず、まずはユーザー情報（email など）を先に表示する。
  const displayName = profile?.username || user?.email || '未設定'

  const handleRefetch = async () => {
    if (isMountedRef.current) {
      setLoading(true)
      setFetchError(null)
      await fetchProfile()
    }
  }

  return (
    <div style={styles.container}>
      <h2>プロフィール</h2>

      {/* プロフィール表示（読み取り専用） */}
      <div style={styles.card}>
        <p><b>名前：</b> {loading && !profile ? '読み込み中...' : displayName}</p>
        <p><b>自己紹介：</b></p>
        <p>{loading && !profile ? '読み込み中...' : (profile?.bio || 'まだ登録されていません')}</p>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setPage('main')}>戻る</button>
        <button onClick={handleRefetch} style={{ marginLeft: 8 }}>再取得</button>
      </div>

      {fetchError && (
        <div style={{ marginTop: 12, padding: 10, border: '1px solid #f3c', background: '#fff0' }}>
          <div><b>プロフィール取得エラー</b></div>
          <div>{String(fetchError)}</div>
          <div style={{ marginTop: 8 }}><button onClick={handleRefetch}>再取得</button></div>
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