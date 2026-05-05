import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './Login'
import MainPage from './pages/MainPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 初回：ログイン状態チェック
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error('getUser error:', error)
      }

      setUser(data?.user ?? null)
      setLoading(false)
    }

    checkUser()
  }, [])

  // ログイン状態の変化を監視
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('auth event:', event)
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ローディング中
  if (loading) {
    return <div>Loading...</div>
  }

  // 未ログイン
  if (!user) {
    return <Login />
  }

  // ログイン後（メイン画面）
  return <MainPage user={user} onLogout={handleLogout} />
}

export default App