import { useState } from 'react'
import { supabase } from './lib/supabase'
import './Login.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')

  const handleLogin = async () => {
    console.log('Login: button clicked', { email })
    setErrorMsg('')
    setInfoMsg('サインイン中...')
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password
      })
      console.log('Login: signInWithPassword result', res)

      if (res.error) {
        setErrorMsg(res.error.message)
        setInfoMsg('')
      } else {
        setInfoMsg('ログイン成功')
        console.log('Login: login success, calling onLogin')
        if (typeof onLogin === 'function') onLogin()
      }
    } catch (err) {
      console.error('Login: signIn failed', err)
      setErrorMsg(String(err))
      setInfoMsg('')
    }
  }

  const handleSignup = async () => {
    setErrorMsg('')
    setInfoMsg('登録中...')
    try {
      const res = await supabase.auth.signUp({
        email,
        password
      })
      console.log('Login: signUp result', res)
      if (res.error) {
        setErrorMsg(res.error.message)
        setInfoMsg('')
      } else {
        setInfoMsg('登録成功！ログインしてください')
      }
    } catch (err) {
      console.error('Login: signUp failed', err)
      setErrorMsg(String(err))
      setInfoMsg('')
    }
  }

  return (

    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Travel Log</h2>

        <input
          className="login-input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          ログイン
        </button>

        <button className="signup-btn" onClick={handleSignup}>
          新規登録
        </button>
      </div>

    </div>
  )
}