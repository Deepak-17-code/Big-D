import { useState } from 'react'
import { Menu, Search, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setMobileSidebar } from '../../redux/slices/uiSlice'

const FALLBACK_AVATAR = '/avatar-placeholder.svg'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const [question, setQuestion] = useState('')

  const submitQuestion = (event) => {
    event.preventDefault()
    const cleanedQuestion = question.trim()

    if (!cleanedQuestion) {
      return
    }

    navigate(`/assistant?q=${encodeURIComponent(cleanedQuestion)}`)
    setQuestion('')
  }

  return (
    <header className="sticky top-0 z-30 mb-6 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(setMobileSidebar(true))}
            className="rounded-lg border border-slate-700 p-2 text-slate-200 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-300/90">Today</p>
            <h1 className="text-xl font-semibold text-white">Push Your Limits</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={submitQuestion} className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-400 md:flex">
            <Search size={16} />
            <input
              type="search"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything..."
              className="w-56 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600/90 text-white transition hover:bg-blue-500"
              aria-label="Ask AI"
            >
              <Send size={14} />
            </button>
          </form>
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 transition hover:border-blue-500/70 hover:bg-slate-900/80"
            aria-label="Go to profile"
          >
            <img
              src={user?.avatar || FALLBACK_AVATAR}
              alt={user?.name || 'Profile'}
              className="h-8 w-8 rounded-full object-cover"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_AVATAR
              }}
            />
            <span className="hidden text-sm text-slate-200 sm:block">{user?.name || 'Athlete'}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
