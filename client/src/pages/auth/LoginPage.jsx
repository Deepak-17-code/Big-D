import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../../redux/slices/authSlice'
import { authService } from '../../services/authService'

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    setError('')

    const payload = {
      email: form.email.trim(),
      password: form.password,
    }

    try {
      const { data } = await authService.login(payload)
      dispatch(loginSuccess(data))
      navigate('/dashboard')
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to login right now. Please try again.'))
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={onSubmit} className="auth-card">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Login to BigD</h1>
        <p className="mt-2 text-slate-300">Track smarter workouts and celebrate progress daily.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              className="auth-input"
              placeholder="Enter password"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-sky-300">{error}</p>}

        <button type="submit" className="auth-button mt-6">
          Sign In
        </button>

        <p className="mt-4 text-sm text-slate-300">
          New here?{' '}
          <Link to="/signup" className="font-medium text-blue-300 hover:text-blue-200">
            Create account
          </Link>
        </p>
      </form>
    </div>
  )
}
