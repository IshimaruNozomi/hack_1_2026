export default function Header() {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>trip_note</h1>
      <div style={styles.menu}>☰</div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderBottom: '1px solid #ddd'
  },
  title: {
    margin: 0
  },
  menu: {
    fontSize: '24px',
    cursor: 'pointer'
  }
}