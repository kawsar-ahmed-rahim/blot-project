import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'

export default function Comments({ postId }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const { data, loading, error, setData } = useApi(`/posts/${postId}/comments`)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const comments = data?.comments || []

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setFormError('')
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text })
      setData({ comments: [res.comment, ...comments] })
      setText('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.del(`/comments/${id}`)
      setData({ comments: comments.filter((c) => c._id !== id) })
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-16 max-w-2xl">
      <h2 id="comments-heading" className="text-2xl font-extrabold tracking-tight">
        Comments {data && `(${comments.length})`}
      </h2>

      {user ? (
        <form onSubmit={submit} className="mt-5">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <textarea
            id="comment"
            className="textarea textarea-bordered w-full"
            rows={3}
            maxLength={1000}
            placeholder="Share your thoughts"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-base-content/60">{text.length}/1000</span>
            <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>
              {busy ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-box border border-base-300 bg-base-200 p-4 text-sm">
          <Link to="/login" state={{ from: location.pathname }} className="link link-primary font-semibold">Log in</Link>{' '}
          or{' '}
          <Link to="/register" state={{ from: location.pathname }} className="link link-primary font-semibold">create an account</Link>{' '}
          to join the conversation.
        </p>
      )}

      {formError && <div className="mt-3"><ErrorMessage message={formError} /></div>}

      {loading ? (
        <Spinner className="py-8" />
      ) : error ? (
        <div className="mt-6"><ErrorMessage message={error} /></div>
      ) : comments.length === 0 ? (
        <p className="mt-8 text-base-content/70">No comments yet. Be the first to write one.</p>
      ) : (
        <ul className="mt-8 divide-y divide-base-300">
          {comments.map((c) => (
            <li key={c._id} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">
                  {c.user?.name || 'Deleted user'}
                  <span className="ml-3 text-xs font-normal text-base-content/60">{formatDate(c.createdAt)}</span>
                </p>
                {(isAdmin || c.user?._id === user?.id) && (
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(c._id)}>
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
