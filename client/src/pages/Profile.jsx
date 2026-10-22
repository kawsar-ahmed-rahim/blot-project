import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import usePageTitle from '../hooks/usePageTitle'
import { api } from '../lib/api'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile() {
  usePageTitle('Profile')
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, currentPassword: '', newPassword: '' })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const body = { name: form.name }
      if (form.newPassword) {
        body.currentPassword = form.currentPassword
        body.newPassword = form.newPassword
      }
      const res = await api.put('/auth/profile', body)
      setUser(res.user)
      setForm({ ...form, currentPassword: '', newPassword: '' })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Your profile</h1>
      <p className="mt-2 text-base-content/70">{user.email}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <ErrorMessage message={error} />
        {saved && <div role="status" className="alert alert-success alert-soft">Profile saved.</div>}
        <label className="form-control block">
          <span className="mb-1 block text-sm font-semibold">Name</span>
          <input required maxLength={60} className="input input-bordered w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>

        <fieldset className="rounded-box border border-base-300 p-4">
          <legend className="px-2 text-sm font-semibold">Change password</legend>
          <label className="block">
            <span className="mb-1 block text-sm">Current password</span>
            <input type="password" autoComplete="current-password" className="input input-bordered w-full" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm">New password</span>
            <input type="password" minLength={6} autoComplete="new-password" className="input input-bordered w-full" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </label>
        </fieldset>

        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
      </form>
    </div>
  )
}
