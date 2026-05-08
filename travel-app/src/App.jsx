import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './Login'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'

// DebugPanel removed — production-ready app should not show in-page debug overlay

function App() {
  // debug overlay removed
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('main') // ← 画面管理

  // 初回ログイン状態チェック
  // ユーザー取得処理（再利用のため名前を付ける）
  const fetchUser = async () => {
    try {
      // Use getSession to check for an existing session. getUser throws
      // AuthSessionMissingError when no session exists which is noisy.
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        // If there's an error that's not 'AuthSessionMissingError', log it.
        console.error('getSession error:', error)
      }

      const session = data?.session ?? null
      if (!session) {
        // no session -> not logged in
        setUser(null)
      } else {
        setUser(session.user ?? null)
      }
    } catch (err) {
      console.error('fetchUser failed', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await fetchUser()
    })()
  }, [])

  // ログイン状態変化を監視
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ログアウト
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPage('main')
  }

  // ローディング中
  if (loading) {
    return <div>Loading...</div>
  }

  // debug overlay will be rendered below

  // 未ログイン
  if (!user) {
    return (
      <>
        <Login onLogin={fetchUser} />
      </>
    )
  }

  // ページ切り替え
  if (page === 'profile') {
    return (
      <>
        <ProfilePage
          user={user}
          setPage={setPage}
        />
      </>
    )
  }

  // メインページ
  return (
    <>
      <MainPage
        user={user}
        onLogout={handleLogout}
        setPage={setPage}
      />
    </>
  )
  
}

export default App