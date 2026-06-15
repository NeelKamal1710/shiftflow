import { useState } from 'react'
import { DAYS, SHIFT_COLORS, fmt } from '../lib/utils'

export default function EmployeePage({ employee, shiftTypes, availability, onToggle, onUpdateTime, onLogout, saving }) {
  const totalSlots = DAYS.length * shiftTypes.length
  const filledCount = DAYS.reduce((a, d) =>
    a + shiftTypes.filter(s => availability[d]?.[s.id]?.on).length, 0)
  const pct = Math.round(filledCount / Math.max(totalSlots, 1) * 100)

  return (
    <div className="app">
      <div className="hdr">
        <div className="logo">
          <div className="logo-icon">S</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="logo-title">ShiftFlow</span>
              <span className="tag tag-emp">Employee</span>
            </div>
            <div className="logo-sub">{employee.name}'s availability</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span style={{ fontSize: 11, color: '#6B7280' }}>Saving...</span>}
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="body">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Hi, {employee.name}!</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            Mark your availability for each day and shift. You can also set your preferred start/end times.
          </div>
        </div>

        {/* Progress */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Availability filled</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{filledCount}/{totalSlots}</span>
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        {/* Shift legend */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {shiftTypes.map((s, i) => {
            const c = SHIFT_COLORS[i % SHIFT_COLORS.length]
            return (
              <span key={s.id} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text }}>
                {s.name} {fmt(s.start_time)}–{fmt(s.end_time)}
              </span>
            )
          })}
        </div>

        {/* Availability per day */}
        {DAYS.map(day => (
          <div key={day} className="card" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>{day}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {shiftTypes.map((s, i) => {
                const c = SHIFT_COLORS[i % SHIFT_COLORS.length]
                const avail = availability[day]?.[s.id]
                const isOn = avail?.on || false
                const prefStart = avail?.preferred_start || s.start_time
                const prefEnd = avail?.preferred_end || s.end_time

                return (
                  <div key={s.id} style={{
                    border: `2px solid ${isOn ? c.border : '#E5E7EB'}`,
                    borderRadius: 10, padding: '10px 12px', minWidth: 140,
                    background: isOn ? c.bg : '#F9FAFB', transition: 'all 0.15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isOn ? 10 : 0 }}>
                      <button
                        onClick={() => onToggle(day, s.id, !isOn)}
                        style={{
                          width: 20, height: 20, borderRadius: 4, border: `2px solid ${isOn ? c.text : '#D1D5DB'}`,
                          background: isOn ? c.text : '#fff', cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11
                        }}
                      >
                        {isOn ? '✓' : ''}
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isOn ? c.text : '#6B7280' }}>{s.name}</span>
                    </div>

                    {isOn && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 2 }}>Start</div>
                          <input type="time" className="avail-time-inp" style={{ width: '100%' }}
                            value={prefStart}
                            onChange={e => onUpdateTime(day, s.id, 'start', e.target.value)} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 2 }}>End</div>
                          <input type="time" className="avail-time-inp" style={{ width: '100%' }}
                            value={prefEnd}
                            onChange={e => onUpdateTime(day, s.id, 'end', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 10, padding: '8px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11, color: '#9CA3AF' }}>
          Your availability is saved automatically. Manager will finalize the schedule.
        </div>
      </div>
    </div>
  )
}
