import { DAYS, SHIFT_COLORS, fmt } from '../lib/utils'

export default function AvailabilityTab({ employees, shiftTypes, availability, onPreview }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Employee Availability</div>
      <div className="info-bar">
        Employees log in and mark their own availability. Preview their form below.
      </div>

      {/* Summary table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Employee</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding: '8px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>{d}</th>
              ))}
              <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500 }}>{emp.name}</td>
                {DAYS.map(d => {
                  const dayShifts = shiftTypes.filter(s => availability[emp.id]?.[d]?.[s.id]?.on)
                  return (
                    <td key={d} style={{ padding: '6px 4px', textAlign: 'center' }}>
                      {dayShifts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                          {dayShifts.map((s, i) => {
                            const c = SHIFT_COLORS[shiftTypes.findIndex(x => x.id === s.id) % SHIFT_COLORS.length]
                            const avail = availability[emp.id]?.[d]?.[s.id]
                            return (
                              <div key={s.id} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
                                {s.name} {avail?.preferred_start ? fmt(avail.preferred_start) : ''}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#D1D5DB' }}>—</span>
                      )}
                    </td>
                  )
                })}
                <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => onPreview(emp.id)}>Preview</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
