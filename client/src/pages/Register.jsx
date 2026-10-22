import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import usePageTitle from '../hooks/usePageTitle'
import ErrorMessage from '../components/ErrorMessage'

export default function Register() {
  usePageTitle('Sign up')
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from || '/'} replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(form.name, form.email, form.password)
      navigate(from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-base-content/70">Free, and takes less than a minute.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorMessage message={error} />
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Name</span>
          <input required maxLength={60} autoComplete="name" className="input input-bordered w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input type="email" required autoComplete="email" className="input input-bordered w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Password</span>
          <input type="password" required minLength={6} autoComplete="new-password" className="input input-bordered w-full" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <span className="mt-1 block text-xs text-base-content/60">At least 6 characters.</span>
        </label>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Creating account...' : 'Sign up'}</button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account? <Link to="/login" state={{ from }} className="link link-primary font-semibold">Log in</Link>
      </p>
    </div>
  )
}
