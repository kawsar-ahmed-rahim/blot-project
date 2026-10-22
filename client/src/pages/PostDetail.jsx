import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'
import usePageTitle from '../hooks/usePageTitle'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import CoverImage from '../components/CoverImage'
import Comments from '../components/Comments'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'

export default function PostDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useApi(`/posts/${slug}`)
  const post = data?.post
  usePageTitle(post?.title || 'Post')

  if (loading) return <Spinner className="py-32" />
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold">Post not found</h1>
        <p className="mt-3 text-base-content/70">{error}</p>
        <Link to="/blog" className="btn btn-primary mt-6">Browse all posts</Link>
      </div>
    )
  }

  // key resets like/copy state when navigating between posts
  return <Article key={post._id} post={post} />
}

function Article({ post }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(post.liked)
  const [likes, setLikes] = useState(post.likesCount)
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState('')
  const related = useApi(`/posts?category=${encodeURIComponent(post.category)}&exclude=${post._id}&limit=3`)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function toggleLike() {
    if (!user) return navigate('/login', { state: { from: location.pathname } })
    try {
      const res = await api.post(`/posts/${post._id}/like`)
      setLiked(res.liked)
      setLikes(res.likesCount)
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setActionError('Could not copy the link. Copy it from the address bar instead.')
    }
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {post.status === 'draft' && (
          <div className="alert alert-warning alert-soft mb-6">This post is a draft. Only admins can see it.</div>
        )}
        <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="badge badge-primary badge-soft">
          {post.category}
        </Link>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 font-serif text-xl text-base-content/80">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-base-content/70">
          <span className="font-semibold text-base-content">{post.author?.name || 'Unknown author'}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>{post.readTime} min read</span>
          <span>{post.views} views</span>
        </div>
      </div>

      {post.coverImage && (
        <CoverImage key={post.coverImage} src={post.coverImage} alt={post.title} className="mt-8 aspect-[16/8] w-full rounded-box" />
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        <div className="article">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="badge badge-lg badge-ghost">
                #{t}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-base-300 py-4">
          <button className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`} onClick={toggleLike} aria-pressed={liked}>
            {liked ? 'Liked' : 'Like'} ({likes})
          </button>
          <button className="btn btn-outline btn-sm" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
        {actionError && <div className="mt-3"><ErrorMessage message={actionError} /></div>}

        {post.status === 'published' && <Comments postId={post._id} />}
      </div>

      {related.data?.posts?.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-extrabold tracking-tight">More in {post.category}</h2>
          <div className="mt-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.data.posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
