export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export const SHIFT_COLORS = [
  { bg: '#FEF9C3', text: '#92400E', border: '#FDE68A' },
  { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
  { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
]

export function fmt(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}${m && m !== '00' ? ':' + m : ''}${ampm}`
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getWeekDates(weekStart) {
  const dates = []
  const start = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

export function genToken(name) {
  return name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
}
