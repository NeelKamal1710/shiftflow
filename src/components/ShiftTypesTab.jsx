import { useState } from 'react'
import { SHIFT_COLORS, fmt } from '../lib/utils'

export default function ShiftTypesTab({ shiftTypes, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [start, setStart] = useState('06:00')
  const [end, setEnd] = useState('14:00')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim(), start, end)
    setName('')
    setStart('06:00')
    setEnd('14:00')
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Shift Types</div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add new shift type</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Name</label>
            <input className="inp" placeholder="e.g. Morning, Evening..." value={name}
              onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div>
            <label>Default start</label>
            <input type="time" className="inp" style={{ width: 130 }} value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label>Default end</label>
            <input type="time" className="inp" style={{ width: 130 }} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>+ Add</button>
        </div>
      </div>

      {shiftTypes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 13 }}>No shift types yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shiftTypes.map((s, i) => {
          const c = SHIFT_COLORS[i % SHIFT_COLORS.length]
          return (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.text }} />
                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>
                  {s.name}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{fmt(s.start_time)} – {fmt(s.end_time)}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(s.id)}>🗑 Remove</button>
            </div>
          )
        })}
      </div>

      <div className="warn-bar" style={{ marginTop: 14 }}>
        ⚠️ Default times are used as suggestions. Employees can set their own preferred times.
      </div>
    </div>
  )
}
