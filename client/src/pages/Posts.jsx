import { useSearchParams } from 'react-router-dom'
import useApi from '../hooks/useApi'
import usePageTitle from '../hooks/usePageTitle'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

export default function Posts() {
  usePageTitle('Blog')
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const search = params.get('search') || ''
  const category = params.get('category') || ''
  const tag = params.get('tag') || ''
  const sort = params.get('sort') || 'latest'

  const query = new URLSearchParams({ page, limit: 9, sort })
  if (search) query.set('search', search)
  if (category) query.set('category', category)
  if (tag) query.set('tag', tag)

  const { data, loading, error, reload } = useApi(`/posts?${query}`)
  const meta = useApi('/posts/meta')

  function update(changes) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  const filtered = search || category || tag

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Blog</h1>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <form
          role="search"
          key={search}
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            update({ search: new FormData(e.currentTarget).get('q').trim() })
          }}
        >
          <label htmlFor="q" className="sr-only">Search posts</label>
          <input id="q" name="q" type="search" defaultValue={search} placeholder="Search by title, topic or tag" className="input input-bordered w-full" />
          <button className="btn btn-primary">Search</button>
        </form>
        <label className="flex items-center gap-2 text-sm">
          Sort by
          <select className="select select-bordered select-sm" value={sort} onChange={(e) => update({ sort: e.target.value === 'latest' ? '' : e.target.value })}>
            <option value="latest">Newest</option>
            <option value="popular">Most viewed</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className={`btn btn-sm ${category ? 'btn-outline' : 'btn-primary'}`} onClick={() => update({ category: '' })}>
          All topics
        </button>
        {(meta.data?.categories || []).map((c) => (
          <button key={c.name} className={`btn btn-sm ${category === c.name ? 'btn-primary' : 'btn-outline'}`} onClick={() => update({ category: c.name })}>
            {c.name}
          </button>
        ))}
      </div>

      {tag && (
        <p className="mt-4 text-sm">
          Showing posts tagged <span className="badge badge-ghost">#{tag}</span>{' '}
          <button className="link link-primary" onClick={() => update({ tag: '' })}>Clear tag</button>
        </p>
      )}

      <div className="mt-10">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : data.posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">{filtered ? 'No posts match your filters.' : 'No posts yet.'}</p>
            {filtered && (
              <button className="btn btn-outline btn-sm mt-4" onClick={() => setParams({})}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-base-content/70">{data.total} {data.total === 1 ? 'post' : 'posts'}</p>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {data.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => update({ page: String(p) })} />
          </>
        )}
      </div>
    </div>
  )
}
