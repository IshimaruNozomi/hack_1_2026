import { useState } from 'react'

export default function Header({ onLogout, setPage }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={styles.header}>
      <h1 style={styles.title}>trip_note</h1>

      {/* ハンバーガー */}
      <div
        style={styles.menu}
        onClick={() => setOpen(!open)}
      >
        ☰
      </div>

      {/* ドロップダウンメニュー */}
      {open && (
        <div style={styles.dropdown}>
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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderBottom: '1px solid #ddd',
    position: 'relative'
  },
  title: {
    margin: 0
  },
  menu: {
    fontSize: '24px',
    cursor: 'pointer'
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: '20px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    zIndex: 1000
  }
}