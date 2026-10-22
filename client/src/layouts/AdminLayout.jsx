import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'
import { SITE_NAME } from '../config'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/posts/new', label: 'New post' },
  { to: '/admin/comments', label: 'Comments' },
  { to: '/admin/users', label: 'Users' },
]

const closeDrawer = () => {
  const toggle = document.getElementById('admin-drawer')
  if (toggle) toggle.checked = false
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex min-h-screen flex-col bg-base-200">
        <div className="navbar border-b border-base-300 bg-base-100 lg:hidden">
          <label htmlFor="admin-drawer" className="btn btn-ghost btn-circle" aria-label="Open admin menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </label>
          <span className="flex-1 px-2 font-bold">Admin</span>
          <ThemeToggle />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="admin-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100 p-4">
          <Link to="/admin" className="px-3 py-2 text-xl font-extrabold tracking-tight">
            {SITE_NAME} <span className="text-sm font-normal text-base-content/60">admin</span>
          </Link>
          <ul className="menu mt-4 w-full gap-1 p-0">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} onClick={closeDrawer} className={({ isActive }) => (isActive ? 'menu-active' : '')}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-4">
              <Link to="/" target="_blank" rel="noreferrer">View site</Link>
            </li>
          </ul>
          <div className="mt-auto border-t border-base-300 pt-4">
            <p className="truncate px-3 text-sm font-semibold">{user?.name}</p>
            <p className="truncate px-3 text-xs text-base-content/60">{user?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                className="btn btn-outline btn-sm flex-1"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Log out
              </button>
              <span className="hidden lg:block"><ThemeToggle /></span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
