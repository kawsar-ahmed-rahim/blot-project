import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import usePageTitle from '../../hooks/usePageTitle'
import { api } from '../../lib/api'
import { formatDate } from '../../lib/format'
import Pagination from '../../components/Pagination'
import Spinner from '../../components/Spinner'
import ErrorMessage from '../../components/ErrorMessage'

export default function AdminPosts() {
  usePageTitle('Manage posts')
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const status = params.get('status') || ''
  const search = params.get('search') || ''
  const [actionError, setActionError] = useState('')

  const query = new URLSearchParams({ page, limit: 10 })
  if (status) query.set('status', status)
  if (search) query.set('search', search)
  const { data, loading, error, reload } = useApi(`/admin/posts?${query}`)

  function update(changes) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}"? Its comments will be deleted too.`)) return
    try {
      await api.del(`/admin/posts/${post._id}`)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Posts</h1>
        <Link to="/admin/posts/new" className="btn btn-primary">New post</Link>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="tabs tabs-box w-fit">
          {[['', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([value, label]) => (
            <button key={label} role="tab" className={`tab ${status === value ? 'tab-active' : ''}`} onClick={() => update({ status: value })}>
              {label}
            </button>
          ))}
        </div>
        <form
          key={search}
          role="search"
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            update({ search: new FormData(e.currentTarget).get('q').trim() })
          }}
        >
          <label htmlFor="admin-q" className="sr-only">Search posts</label>
          <input id="admin-q" name="q" type="search" defaultValue={search} placeholder="Search by title" className="input input-bordered input-sm" />
          <button className="btn btn-sm">Search</button>
        </form>
      </div>

      {actionError && <div className="mt-4"><ErrorMessage message={actionError} /></div>}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : data.posts.length === 0 ? (
          <p className="rounded-box border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
            No posts found. <Link to="/admin/posts/new" className="link link-primary">Write a new post</Link>
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Created</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {data.posts.map((post) => (
                    <tr key={post._id}>
                      <td className="max-w-xs">
                        <Link to={`/admin/posts/${post._id}/edit`} className="line-clamp-2 font-semibold hover:text-primary">{post.title}</Link>
                        {post.featured && <span className="badge badge-accent badge-soft badge-sm mt-1">Featured</span>}
                      </td>
                      <td><span className={`badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'} badge-soft`}>{post.status}</span></td>
                      <td>{post.category}</td>
                      <td>{post.views}</td>
                      <td>{post.likesCount}</td>
                      <td className="whitespace-nowrap">{formatDate(post.createdAt)}</td>
                      <td className="whitespace-nowrap text-right">
                        {post.status === 'published' && (
                          <Link to={`/blog/${post.slug}`} target="_blank" className="btn btn-ghost btn-xs">View</Link>
                        )}
                        <Link to={`/admin/posts/${post._id}/edit`} className="btn btn-ghost btn-xs">Edit</Link>
                        <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(post)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => update({ page: String(p) })} />
          </>
        )}
      </div>
    </div>
  )
}
