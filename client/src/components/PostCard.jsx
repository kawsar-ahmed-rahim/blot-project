import { Link } from 'react-router-dom'
import CoverImage from './CoverImage'
import { formatDate } from '../lib/format'

export default function PostCard({ post }) {
  return (
    <article className="group">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-box">
        <CoverImage
          key={post.coverImage}
          src={post.coverImage}
          alt={post.title}
          className="aspect-[16/10] w-full"
        />
      </Link>
      <div className="mt-4 flex items-center gap-3 text-sm text-base-content/70">
        <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="badge badge-primary badge-soft">
          {post.category}
        </Link>
        <span>{post.readTime} min read</span>
      </div>
      <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight">
        <Link to={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 font-serif text-lg text-base-content/80">{post.excerpt}</p>
      <p className="mt-3 text-sm text-base-content/70">
        {post.author?.name || 'Unknown author'}, {formatDate(post.createdAt)}
      </p>
    </article>
  )
}
