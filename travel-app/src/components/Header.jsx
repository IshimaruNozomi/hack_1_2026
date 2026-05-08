import { useState } from 'react'
import './Header.css'

export default function Header({ onLogout, setPage }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="header">
      <h1 className="header-title">てのひら列島</h1>

      {/* ハンバーガー */}
      <div
        className="header-menu"
        onClick={() => setOpen(!open)}
      >
        ☰
      </div>

      {/* ドロップダウン */}
      {open && (
        <div className="header-dropdown">
          <button onClick={() => setPage('profile')}>
            プロフィール
          </button>

          <button onClick={onLogout}>
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}