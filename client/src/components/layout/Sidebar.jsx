import { Flame, House, Salad, UserCircle2, Footprints, Dumbbell, Images, LogOut, X, Bot, MessageSquareMore } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { setMobileSidebar } from '../../redux/slices/uiSlice'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/calories', label: 'Calories', icon: Salad },
  { to: '/steps', label: 'Steps', icon: Footprints },
  { to: '/feed', label: 'Progress Feed', icon: Images },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquareMore },
  { to: '/trainer', label: 'AI Trainer', icon: Bot },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

function SidebarLinks() {
  const dispatch = useDispatch()

  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
              isActive
                ? 'bg-linear-to-r from-blue-500/30 to-sky-900/40 text-white'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`
          }
          onClick={() => dispatch(setMobileSidebar(false))}
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const mobileSidebarOpen = useSelector((state) => state.ui.mobileSidebarOpen)

  return (
    <>
      <aside className="hidden min-h-screen w-72 border-r border-slate-800/70 bg-slate-950/70 p-5 backdrop-blur-xl lg:block">
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 text-2xl font-bold text-white">
          <span className="rounded-xl bg-linear-to-br from-blue-500 to-blue-800 p-2 text-white">
            <Flame size={18} />
          </span>
          BigD
        </Link>
        <nav className="space-y-2">
          <SidebarLinks />
        </nav>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => dispatch(setMobileSidebar(false))}
            aria-label="Close sidebar backdrop"
          />
          <aside className="relative z-10 h-full w-72 bg-slate-950 p-5">
            <div className="mb-6 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white">
                <Flame size={18} />
                BigD
              </Link>
              <button
                type="button"
                onClick={() => dispatch(setMobileSidebar(false))}
                className="rounded-md p-2 text-slate-300 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-2">
              <SidebarLinks />
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
