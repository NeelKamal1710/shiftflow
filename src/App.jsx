import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { genToken, getWeekStart } from './lib/utils'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import EmployeePage from './pages/EmployeePage'
import './index.css'

export default function App() {
  const [view, setView] = useState('login')
  const [currentEmp, setCurrentEmp] = useState(null)
  const [employees, setEmployees] = useState([])
  const [shiftTypes, setShiftTypes] = useState([])
  const [availability, setAvailability] = useState({}) // { empId: { day: { shiftTypeId: { on, preferred_start, preferred_end } } } }
  const [assignments, setAssignments] = useState([])
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [empRes, stRes, avRes, asgnRes] = await Promise.all([
        supabase.from('employees').select('*').order('name'),
        supabase.from('shift_types').select('*').order('start_time'),
        supabase.from('availability').select('*'),
        supabase.from('schedule_assignments').select('*').eq('week_start', weekStart),
      ])
      if (empRes.error) throw empRes.error
      if (stRes.error) throw stRes.error

      setEmployees(empRes.data || [])
      setShiftTypes(stRes.data || [])
      setAssignments(asgnRes.data || [])

      // Build availability map: { empId: { day: { shiftTypeId: { on, preferred_start, preferred_end } } } }
      const avMap = {}
      ;(avRes.data || []).forEach(row => {
        if (!avMap[row.employee_id]) avMap[row.employee_id] = {}
        if (!avMap[row.employee_id][row.day]) avMap[row.employee_id][row.day] = {}
        avMap[row.employee_id][row.day][row.shift_type_id] = {
          on: true,
          preferred_start: row.preferred_start,
          preferred_end: row.preferred_end,
          id: row.id
        }
      })
      setAvailability(avMap)
    } catch (err) {
      console.error('Load error:', err)
      showToast('Error loading data')
    }
    setLoading(false)
  }, [weekStart])

  useEffect(() => { loadData() }, [loadData])

  // --- Auth ---
  const handleAdminLogin = () => setView('admin')
  const handleEmpLogin = (token) => {
    const emp = employees.find(e => e.token === token)
    if (emp) { setCurrentEmp(emp); setView('employee') }
  }
  const handleLogout = () => { setView('login'); setCurrentEmp(null) }

  // --- Employee actions ---
  const handleSetPin = async (empId, pin) => {
    const { error } = await supabase.from('employees').update({ pin }).eq('id', empId)
    if (error) { showToast('Error setting PIN'); return }
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, pin } : e))
    showToast('PIN set!')
  }

  const handleAddEmployee = async (name) => {
    const token = genToken(name)
    const { data, error } = await supabase.from('employees').insert({ name, token }).select().single()
    if (error) { showToast('Error adding employee'); return }
    setEmployees(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    showToast(`${name} added`)
  }

  const handleRemoveEmployee = async (empId) => {
    const name = employees.find(e => e.id === empId)?.name
    const { error } = await supabase.from('employees').delete().eq('id', empId)
    if (error) { showToast('Error removing'); return }
    setEmployees(prev => prev.filter(e => e.id !== empId))
    setAvailability(prev => { const n = { ...prev }; delete n[empId]; return n })
    showToast(`${name} removed`)
  }

  // --- Shift type actions ---
  const handleAddShiftType = async (name, startTime, endTime) => {
    const { data, error } = await supabase.from('shift_types').insert({ name, start_time: startTime, end_time: endTime }).select().single()
    if (error) { showToast('Error adding shift type'); return }
    setShiftTypes(prev => [...prev, data])
    showToast(`${name} shift added`)
  }

  const handleRemoveShiftType = async (id) => {
    const { error } = await supabase.from('shift_types').delete().eq('id', id)
    if (error) { showToast('Error removing shift type'); return }
    setShiftTypes(prev => prev.filter(s => s.id !== id))
    showToast('Shift type removed')
  }

  // --- Availability toggle (employee or admin preview) ---
  const handleToggleAvailability = async (empId, day, shiftTypeId, isOn) => {
    setSaving(true)
    if (isOn) {
      const shiftType = shiftTypes.find(s => s.id === shiftTypeId)
      const { data, error } = await supabase.from('availability').insert({
        employee_id: empId, day, shift_type_id: shiftTypeId,
        preferred_start: shiftType?.start_time,
        preferred_end: shiftType?.end_time
      }).select().single()
      if (!error) {
        setAvailability(prev => ({
          ...prev,
          [empId]: {
            ...(prev[empId] || {}),
            [day]: {
              ...(prev[empId]?.[day] || {}),
              [shiftTypeId]: { on: true, preferred_start: data.preferred_start, preferred_end: data.preferred_end, id: data.id }
            }
          }
        }))
      }
    } else {
      await supabase.from('availability').delete().eq('employee_id', empId).eq('day', day).eq('shift_type_id', shiftTypeId)
      setAvailability(prev => {
        const n = { ...prev }
        if (n[empId]?.[day]) {
          const d = { ...n[empId][day] }
          delete d[shiftTypeId]
          n[empId] = { ...n[empId], [day]: d }
        }
        return n
      })
    }
    setSaving(false)
  }

  const handleUpdateTime = async (empId, day, shiftTypeId, type, value) => {
    const field = type === 'start' ? 'preferred_start' : 'preferred_end'
    await supabase.from('availability')
      .update({ [field]: value })
      .eq('employee_id', empId).eq('day', day).eq('shift_type_id', shiftTypeId)
    setAvailability(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [day]: {
          ...(prev[empId]?.[day] || {}),
          [shiftTypeId]: { ...(prev[empId]?.[day]?.[shiftTypeId] || {}), [field]: value }
        }
      }
    }))
  }

  // --- Schedule assignment ---
  const handleAssign = async ({ day, shiftTypeId, empId, start, end, existingId }) => {
    if (existingId) {
      const { data, error } = await supabase.from('schedule_assignments')
        .update({ employee_id: empId, actual_start: start, actual_end: end })
        .eq('id', existingId).select().single()
      if (!error) setAssignments(prev => prev.map(a => a.id === existingId ? data : a))
    } else {
      const { data, error } = await supabase.from('schedule_assignments').insert({
        employee_id: empId, day, shift_type_id: shiftTypeId,
        actual_start: start, actual_end: end, week_start: weekStart
      }).select().single()
      if (!error) setAssignments(prev => [...prev, data])
    }
    showToast('Schedule updated')
  }

  const handleAutoGenerate = async (generated) => {
    // Clear existing assignments for this week
    await supabase.from('schedule_assignments').delete().eq('week_start', weekStart)
    // Insert all new assignments
    if (generated.length > 0) {
      const { data, error } = await supabase.from('schedule_assignments').insert(generated).select()
      if (!error) setAssignments(data)
    } else {
      setAssignments([])
    }
    showToast(`Schedule generated — ${generated.length} shifts assigned!`)
  }

  const handleRemoveAssignment = async (id) => {
    await supabase.from('schedule_assignments').delete().eq('id', id)
    setAssignments(prev => prev.filter(a => a.id !== id))
    showToast('Removed')
  }

  // Build emp-keyed availability for employee page
  const empAvailability = currentEmp
    ? Object.fromEntries(
        Object.entries(availability[currentEmp.id] || {}).map(([day, shifts]) => [day, shifts])
      )
    : {}

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div style={{ fontSize: 32, fontWeight: 700, color: '#4F46E5' }}>S</div>
        <div>Loading ShiftFlow...</div>
      </div>
    )
  }

  if (view === 'login') return <LoginPage employees={employees} onAdminLogin={handleAdminLogin} onEmpLogin={handleEmpLogin} loading={loading} />

  if (view === 'employee' && currentEmp) return (
    <EmployeePage
      employee={currentEmp} shiftTypes={shiftTypes} availability={empAvailability}
      onToggle={(d, sId, val) => handleToggleAvailability(currentEmp.id, d, sId, val)}
      onUpdateTime={(d, sId, type, val) => handleUpdateTime(currentEmp.id, d, sId, type, val)}
      onLogout={handleLogout} saving={saving}
    />
  )

  return (
    <AdminPage
      employees={employees} shiftTypes={shiftTypes} availability={availability}
      assignments={assignments} weekStart={weekStart} onWeekChange={setWeekStart}
      onLogout={handleLogout}
      onAddEmployee={handleAddEmployee} onRemoveEmployee={handleRemoveEmployee}
      onAddShiftType={handleAddShiftType} onRemoveShiftType={handleRemoveShiftType}
      onAssign={handleAssign} onRemoveAssignment={handleRemoveAssignment} onAutoGenerate={handleAutoGenerate}
      onToggleAvailability={handleToggleAvailability} onUpdateTime={handleUpdateTime}
      onSetPin={handleSetPin}
      toast={toast}
    />
  )
}
// This file already has handleAssign - we need to add handleAutoGenerate
// Will be injected via str_replace
