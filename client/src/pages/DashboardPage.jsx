import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import SocialLinks from '../components/common/SocialLinks'
import LineChartCard from '../components/charts/LineChartCard'
import BarChartCard from '../components/charts/BarChartCard'
import { formatDate } from '../utils/format'

export default function DashboardPage() {
  const workouts = useSelector((state) => state.workouts.workouts)
  const calories = useSelector((state) => state.nutrition.caloriesByDay)
  const steps = useSelector((state) => state.steps.stepsByDay)
  const posts = useSelector((state) => state.feed.posts)

  const totalCaloriesBurned = useMemo(
    () => workouts.reduce((sum, workout) => sum + workout.calories, 0),
    [workouts],
  )

  const avgSteps = useMemo(
    () => (steps.length ? Math.round(steps.reduce((sum, entry) => sum + entry.steps, 0) / steps.length) : 0),
    [steps],
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Workouts" value={workouts.length} hint="This month" />
        <StatCard label="Calories Burned" value={totalCaloriesBurned} hint="kcal total" />
        <StatCard label="Average Steps" value={avgSteps} hint="daily average" />
        <StatCard label="Feed Posts" value={posts.length} hint="community updates" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LineChartCard
          title="Calories Intake"
          subtitle="Daily nutrition trend"
          data={calories}
          xKey="date"
          dataKey="calories"
          stroke="#4f8dff"
        />
        <BarChartCard
          title="Step Count"
          subtitle="Weekly progress"
          data={steps}
          xKey="day"
          dataKey="steps"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent Workouts">
          <ul className="space-y-4">
            {workouts.slice(0, 4).map((workout) => (
              <li key={workout.id} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{workout.title}</h4>
                    <p className="text-sm text-slate-300">{formatDate(workout.date)}</p>
                  </div>
                  <p className="text-sm text-sky-300">{workout.calories} kcal</p>
                </div>
                <p className="mt-3 text-sm text-slate-400">{workout.exercises.length} exercises logged</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Progress Feed">
          <ul className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <li key={post.id} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{post.user.name}</h4>
                    <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-200">{post.caption}</p>
                <SocialLinks socialLinks={post.user?.socialLinks} className="mt-3" />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}
