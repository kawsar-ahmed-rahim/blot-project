import { useState } from 'react'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import usePageTitle from '../../hooks/usePageTitle'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import Spinner from '../../components/Spinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function AdminUsers() {
  usePageTitle('Manage users')
  const { user: me } = useAuth()
  const { data, loading, error, reload } = useApi('/admin/users')
  const [actionError, setActionError] = useState('')

  async function changeRole(user, role) {
    setActionError('')
    try {
      await api.put(`/admin/users/${user._id}/role`, { role })
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function remove(user) {
    if (!window.confirm(`Delete ${user.name}? Their comments will be deleted too.`)) return
    setActionError('')
    try {
      await api.del(`/admin/users/${user._id}`)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
      {actionError && <div className="mt-4"><ErrorMessage message={actionError} /></div>}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const isMe = u._id === me.id
                  return (
                    <tr key={u._id}>
                      <td className="font-semibold">{u.name}{isMe && <span className="badge badge-ghost badge-sm ml-2">You</span>}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          aria-label={`Role for ${u.name}`}
                          className="select select-bordered select-sm"
                          value={u.role}
                          disabled={isMe}
                          onChange={(e) => changeRole(u, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="text-right">
                        <button className="btn btn-ghost btn-xs text-error" disabled={isMe} onClick={() => remove(u)}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
