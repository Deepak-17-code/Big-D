import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { logout, updateProfile } from './redux/slices/authSlice'
import { authService } from './services/authService'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/DashboardPage'
import WorkoutsPage from './pages/WorkoutsPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import CaloriesPage from './pages/CaloriesPage'
import StepsPage from './pages/StepsPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import AITrainerPage from './pages/AITrainerPage'
import AIAssistantPage from './pages/AIAssistantPage'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !token || token === 'demo-token') {
      return
    }

    let cancelled = false

    const hydrateSession = async () => {
      try {
        const { data } = await authService.me()
        if (!cancelled && data?.user) {
          dispatch(updateProfile(data.user))
        }
      } catch {
        if (!cancelled) {
          dispatch(logout())
        }
      }
    }

    hydrateSession()

    return () => {
      cancelled = true
    }
  }, [dispatch, isAuthenticated, token])

  return (
    <div className="theme-fitness min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/workouts/:workoutId" element={<WorkoutDetailPage />} />
              <Route path="/calories" element={<CaloriesPage />} />
              <Route path="/steps" element={<StepsPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/assistant" element={<AIAssistantPage />} />
              <Route path="/trainer" element={<AITrainerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
