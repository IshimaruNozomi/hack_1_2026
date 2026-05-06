import { useState } from 'react'
import { supabase } from './lib/supabase'
import './Login.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      alert(error.message)
    } else {
      onLogin()
    }
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      alert(error.message)
    } else {
      alert('登録成功！ログインしてください')
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