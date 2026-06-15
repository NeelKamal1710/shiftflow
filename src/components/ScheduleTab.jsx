import { useState } from 'react'
import { DAYS, SHIFT_COLORS, fmt, getWeekDates, formatDate } from '../lib/utils'

function AssignModal({ day, shiftType, employees, availability, existing, onSave, onClose }) {
  const [empId, setEmpId] = useState(existing?.employee_id || '')
  const [start, setStart] = useState(existing?.actual_start || shiftType.start_time)
  const [end, setEnd] = useState(existing?.actual_end || shiftType.end_time)

  const availEmps = employees.filter(emp => {
    const a = availability[emp.id]?.[day]?.[shiftType.id]
    return a?.on
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Assign {shiftType.name} — {day}</div>
        <div style={{ marginBottom: 12 }}>
          <label>Employee</label>
          <select className="sel" style={{ width: '100%', padding: '8px 10px' }} value={empId} onChange={e => {
            setEmpId(e.target.value)
            const emp = employees.find(x => x.id === e.target.value)
            if (emp) {
              const avail = availability[emp.id]?.[day]?.[shiftType.id]
              if (avail?.preferred_start) setStart(avail.preferred_start)
              if (avail?.preferred_end) setEnd(avail.preferred_end)
            }
          }}>
            <option value="">-- Select employee --</option>
            {availEmps.length > 0 && <optgroup label="✅ Available">
              {availEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </optgroup>}
            <optgroup label="All employees">
              {employees.filter(e => !availEmps.find(a => a.id === e.id)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </optgroup>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Start time</label>
            <input type="time" className="inp" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>End time</label>
            <input type="time" className="inp" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          {existing && <button className="btn btn-danger btn-sm" onClick={() => onSave(null)}>Remove</button>}
          <button className="btn btn-primary btn-sm" onClick={() => empId && onSave({ empId, start, end })} disabled={!empId}>
            {existing ? 'Update' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

function autoGenerate(employees, shiftTypes, availability, weekStart) {
  const generated = []
  const assignedDays = {} // empId -> Set of days
  employees.forEach(e => assignedDays[e.id] = new Set())
  const shiftCount = {} // empId -> count
  employees.forEach(e => shiftCount[e.id] = 0)

  DAYS.forEach(day => {
    shiftTypes.forEach(shift => {
      // Get available employees for this day+shift, not already assigned today
      const avail = employees.filter(emp => {
        const a = availability[emp.id]?.[day]?.[shift.id]
        return a?.on && !assignedDays[emp.id].has(day)
      })
      // Sort by least assigned first (fairness)
      avail.sort((a, b) => shiftCount[a.id] - shiftCount[b.id])
      // Assign up to 3 per slot
      avail.slice(0, 3).forEach(emp => {
        const a = availability[emp.id]?.[day]?.[shift.id]
        generated.push({
          employee_id: emp.id,
          day,
          shift_type_id: shift.id,
          actual_start: a?.preferred_start || shift.start_time,
          actual_end: a?.preferred_end || shift.end_time,
          week_start: weekStart
        })
        assignedDays[emp.id].add(day)
        shiftCount[emp.id]++
      })
    })
  })
  return generated
}

export default function ScheduleTab({ employees, shiftTypes, availability, assignments, weekStart, onWeekChange, onAssign, onRemove, onAutoGenerate }) {
  const [modal, setModal] = useState(null)
  const [generating, setGenerating] = useState(false)
  const weekDates = getWeekDates(weekStart)
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]))

  const getAssignments = (day, shiftTypeId) =>
    assignments.filter(a => a.day === day && a.shift_type_id === shiftTypeId)

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); onWeekChange(d.toISOString().split('T')[0]) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); onWeekChange(d.toISOString().split('T')[0]) }

  const handleAutoGen = async () => {
    if (!window.confirm('This will clear existing schedule for this week and auto-generate. Continue?')) return
    setGenerating(true)
    const generated = autoGenerate(employees, shiftTypes, availability, weekStart)
    await onAutoGenerate(generated)
    setGenerating(false)
  }

  const handleSave = (modal, result) => {
    if (!result) onRemove(modal.existing?.id)
    else onAssign({ day: modal.day, shiftTypeId: modal.shiftType.id, empId: result.empId, start: result.start, end: result.end, existingId: modal.existing?.id })
    setModal(null)
  }

  const totalNeeded = DAYS.length * shiftTypes.length
  const totalFilled = assignments.length
  const uniqueEmps = new Set(assignments.map(a => a.employee_id)).size

  return (
    <div>
      {/* Stats */}
      <div className="stat-grid">
        <div className="stat"><div className="stat-num">{totalFilled}</div><div className="stat-lbl">Shifts assigned</div></div>
        <div className="stat"><div className="stat-num" style={{ color: totalFilled < totalNeeded ? '#DC2626' : '#16A34A' }}>{totalNeeded - totalFilled}</div><div className="stat-lbl">Unfilled</div></div>
        <div className="stat"><div className="stat-num">{uniqueEmps}</div><div className="stat-lbl">Employees scheduled</div></div>
        <div className="stat"><div className="stat-num">{Math.round(totalFilled / Math.max(totalNeeded, 1) * 100)}%</div><div className="stat-lbl">Coverage</div></div>
      </div>

      {/* Week nav + Auto generate */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div className="week-nav" style={{ margin: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={prevWeek}>← Prev</button>
          <span className="week-label">Week of {formatDate(weekStart)} – {formatDate(weekDates[6])}</span>
          <button className="btn btn-secondary btn-sm" onClick={nextWeek}>Next →</button>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAutoGen}
          disabled={generating}
          style={{ background: '#16A34A' }}
        >
          {generating ? '⏳ Generating...' : '⚡ Auto Generate Schedule'}
        </button>
      </div>

      {assignments.length === 0 && (
        <div className="info-bar">
          No schedule yet for this week. Click <strong>⚡ Auto Generate Schedule</strong> to build it from employee availability, or add shifts manually.
        </div>
      )}

      {/* Day-by-day schedule */}
      {DAYS.map((day, di) => {
        const date = weekDates[di]
        const dayAssignments = assignments.filter(a => a.day === day)

        return (
          <div key={day} className="day-section">
            <div className="day-header">
              <span className="day-header-title">{day} &nbsp; {formatDate(date)}</span>
              <span className="day-header-date">{dayAssignments.length} shifts assigned</span>
            </div>

            <div className="shift-columns" style={{ gridTemplateColumns: `repeat(${Math.max(shiftTypes.length, 1)}, 1fr)`, background: '#fff' }}>
              {shiftTypes.map((shift, si) => {
                const c = SHIFT_COLORS[si % SHIFT_COLORS.length]
                const slotAssignments = getAssignments(day, shift.id)

                return (
                  <div key={shift.id} className="shift-col">
                    <div className="shift-col-header" style={{ background: c.bg, color: c.text }}>
                      {shift.name}
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8 }}>{fmt(shift.start_time)}–{fmt(shift.end_time)}</div>
                    </div>

                    {slotAssignments.map(asgn => {
                      const emp = empMap[asgn.employee_id]
                      return (
                        <div key={asgn.id} className="shift-slot" style={{ background: c.bg + '44' }}>
                          <div>
                            <div className="emp-name" style={{ color: c.text }}>{emp?.name || '?'}</div>
                            <div className="emp-time">{fmt(asgn.actual_start)} – {fmt(asgn.actual_end)}</div>
                          </div>
                          <button className="btn-ghost btn-sm no-print" style={{ color: '#9CA3AF', padding: '2px 6px' }}
                            onClick={() => setModal({ day, shiftType: shift, existing: asgn })}>✎</button>
                        </div>
                      )
                    })}

                    <div className="empty-slot no-print">
                      <button className="add-slot-btn" onClick={() => setModal({ day, shiftType: shift, existing: null })}>
                        + Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {modal && (
        <AssignModal
          day={modal.day} shiftType={modal.shiftType}
          employees={employees} availability={availability}
          existing={modal.existing}
          onSave={(result) => handleSave(modal, result)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
