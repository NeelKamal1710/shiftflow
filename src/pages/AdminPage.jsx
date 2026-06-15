import { useState } from 'react'
import ScheduleTab from '../components/ScheduleTab'
import ShiftTypesTab from '../components/ShiftTypesTab'
import TeamTab from '../components/TeamTab'
import AvailabilityTab from '../components/AvailabilityTab'
import EmployeePage from './EmployeePage'

export default function AdminPage({
  employees, shiftTypes, availability, assignments,
  weekStart, onWeekChange,
  onLogout, onAddEmployee, onRemoveEmployee,
  onAddShiftType, onRemoveShiftType,
  onAssign, onRemoveAssignment, onAutoGenerate,
  onToggleAvailability, onUpdateTime, onSetPin,
  toast
}) {
  const [tab, setTab] = useState('schedule')
  const [previewEmpId, setPreviewEmpId] = useState(null)

  const TABS = [
    { id: 'schedule', label: '📅 Schedule' },
    { id: 'availability', label: '✅ Availability' },
    { id: 'shifts', label: '⏰ Shift Types' },
    { id: 'team', label: '👥 Team' },
  ]

  if (previewEmpId) {
    const emp = employees.find(e => e.id === previewEmpId)
    return (
      <div>
        <EmployeePage
          employee={emp} shiftTypes={shiftTypes}
          availability={availability[emp.id] ? { ...Object.fromEntries(Object.entries(availability[emp.id]).map(([d, v]) => [d, v])) } : {}}
          onToggle={(d, sId, val) => onToggleAvailability(emp.id, d, sId, val)}
          onUpdateTime={(d, sId, type, val) => onUpdateTime(emp.id, d, sId, type, val)}
          onLogout={() => setPreviewEmpId(null)} saving={false}
        />
        <div style={{ textAlign: 'center', padding: '8px', background: '#FEF9C3', fontSize: 12, color: '#854D0E' }}>
          Admin preview — changes save to database
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="hdr">
        <div className="logo">
          <div className="logo-icon">S</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="logo-title">ShiftFlow</span>
              <span className="tag tag-admin">Admin</span>
            </div>
            <div className="logo-sub">{employees.length} employees · {shiftTypes.length} shift types</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="body">
        {tab === 'schedule' && (
          <ScheduleTab
            employees={employees} shiftTypes={shiftTypes} availability={availability}
            assignments={assignments} weekStart={weekStart} onWeekChange={onWeekChange}
            onAssign={onAssign} onRemove={onRemoveAssignment} onAutoGenerate={onAutoGenerate}
          />
        )}
        {tab === 'availability' && (
          <AvailabilityTab
            employees={employees} shiftTypes={shiftTypes} availability={availability}
            onPreview={setPreviewEmpId}
          />
        )}
        {tab === 'shifts' && (
          <ShiftTypesTab shiftTypes={shiftTypes} onAdd={onAddShiftType} onRemove={onRemoveShiftType} />
        )}
        {tab === 'team' && (
          <TeamTab
            employees={employees} shiftTypes={shiftTypes} availability={availability}
            onAdd={onAddEmployee} onRemove={onRemoveEmployee} onSetPin={onSetPin}
          />
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
