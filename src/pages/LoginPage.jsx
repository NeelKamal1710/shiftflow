import { useState } from 'react'
import { ADMIN_PASSWORD } from '../lib/utils'

export default function LoginPage({ employees, onAdminLogin, onEmpLogin, loading }) {
  const [role, setRole] = useState('admin')
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [selEmpId, setSelEmpId] = useState('')
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)

  const handleAdmin = () => {
    if (pass === ADMIN_PASSWORD) { setPassErr(false); onAdminLogin() }
    else setPassErr(true)
  }

  const handleEmpLogin = () => {
    const emp = employees.find(e => e.id === selEmpId)
    if (!emp) return
    if (!emp.pin) { setPinErr(true); return }
    if (emp.pin !== pin) { setPinErr(true); return }
    setPinErr(false)
    onEmpLogin(emp.token)
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo" style={{ marginBottom: 28 }}>
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-title">ShiftFlow</div>
            <div className="logo-sub">Shift scheduling made simple</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>I am a</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className={`role-btn ${role === 'admin' ? 'active-admin' : ''}`} onClick={() => setRole('admin')}>Admin</button>
            <button className={`role-btn ${role === 'employee' ? 'active-emp' : ''}`} onClick={() => setRole('employee')}>Employee</button>
          </div>
        </div>

        {role === 'admin' && (
          <div>
            <label>Admin Password</label>
            <input className="inp" type="password" placeholder="Enter password" value={pass}
              onChange={e => { setPass(e.target.value); setPassErr(false) }}
              onKeyDown={e => e.key === 'Enter' && handleAdmin()} />
            {passErr && <div className="err-txt">Incorrect password</div>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={handleAdmin}>
              Sign in as Admin
            </button>
          </div>
        )}

        {role === 'employee' && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>Select your name</label>
              {loading ? <div style={{ fontSize: 13, color: '#6B7280', padding: '8px 0' }}>Loading...</div> : (
                <select className="sel" style={{ width: '100%', padding: '9px 12px' }}
                  value={selEmpId} onChange={e => { setSelEmpId(e.target.value); setPinErr(false); setPin('') }}>
                  <option value="">-- Select name --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              )}
            </div>
            {selEmpId && (
              <div style={{ marginBottom: 12 }}>
                <label>Your PIN</label>
                <input className="inp" type="password" inputMode="numeric" maxLength={6}
                  placeholder="Enter your PIN"
                  value={pin} onChange={e => { setPin(e.target.value); setPinErr(false) }}
                  onKeyDown={e => e.key === 'Enter' && handleEmpLogin()} />
                {pinErr && <div className="err-txt">Incorrect PIN — ask your manager to set/reset it</div>}
              </div>
            )}
            <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={handleEmpLogin} disabled={!selEmpId || !pin}>
              Open my availability
            </button>
          </div>
        )}

        <div style={{ marginTop: 20, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
          Default admin password: <strong>admin123</strong>
        </div>
      </div>
    </div>
  )
}
