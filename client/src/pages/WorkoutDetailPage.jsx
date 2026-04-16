import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../components/common/Card'
import ConfirmModal from '../components/common/ConfirmModal'
import LineChartCard from '../components/charts/LineChartCard'
import { formatDate } from '../utils/format'
import { addWorkout, deleteWorkout, updateWorkout } from '../redux/slices/workoutSlice'
import { workoutService } from '../services/workoutService'

const emptyExercise = { name: '', sets: '', reps: '', weight: '' }
const toNonNegativeNumber = (value) => Math.max(0, Number(value) || 0)

function normalizeWorkout(workout) {
  if (!workout) {
    return null
  }

  return {
    ...workout,
    id: workout.id || workout._id,
    createdAt: workout.createdAt || workout.date,
    date: workout.date || workout.createdAt,
    exercises: (workout.exercises || []).map((exercise) => ({
      name: exercise.name || '',
      sets: String(exercise.sets ?? ''),
      reps: String(exercise.reps ?? ''),
      weight: String(exercise.weight ?? ''),
    })),
  }
}

function calculateVolume(workout) {
  return (workout?.exercises || []).reduce(
    (sum, exercise) =>
      sum +
      toNonNegativeNumber(exercise.sets) *
        toNonNegativeNumber(exercise.reps) *
        toNonNegativeNumber(exercise.weight),
    0,
  )
}

export default function WorkoutDetailPage() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const workouts = useSelector((state) => state.workouts.workouts)
  const [workout, setWorkout] = useState(null)
  const [draft, setDraft] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState('')
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false)

  const fallbackWorkout = useMemo(
    () => normalizeWorkout(workouts.find((item) => item.id === workoutId || item._id === workoutId) || null),
    [workouts, workoutId],
  )

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const { data } = await workoutService.getById(workoutId)
        const normalized = normalizeWorkout(data)
        setWorkout(normalized)
        setDraft(normalized)
      } catch {
        setWorkout(fallbackWorkout)
        setDraft(fallbackWorkout)
      }
    }

    loadWorkout()
  }, [fallbackWorkout, workoutId])

  const activeWorkout = workout || fallbackWorkout
  const editableWorkout = draft || activeWorkout

  const previousWorkout = useMemo(() => {
    if (!activeWorkout) {
      return null
    }

    const currentTime = new Date(activeWorkout.createdAt || activeWorkout.date || 0).getTime()
    const workoutHistory = workouts
      .map((item) => normalizeWorkout(item))
      .filter((item) => item && item.id !== activeWorkout.id)
      .filter((item) => new Date(item.createdAt || item.date || 0).getTime() < currentTime)
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))

    const sameTitleWorkout = workoutHistory.find((item) => item.title === activeWorkout.title)
    return sameTitleWorkout || workoutHistory[0] || null
  }, [activeWorkout, workouts])

  const currentVolume = useMemo(() => calculateVolume(editableWorkout), [editableWorkout])
  const previousVolume = useMemo(() => calculateVolume(previousWorkout), [previousWorkout])

  const comparison = useMemo(() => {
    if (!previousWorkout || !editableWorkout) {
      return null
    }

    return {
      volumeDiff: currentVolume - previousVolume,
      exerciseDiff: (editableWorkout.exercises?.length || 0) - (previousWorkout.exercises?.length || 0),
    }
  }, [currentVolume, editableWorkout, previousVolume, previousWorkout])

  const comparisonSeries = useMemo(
    () => [
      { label: previousWorkout ? 'Previous' : 'Saved', volume: previousVolume, exercises: previousWorkout?.exercises?.length || 0 },
      { label: 'Current', volume: currentVolume, exercises: editableWorkout?.exercises?.length || 0 },
    ],
    [currentVolume, editableWorkout, previousVolume, previousWorkout],
  )

  const exerciseProgress = useMemo(
    () =>
      (editableWorkout?.exercises || []).map((exercise) => {
        const previousExercise = previousWorkout?.exercises?.find((item) => item.name === exercise.name)

        return {
          ...exercise,
          previousWeight: previousExercise ? toNonNegativeNumber(previousExercise.weight) : null,
          previousSets: previousExercise ? toNonNegativeNumber(previousExercise.sets) : null,
          previousReps: previousExercise ? toNonNegativeNumber(previousExercise.reps) : null,
          isWeightPR:
            previousExercise !== undefined && toNonNegativeNumber(exercise.weight) > toNonNegativeNumber(previousExercise.weight),
          isVolumePR:
            previousExercise !== undefined &&
            toNonNegativeNumber(exercise.sets) * toNonNegativeNumber(exercise.reps) * toNonNegativeNumber(exercise.weight) >
              toNonNegativeNumber(previousExercise.sets) * toNonNegativeNumber(previousExercise.reps) * toNonNegativeNumber(previousExercise.weight),
        }
      }),
    [editableWorkout, previousWorkout],
  )

  const updateDraftField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const updateDraftExercise = (index, field, value) => {
    if (field !== 'name' && value !== '' && Number(value) < 0) {
      return
    }

    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise,
      ),
    }))
  }

  const addExerciseRow = () => {
    setDraft((current) => ({
      ...current,
      exercises: [...current.exercises, { ...emptyExercise }],
    }))
  }

  const removeExerciseRow = (index) => {
    setDraft((current) => ({
      ...current,
      exercises:
        current.exercises.length === 1
          ? [{ ...emptyExercise }]
          : current.exercises.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const startEditing = () => {
    if (!editableWorkout) {
      return
    }

    setDraft(editableWorkout)
    setIsEditing(true)
    setError('')
    setStatusMessage('')
  }

  const cancelEditing = () => {
    setDraft(activeWorkout)
    setIsEditing(false)
    setError('')
  }

  const handleDelete = async () => {
    if (!activeWorkout) {
      return
    }

    try {
      setIsDeletingWorkout(true)
      await workoutService.remove(activeWorkout.id)
      dispatch(deleteWorkout(activeWorkout.id))
      navigate('/workouts', {
        state: {
          toastMessage: 'Workout deleted successfully.',
        },
      })
    } catch {
      setError('Could not delete this workout.')
    } finally {
      setIsDeletingWorkout(false)
    }
  }

  const onDeleteClick = () => {
    if (!activeWorkout) {
      return
    }

    setPendingDeleteWorkoutId(activeWorkout.id)
  }

  const onCancelDelete = () => {
    setPendingDeleteWorkoutId('')
  }

  const onConfirmDelete = async () => {
    if (!pendingDeleteWorkoutId) {
      return
    }

    setPendingDeleteWorkoutId('')
    await handleDelete()
  }

  const handleDuplicate = async () => {
    if (!activeWorkout) {
      return
    }

    const payload = {
      title: `${activeWorkout.title} Copy`,
      calories: toNonNegativeNumber(activeWorkout.calories),
      exercises: (activeWorkout.exercises || []).map((exercise) => ({
        name: exercise.name,
        sets: toNonNegativeNumber(exercise.sets),
        reps: toNonNegativeNumber(exercise.reps),
        weight: toNonNegativeNumber(exercise.weight),
      })),
      date: new Date().toISOString(),
    }

    try {
      const { data } = await workoutService.create(payload)
      const duplicatedWorkout = normalizeWorkout({ ...data, id: data._id })
      dispatch(addWorkout(duplicatedWorkout))
      navigate(`/workouts/${duplicatedWorkout.id}`)
    } catch {
      const duplicatedWorkout = normalizeWorkout({
        id: crypto.randomUUID(),
        ...payload,
      })
      dispatch(addWorkout(duplicatedWorkout))
      navigate(`/workouts/${duplicatedWorkout.id}`)
    }
  }

  const handleSave = async () => {
    if (!draft || !activeWorkout) {
      return
    }

    const normalizedExercises = draft.exercises
      .filter((exercise) => exercise.name.trim())
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: toNonNegativeNumber(exercise.sets),
        reps: toNonNegativeNumber(exercise.reps),
        weight: toNonNegativeNumber(exercise.weight),
      }))

    if (!draft.title.trim() || !normalizedExercises.length) {
      setError('Workout title and at least one exercise are required.')
      return
    }

    const payload = {
      title: draft.title.trim(),
      calories: toNonNegativeNumber(draft.calories),
      exercises: normalizedExercises,
      date: draft.date || draft.createdAt || new Date().toISOString(),
    }

    try {
      const { data } = await workoutService.update(activeWorkout.id, payload)
      const updatedWorkout = normalizeWorkout({ ...data, id: data._id })
      setWorkout(updatedWorkout)
      setDraft(updatedWorkout)
      dispatch(updateWorkout(updatedWorkout))
      setIsEditing(false)
      setError('')
      setStatusMessage('Workout updated successfully.')
    } catch {
      const localWorkout = normalizeWorkout({
        ...activeWorkout,
        ...payload,
      })
      setWorkout(localWorkout)
      setDraft(localWorkout)
      dispatch(updateWorkout(localWorkout))
      setIsEditing(false)
      setError('')
      setStatusMessage('Workout updated locally.')
    }
  }

  if (!activeWorkout || !editableWorkout) {
    return (
      <Card title="Workout not found">
        <p className="text-sm text-slate-300">This workout could not be loaded.</p>
        <Link
          to="/workouts"
          className="mt-4 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
        >
          Back to Workouts
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card title={isEditing ? 'Edit Workout' : editableWorkout.title} subtitle={formatDate(editableWorkout.date || editableWorkout.createdAt)}>
        <div className="space-y-4">
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {statusMessage && <p className="text-sm text-emerald-300">{statusMessage}</p>}

          {isEditing ? (
            <div className="space-y-4">
              <label className="block text-sm text-slate-300">
                Workout title
                <input
                  className="auth-input"
                  value={draft.title}
                  onChange={(event) => updateDraftField('title', event.target.value)}
                  placeholder="Workout title"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Calories burned
                <input
                  className="auth-input"
                  type="number"
                  min="0"
                  step="1"
                  value={draft.calories}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === '' || Number(value) >= 0) {
                      updateDraftField('calories', value)
                    }
                  }}
                  placeholder="Calories"
                />
              </label>

              <div className="space-y-3">
                {draft.exercises.map((exercise, index) => (
                  <div key={`${editableWorkout.id}-${exercise.name}-${index}`} className="rounded-xl border border-slate-700/70 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-widest text-slate-400">Exercise {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeExerciseRow(index)}
                        className="rounded-md border border-red-800/70 px-2 py-1 text-xs text-red-300 transition hover:border-red-500 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-4">
                      <input
                        className="auth-input"
                        value={exercise.name}
                        onChange={(event) => updateDraftExercise(index, 'name', event.target.value)}
                        placeholder="Exercise name"
                      />
                      <input
                        className="auth-input"
                        type="number"
                        min="0"
                        step="1"
                        value={exercise.sets}
                        onChange={(event) => {
                          const value = event.target.value
                          if (value === '' || Number(value) >= 0) {
                            updateDraftExercise(index, 'sets', value)
                          }
                        }}
                        placeholder="Sets"
                      />
                      <input
                        className="auth-input"
                        type="number"
                        min="0"
                        step="1"
                        value={exercise.reps}
                        onChange={(event) => {
                          const value = event.target.value
                          if (value === '' || Number(value) >= 0) {
                            updateDraftExercise(index, 'reps', value)
                          }
                        }}
                        placeholder="Reps"
                      />
                      <input
                        className="auth-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={exercise.weight}
                        onChange={(event) => {
                          const value = event.target.value
                          if (value === '' || Number(value) >= 0) {
                            updateDraftExercise(index, 'weight', value)
                          }
                        }}
                        placeholder="Weight"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addExerciseRow}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white"
                >
                  Add Exercise
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="auth-button w-auto px-6"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Calories burned: <span className="font-semibold text-white">{editableWorkout.calories}</span>
              </p>
              <p className="text-sm text-slate-300">
                Exercises: <span className="font-semibold text-white">{editableWorkout.exercises?.length || 0}</span>
              </p>

              <div className="space-y-3">
                {exerciseProgress.map((exercise) => (
                  <article key={`${editableWorkout.id}-${exercise.name}`} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-white">{exercise.name}</h3>
                        <p className="mt-1 text-sm text-slate-300">
                          {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight}kg
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exercise.isWeightPR && (
                          <span className="rounded-full border border-red-500/60 bg-red-950/50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-red-200">
                            Weight PR
                          </span>
                        )}
                        {exercise.isVolumePR && (
                          <span className="rounded-full border border-emerald-500/60 bg-emerald-950/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                            Volume PR
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="auth-button w-auto px-6"
                >
                  Edit Workout
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500 hover:text-white"
                >
                  Duplicate Workout
                </button>
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-200 transition hover:border-red-500 hover:text-white"
                >
                  Delete Workout
                </button>
                <Link
                  to="/workouts"
                  className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500 hover:text-white"
                >
                  Back to Workout History
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <LineChartCard
          title="Session Timeline"
          subtitle="Previous vs current session"
          data={comparisonSeries}
          xKey="label"
          dataKey="volume"
          stroke="#ef4444"
        />

        <Card title="Workout History Snapshot" subtitle="Session comparison">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-300">Current volume</p>
              <p className="text-2xl font-bold text-white">{currentVolume}</p>
            </div>

            {previousWorkout ? (
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-300">Previous session</p>
                <h3 className="mt-1 text-base font-semibold text-white">{previousWorkout.title}</h3>
                <p className="text-xs text-slate-400">{formatDate(previousWorkout.date || previousWorkout.createdAt)}</p>
                <p className="mt-3 text-sm text-slate-300">
                  Volume: <span className="font-semibold text-white">{previousVolume}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Delta:{' '}
                  <span className={`font-semibold ${comparison?.volumeDiff >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {comparison?.volumeDiff >= 0 ? '+' : ''}{comparison?.volumeDiff || 0}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Exercise count delta:{' '}
                  <span className={`font-semibold ${comparison?.exerciseDiff >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {comparison?.exerciseDiff >= 0 ? '+' : ''}{comparison?.exerciseDiff || 0}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">No previous workout found to compare against yet.</p>
            )}

            <Link
              to="/workouts"
              className="inline-flex rounded-lg border border-red-700 px-4 py-2 text-sm text-red-200 transition hover:border-red-500 hover:text-white"
            >
              Back to Workout History
            </Link>
          </div>
        </Card>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteWorkoutId)}
        title="Delete this workout?"
        message="This will permanently remove the workout from your history."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        confirmLoading={isDeletingWorkout}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </div>
  )
}
