import { useState } from 'react'
import { DAYS, SHIFT_COLORS } from '../lib/utils'

export default function TeamTab({ employees, shiftTypes, availability, onAdd, onRemove, onSetPin }) {
  const [name, setName] = useState('')
  const [pins, setPins] = useState({})

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Team</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="inp" placeholder="New employee name..." value={name}
          onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={handleAdd}>+ Add</button>
      </div>

      {employees.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>No employees yet.</div>
      )}

      {employees.map(emp => {
        const filledDays = DAYS.filter(d => shiftTypes.some(s => availability[emp.id]?.[d]?.[s.id]?.on))
        const filled = DAYS.reduce((a, d) => a + shiftTypes.filter(s => availability[emp.id]?.[d]?.[s.id]?.on).length, 0)
        const total = DAYS.length * shiftTypes.length
        const pct = Math.round(filled / Math.max(total, 1) * 100)

        return (
          <div key={emp.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{emp.name}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>{filled} slots · {filledDays.length} days</span>
                {emp.pin
                  ? <span style={{ marginLeft: 8, fontSize: 11, padding: '1px 7px', borderRadius: 99, background: '#D1FAE5', color: '#065F46' }}>PIN set ✓</span>
                  : <span style={{ marginLeft: 8, fontSize: 11, padding: '1px 7px', borderRadius: 99, background: '#FEE2E2', color: '#DC2626' }}>No PIN</span>
                }
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(emp.id)}>🗑 Remove</button>
            </div>

            <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>

            {/* PIN set/reset */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="text" inputMode="numeric" maxLength={6}
                className="inp" style={{ width: 120 }}
                placeholder="Set PIN (4-6 digits)"
                value={pins[emp.id] || ''}
                onChange={e => setPins(prev => ({ ...prev, [emp.id]: e.target.value.replace(/\D/g, '') }))}
              />
              <button className="btn btn-secondary btn-sm"
                onClick={() => { if (pins[emp.id]?.length >= 4) { onSetPin(emp.id, pins[emp.id]); setPins(prev => ({ ...prev, [emp.id]: '' })) } }}>
                {emp.pin ? '🔄 Reset PIN' : '🔑 Set PIN'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
