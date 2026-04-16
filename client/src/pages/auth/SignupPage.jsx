import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signupSuccess } from '../../redux/slices/authSlice'
import { authService } from '../../services/authService'

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    setError('')

    const payload = {
      name: form.name,
      email: form.email.trim(),
      password: form.password,
    }

    try {
      const { data } = await authService.signup(payload)
      dispatch(signupSuccess(data))
      navigate('/dashboard')
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to create account right now.'))
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={onSubmit} className="auth-card">
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Join BigD</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Create your athlete profile</h1>

        <div className="mt-6 space-y-4">
          <label className="block text-sm text-slate-300">
            Full Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="auth-input"
              placeholder="Ariana Cole"
            />
          </label>
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
              placeholder="At least 6 characters"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Confirm Password
            <input
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              type="password"
              className="auth-input"
              placeholder="Re-enter password"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-sky-300">{error}</p>}

        <button type="submit" className="auth-button mt-6">
          Create Account
        </button>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
