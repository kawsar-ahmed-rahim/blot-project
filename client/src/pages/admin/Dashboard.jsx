import { Link } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import usePageTitle from '../../hooks/usePageTitle'
import Spinner from '../../components/Spinner'
import ErrorMessage from '../../components/ErrorMessage'
import { formatDate } from '../../lib/format'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { data, loading, error, reload } = useApi('/admin/stats')

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} onRetry={reload} />

  const stats = [
    { label: 'Total posts', value: data.totalPosts },
    { label: 'Published', value: data.published },
    { label: 'Drafts', value: data.drafts },
    { label: 'Total views', value: data.views },
    { label: 'Comments', value: data.comments },
    { label: 'Users', value: data.users },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <Link to="/admin/posts/new" className="btn btn-primary">New post</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-box border border-base-300 bg-base-100 p-5">
            <p className="text-sm text-base-content/70">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-lg font-bold">Recent posts</h2>
          {data.recent.length === 0 ? (
            <p className="mt-3 text-sm text-base-content/70">No posts yet. Write your first one.</p>
          ) : (
            <ul className="mt-3 divide-y divide-base-300">
              {data.recent.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to={`/admin/posts/${p._id}/edit`} className="block truncate font-semibold hover:text-primary">{p.title}</Link>
                    <p className="text-xs text-base-content/60">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'} badge-soft`}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-lg font-bold">Most viewed</h2>
          {data.top.length === 0 ? (
            <p className="mt-3 text-sm text-base-content/70">Views will show up once posts are read.</p>
          ) : (
            <ol className="mt-3 divide-y divide-base-300">
              {data.top.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                  <Link to={`/blog/${p.slug}`} target="_blank" className="truncate font-semibold hover:text-primary">{p.title}</Link>
                  <span className="text-sm text-base-content/70">{p.views} views</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
