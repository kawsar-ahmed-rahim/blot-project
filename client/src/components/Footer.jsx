import { Link } from 'react-router-dom'
import { SITE_NAME, TAGLINE } from '../config'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-base-300 bg-base-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xl font-extrabold tracking-tight">{SITE_NAME}</p>
          <p className="mt-1 max-w-sm text-sm text-base-content/70">{TAGLINE}</p>
        </div>
        <nav className="flex gap-6 text-sm" aria-label="Footer">
          <Link to="/" className="link link-hover">Home</Link>
          <Link to="/blog" className="link link-hover">Blog</Link>
          <Link to="/login" className="link link-hover">Log in</Link>
        </nav>
      </div>
      <p className="border-t border-base-300 py-4 text-center text-xs text-base-content/60">
        &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </p>
    </footer>
  )
}
