import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight">Page not found</h1>
      <p className="mt-4 text-base-content/70">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-8">Go to the homepage</Link>
    </div>
  )
}
