import { Link, useNavigate } from 'react-router-dom'
import useApi from '../hooks/useApi'
import usePageTitle from '../hooks/usePageTitle'
import PostCard from '../components/PostCard'
import CoverImage from '../components/CoverImage'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import { TAGLINE } from '../config'
import { formatDate } from '../lib/format'

export default function Home() {
  usePageTitle('')
  const navigate = useNavigate()
  const latest = useApi('/posts?limit=7')
  const popular = useApi('/posts?sort=popular&limit=4')
  const meta = useApi('/posts/meta')

  const posts = latest.data?.posts || []
  const featured = posts[0]
  const rest = posts.slice(1)

  function search(e) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q').trim()
    navigate(q ? `/blog?search=${encodeURIComponent(q)}` : '/blog')
  }

  return (
    <>
      <section className="border-b border-base-300 bg-base-200">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">{TAGLINE}</h1>
            <p className="mt-5 max-w-lg font-serif text-xl text-base-content/80">
              Practical write-ups on building software, learning in public and shipping real projects.
            </p>
            <form onSubmit={search} className="mt-8 flex max-w-md gap-2" role="search">
              <label htmlFor="home-search" className="sr-only">Search posts</label>
              <input id="home-search" name="q" type="search" placeholder="Search posts" className="input input-bordered flex-1" />
              <button className="btn btn-primary">Search</button>
            </form>
          </div>

          {featured && (
            <Link to={`/blog/${featured.slug}`} className="group block">
              <CoverImage key={featured.coverImage} src={featured.coverImage} alt={featured.title} className="aspect-[16/10] w-full rounded-box" />
              <p className="mt-4 text-sm text-base-content/70">
                Latest post, {formatDate(featured.createdAt)}
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-snug tracking-tight group-hover:text-primary">{featured.title}</h2>
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="pt-14">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight">Recent posts</h2>
            <Link to="/blog" className="link link-primary font-semibold">View all posts</Link>
          </div>

          {latest.loading ? (
            <Spinner />
          ) : latest.error ? (
            <div className="mt-6"><ErrorMessage message={latest.error} onRetry={latest.reload} /></div>
          ) : posts.length === 0 ? (
            <p className="mt-8 text-base-content/70">No posts have been published yet. Check back soon.</p>
          ) : (
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {(rest.length ? rest : posts).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-extrabold tracking-tight">Most read</h2>
            <ol className="mt-5 divide-y divide-base-300">
              {(popular.data?.posts || []).map((post, i) => (
                <li key={post._id} className="flex gap-4 py-4">
                  <span className="w-6 text-2xl font-extrabold text-primary">{i + 1}</span>
                  <div>
                    <Link to={`/blog/${post.slug}`} className="font-bold leading-snug hover:text-primary">{post.title}</Link>
                    <p className="mt-1 text-sm text-base-content/70">{post.views} views</p>
                  </div>
                </li>
              ))}
            </ol>
            {popular.data?.posts?.length === 0 && <p className="mt-4 text-base-content/70">Nothing here yet.</p>}
          </section>

          <section>
            <h2 className="text-2xl font-extrabold tracking-tight">Browse by topic</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {(meta.data?.categories || []).map((c) => (
                <Link key={c.name} to={`/blog?category=${encodeURIComponent(c.name)}`} className="btn btn-outline btn-sm">
                  {c.name} ({c.count})
                </Link>
              ))}
            </div>
            {meta.data?.categories?.length === 0 && <p className="mt-4 text-base-content/70">Topics appear once posts are published.</p>}
            {meta.data?.tags?.length > 0 && (
              <>
                <h3 className="mt-8 font-bold">Popular tags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {meta.data.tags.map((t) => (
                    <Link key={t.name} to={`/blog?tag=${encodeURIComponent(t.name)}`} className="badge badge-lg badge-ghost">
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
