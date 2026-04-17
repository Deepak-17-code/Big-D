import { useNavigate } from 'react-router-dom'
import { Activity, TrendingUp, Users } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">BigD</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Fitness Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitor your workouts, steps, calories, and progress all in one place. 
            Log in or create an account to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg border border-indigo-600 hover:bg-indigo-50 transition text-lg"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose BigD?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Activity className="w-12 h-12 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Workout Tracking
              </h4>
              <p className="text-gray-600">
                Log your exercises, sets, reps, and weights. Build a complete history of your training.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Progress Analytics
              </h4>
              <p className="text-gray-600">
                Monitor your steps, calories burned, and fitness metrics with beautiful charts and insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Share Progress
              </h4>
              <p className="text-gray-600">
                Post your achievements and progress photos to inspire and motivate the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-indigo-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Start Your Fitness Journey Today
          </h3>
          <p className="text-indigo-100 mb-8 text-lg">
            Join thousands of users tracking their fitness goals with BigD
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2024 BigD Fitness Tracker. All rights reserved.</p>
          <p className="text-sm mt-2">
            Note: Your data is saved only when you log in. Browsing without an account won't persist data on page refresh.
          </p>
        </div>
      </footer>
    </div>
  )
}
