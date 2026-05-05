import { useState } from 'react'
import { supabase } from './lib/supabase'

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
    <div>
      <h2>ログイン</h2>
      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>ログイン</button>
      <button onClick={handleSignup}>新規登録</button>
    </div>
  )
}