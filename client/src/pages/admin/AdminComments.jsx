import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import usePageTitle from '../../hooks/usePageTitle'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import Pagination from '../../components/Pagination'
import Spinner from '../../components/Spinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function AdminComments() {
  usePageTitle('Manage comments')
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const { data, loading, error, reload } = useApi(`/admin/comments?page=${page}&limit=15`)
  const [actionError, setActionError] = useState('')

  async function remove(id) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.del(`/comments/${id}`)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Comments</h1>
      {actionError && <div className="mt-4"><ErrorMessage message={actionError} /></div>}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : data.comments.length === 0 ? (
          <p className="rounded-box border border-base-300 bg-base-100 p-8 text-center text-base-content/70">No comments yet.</p>
        ) : (
          <>
            <ul className="divide-y divide-base-300 rounded-box border border-base-300 bg-base-100">
              {data.comments.map((c) => (
                <li key={c._id} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{c.user?.name || 'Deleted user'}</span>
                      <span className="text-base-content/60"> on </span>
                      {c.post ? (
                        <Link to={`/blog/${c.post.slug}`} target="_blank" className="link link-primary">{c.post.title}</Link>
                      ) : (
                        <span>a deleted post</span>
                      )}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                    <p className="mt-1 text-xs text-base-content/60">{formatDate(c.createdAt)}</p>
                  </div>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(c._id)}>Delete</button>
                </li>
              ))}
            </ul>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => setParams({ page: String(p) })} />
          </>
        )}
      </div>
    </div>
  )
}
