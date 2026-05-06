import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './Login'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'

function DebugPanel({ user, debugMsgs }) {
  return (
    <div style={{ position: 'fixed', right: 10, bottom: 10, zIndex: 9999, width: 360, maxHeight: 300, overflow: 'auto', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: 8, borderRadius: 6, fontSize: 12 }}>
      <div style={{ marginBottom: 6 }}><b>Debug</b> user: {user ? user.email || user.id : 'null'}</div>
      <div style={{ maxHeight: 220, overflow: 'auto' }}>
        {debugMsgs.slice().reverse().map((m, i) => (
          <div key={i} style={{ color: m.level === 'error' ? '#ff6b6b' : m.level === 'warn' ? '#ffb86b' : '#ddd', marginBottom: 4 }}>[{m.ts}] {m.text}</div>
        ))}
      </div>
    </div>
  )
}

function App() {
  // simple in-page debug messages
  const [debugMsgs, setDebugMsgs] = useState([])
  useEffect(() => {
    if (!window.__DEBUG_MESSAGES) window.__DEBUG_MESSAGES = []
    const push = (level, args) => {
      const text = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      window.__DEBUG_MESSAGES.push({ level, text, ts: new Date().toLocaleTimeString() })
      // keep only last 50
      if (window.__DEBUG_MESSAGES.length > 50) window.__DEBUG_MESSAGES.shift()
      setDebugMsgs([...window.__DEBUG_MESSAGES])
    }

    const origLog = console.log
    const origWarn = console.warn
    const origErr = console.error

    console.log = (...args) => {
      origLog(...args)
      push('log', args)
    }
    console.warn = (...args) => {
      origWarn(...args)
      push('warn', args)
    }
    console.error = (...args) => {
      origErr(...args)
      push('error', args)
    }

    return () => {
      console.log = origLog
      console.warn = origWarn
      console.error = origErr
    }
  }, [])
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
        <DebugPanel user={user} debugMsgs={debugMsgs} />
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
        <DebugPanel user={user} debugMsgs={debugMsgs} />
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
      <DebugPanel user={user} debugMsgs={debugMsgs} />
    </>
  )
  
}

export default App