import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import { SITE_NAME } from '../config'
import { initials } from '../lib/format'

const linkClass = ({ isActive }) => (isActive ? 'font-semibold text-primary' : '')

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="navbar mx-auto max-w-6xl px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost btn-circle md:hidden" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
            <ul tabIndex={0} className="menu dropdown-content z-10 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2">
              <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
              <li><NavLink to="/blog" className={linkClass}>Blog</NavLink></li>
            </ul>
          </div>
          <Link to="/" className="px-2 text-2xl font-extrabold tracking-tight">
            {SITE_NAME}
          </Link>
        </div>

        <nav className="navbar-center hidden md:flex" aria-label="Main">
          <ul className="menu menu-horizontal gap-1">
            <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
            <li><NavLink to="/blog" className={linkClass}>Blog</NavLink></li>
          </ul>
        </nav>

        <div className="navbar-end gap-1">
          <ThemeToggle />
          {user ? (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-primary btn-circle" aria-label="Account menu">
                {initials(user.name)}
              </button>
              <ul tabIndex={0} className="menu dropdown-content z-10 mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2">
                <li className="menu-title truncate">{user.name}</li>
                <li><Link to="/profile">Profile</Link></li>
                {isAdmin && <li><Link to="/admin">Admin dashboard</Link></li>}
                <li><button onClick={handleLogout}>Log out</button></li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
