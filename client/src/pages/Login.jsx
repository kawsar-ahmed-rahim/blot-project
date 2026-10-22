import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import usePageTitle from '../hooks/usePageTitle'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  usePageTitle('Log in')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from || '/'} replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const loggedIn = await login(form.email, form.password)
      navigate(from || (loggedIn.role === 'admin' ? '/admin' : '/'), { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Log in</h1>
      <p className="mt-2 text-base-content/70">Log in to like posts and join the discussion.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorMessage message={error} />
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input type="email" required autoComplete="email" className="input input-bordered w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Password</span>
          <input type="password" required autoComplete="current-password" className="input input-bordered w-full" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>

      <p className="mt-6 text-sm">
        New here? <Link to="/register" state={{ from }} className="link link-primary font-semibold">Create an account</Link>
      </p>
    </div>
  )
}
