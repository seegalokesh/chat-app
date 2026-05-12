export default function Avatar({ username, avatar, size = 40 }) {
  const initials = username?.slice(0, 2).toUpperCase() || '??';
  const colors = ['#7C3AED','#059669','#D97706','#DC2626','#2563EB','#7C3AED'];
  const bg = colors[username?.charCodeAt(0) % colors.length] || '#6B7280';

  if (avatar) {
    return <img src={avatar} alt={username} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 500, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}