import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Activity, TrendingDown, Zap, Navigation2, Target, BarChart3, AlertCircle, Clock } from 'lucide-react'
import Card from '../components/common/Card'
import {
  calculateBMI,
  calculateCalorieGoal,
  calculateDynamicCalorieGoal,
  calculateStepsForCalories,
  calculateWeightGoalTimeline,
  caloriesPer1000Steps,
} from '../utils/calculators'
import { authService } from '../services/authService'
import { updateProfile } from '../redux/slices/authSlice'

export default function AITrainerPage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)

  const [form, setForm] = useState({
    weight: '',
    height: '',
    goalWeight: '',
    goalTimelineWeeks: '',
  })
  const [targetCalories, setTargetCalories] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [timeline, setTimeline] = useState(null)

  // Load user metrics on mount
  useEffect(() => {
    if (user) {
      setForm({
        weight: user.weight || '',
        height: user.height || '',
        goalWeight: user.goalWeight || '',
        goalTimelineWeeks: user.goalTimelineWeeks || '',
      })
      calculateMetrics(user.weight, user.height, user.goalWeight, user.goalTimelineWeeks)
    }
  }, [user])

  const calculateMetrics = (weight, height, goalWeight, goalTimelineWeeks) => {
    if (weight && height) {
      const bmi = calculateBMI(weight, height)
      const calorieGoal = goalWeight && goalTimelineWeeks
        ? calculateDynamicCalorieGoal(weight, height, goalWeight, goalTimelineWeeks)
        : goalWeight
          ? calculateCalorieGoal(weight, height, goalWeight)
          : null
      const timelineData = goalWeight
        ? calculateWeightGoalTimeline(weight, goalWeight)
        : null

      setMetrics({
        bmi,
        calorieGoal,
        caloriesPerSession: caloriesPer1000Steps(weight),
      })
      setTimeline(timelineData)
    }
  }

  const onChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
    setError('')
    setSuccess('')
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.weight || !form.height) {
      setError('Please enter both weight and height')
      return
    }

    const weight = parseFloat(form.weight)
    const height = parseFloat(form.height)
    const goalWeight = form.goalWeight ? parseFloat(form.goalWeight) : null
    const goalTimelineWeeks = form.goalTimelineWeeks ? parseFloat(form.goalTimelineWeeks) : null

    if (!Number.isFinite(weight) || weight <= 0) {
      setError('Weight must be a valid positive number')
      return
    }
    if (!Number.isFinite(height) || height <= 0) {
      setError('Height must be a valid positive number')
      return
    }
    if (goalWeight && !Number.isFinite(goalWeight) && goalWeight < 0) {
      setError('Goal weight must be a valid positive number')
      return
    }
    if (goalTimelineWeeks && (!Number.isFinite(goalTimelineWeeks) || goalTimelineWeeks <= 0)) {
      setError('Timeline must be a positive number of weeks')
      return
    }

    setSaving(true)
    try {
      const { data } = await authService.updateMetrics({
        weight,
        height,
        goalWeight,
        goalTimelineWeeks,
      })

      dispatch(updateProfile(data.user))
      calculateMetrics(weight, height, goalWeight, goalTimelineWeeks)
      setSuccess('Your metrics have been saved successfully!')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save metrics')
    } finally {
      setSaving(false)
    }
  }

  const handleStepsCalculation = (e) => {
    e.preventDefault()
    if (!targetCalories || parseFloat(targetCalories) <= 0) {
      setError('Please enter a valid calorie amount')
      return
    }
  }

  const stepsResult =
    targetCalories && form.weight
      ? calculateStepsForCalories(form.weight, parseFloat(targetCalories))
      : null

  const bmiData = metrics?.bmi
  const calorieGoal = metrics?.calorieGoal

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">🤖 AI Personal Trainer</h1>
        <p className="text-slate-400">
          Get personalized fitness metrics and recommendations based on your body measurements
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Metrics Input Form */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <Activity size={20} />
          Your Metrics
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Weight (kg) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => onChange('weight', e.target.value)}
                placeholder="70"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Height (cm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={form.height}
                onChange={(e) => onChange('height', e.target.value)}
                placeholder="175"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Goal Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.goalWeight}
                onChange={(e) => onChange('goalWeight', e.target.value)}
                placeholder="65"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Target Timeline (weeks)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="1"
                value={form.goalTimelineWeeks}
                onChange={(e) => onChange('goalTimelineWeeks', e.target.value)}
                placeholder="12"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
                {form.goalTimelineWeeks ? `~${Math.round(form.goalTimelineWeeks / 4.33)} mo` : 'months'}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Example: 12 weeks = 3 months, 24 weeks = 6 months
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Metrics'}
          </button>
        </form>
      </Card>

      {/* BMI Section */}
      {bmiData && (
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Target size={20} />
            Body Mass Index (BMI)
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <p className="mb-2 text-sm text-slate-400">Your BMI</p>
              <p className="text-4xl font-bold text-blue-400">{bmiData.bmi}</p>
              <p className="mt-2 text-sm text-slate-300">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    bmiData.status === 'normal'
                      ? 'text-green-400'
                      : bmiData.status === 'below-normal'
                        ? 'text-blue-400'
                        : bmiData.status === 'above-normal'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                  }`}
                >
                  {bmiData.category}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <p className="mb-2 text-sm text-slate-400">BMI Scale</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-20 text-slate-400">Underweight</span>
                  <div className="h-2 flex-1 rounded bg-blue-500/30" />
                  <span className="w-12 text-slate-500">&lt;18.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-slate-400">Normal</span>
                  <div className="h-2 flex-1 rounded bg-green-500/30" />
                  <span className="w-12 text-slate-500">18.5-25</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-slate-400">Overweight</span>
                  <div className="h-2 flex-1 rounded bg-yellow-500/30" />
                  <span className="w-12 text-slate-500">25-30</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-slate-400">Obese</span>
                  <div className="h-2 flex-1 rounded bg-red-500/30" />
                  <span className="w-12 text-slate-500">&gt;30</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Calorie Recommendations */}
      {calorieGoal && (
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Zap size={20} />
            Calorie Recommendations
          </h2>

          <div
            className={`mb-4 rounded-lg border p-4 ${
              calorieGoal.riskLevel === 'aggressive'
                ? 'border-yellow-500/30 bg-yellow-500/10'
                : calorieGoal.riskLevel === 'moderate'
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-green-500/30 bg-green-500/10'
            }`}
          >
            <p className="mb-2 text-sm text-slate-400">Your Personalized Goal</p>
            <p className="text-lg font-semibold text-slate-200">{calorieGoal.recommendation}</p>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500">Daily Deficit</p>
              <p className="text-2xl font-bold text-blue-400">{calorieGoal.dailyDeficitNeeded}</p>
              <p className="mt-1 text-xs text-slate-500">calories/day</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500">Weekly Deficit</p>
              <p className="text-2xl font-bold text-purple-400">{calorieGoal.weeklyDeficitNeeded}</p>
              <p className="mt-1 text-xs text-slate-500">calories/week</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500">Risk Level</p>
              <p
                className={`text-lg font-bold capitalize ${
                  calorieGoal.riskLevel === 'aggressive'
                    ? 'text-yellow-400'
                    : calorieGoal.riskLevel === 'moderate'
                      ? 'text-blue-400'
                      : 'text-green-400'
                }`}
              >
                {calorieGoal.riskLevel}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500">Maintenance</p>
              <p className="text-2xl font-bold text-slate-300">{calorieGoal.maintenance}</p>
              <p className="mt-1 text-xs text-slate-500">calories/day</p>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <p className="text-xs text-slate-400">Your Target</p>
              <p className="text-3xl font-bold text-blue-400">{calorieGoal.recommended}</p>
              <p className="mt-1 text-xs text-slate-400">calories/day</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500">Flexible Range</p>
              <p className="text-sm font-semibold text-slate-300">
                ± 200 <span className="text-xs">cal/day</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {calorieGoal.recommended - 200} - {calorieGoal.recommended + 200}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Steps to Calories Calculator */}
      {form.weight && (
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Navigation2 size={20} />
            Steps to Burn Calories
          </h2>

          <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">
              You burn approximately{' '}
              <span className="font-semibold text-blue-400">
                {metrics?.caloriesPerSession} calories
              </span>{' '}
              per 1,000 steps
            </p>
          </div>

          <form onSubmit={handleStepsCalculation} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                How many calories do you want to burn?
              </label>
              <input
                type="number"
                step="10"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder="250"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Calculate Steps
            </button>
          </form>

          {stepsResult && (
            <div className="mt-4 space-y-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <p className="text-sm text-slate-300">{stepsResult.detail}</p>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Steps</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stepsResult.steps.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Distance</p>
                  <p className="text-2xl font-bold text-green-400">{stepsResult.distance} km</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stepsResult.time} <span className="text-sm">min</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Weight Goal Timeline */}
      {timeline && form.goalWeight && (
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <TrendingDown size={20} />
            Weight Goal Timeline
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Target</p>
              <p className="text-lg font-semibold text-white">{timeline.target}</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Estimated Time</p>
              <p className="text-2xl font-bold text-blue-400">{timeline.months} months</p>
              <p className="mt-1 text-xs text-slate-500">({timeline.weeks} weeks)</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <p className="text-sm text-slate-400">Weekly Goal</p>
              <p className="text-2xl font-bold text-purple-400">0.5 kg/week</p>
              <p className="mt-1 text-xs text-slate-500">Sustainable pace</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-xs font-semibold text-slate-400">💡 TIP</p>
            <p className="mt-2 text-sm text-slate-300">
              A sustainable pace is 0.5-1 kg per week. This requires a calorie deficit of 500-1000
              calories per day through diet and exercise.
            </p>
          </div>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <BarChart3 size={20} />
          AI Trainer Tips
        </h2>

        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <div>
              <p className="font-semibold text-white">Track Consistently</p>
              <p>Update your weight regularly to see progress trends and adjust your goals</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <div>
              <p className="font-semibold text-white">Combine Diet & Exercise</p>
              <p>Use your calorie and step goals together for best results</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              3
            </span>
            <div>
              <p className="font-semibold text-white">Stay Within Calorie Range</p>
              <p>Aim for your target calories ±200 for flexibility while maintaining consistency</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              4
            </span>
            <div>
              <p className="font-semibold text-white">Use Steps & Calories Together</p>
              <p>Your daily steps directly contribute to your calorie burn goal</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
