import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import ToastMessage from '../components/common/ToastMessage'
import { addWorkout, setWorkouts } from '../redux/slices/workoutSlice'
import { formatDate } from '../utils/format'
import { workoutService } from '../services/workoutService'
import {
  defaultFavoriteExercises,
  exerciseLibrary,
  exerciseTutorials,
  workoutTemplates,
} from '../data/dummyData'

const emptyExercise = { name: '', sets: '', reps: '', weight: '' }
const toNonNegativeNumber = (value) => Math.max(0, Number(value) || 0)

export default function WorkoutsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const workouts = useSelector((state) => state.workouts.workouts)
  const [title, setTitle] = useState('')
  const [exercises, setExercises] = useState([{ ...emptyExercise }])
  const [selectedPreset, setSelectedPreset] = useState(exerciseLibrary[0].name)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('All')
  const [customTemplateName, setCustomTemplateName] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem('customWorkoutTemplates')
    if (!saved) {
      return []
    }

    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [favoriteExercises, setFavoriteExercises] = useState(() => {
    const saved = localStorage.getItem('favoriteExercises')
    if (!saved) {
      return defaultFavoriteExercises
    }

    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : defaultFavoriteExercises
    } catch {
      return defaultFavoriteExercises
    }
  })

  const exerciseGroups = useMemo(
    () => ['All', ...new Set(exerciseLibrary.map((item) => item.group))],
    [],
  )

  const filteredLibrary = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return exerciseLibrary.filter((item) => {
      const byGroup = selectedGroup === 'All' || item.group === selectedGroup
      const bySearch = !search || item.name.toLowerCase().includes(search)
      return byGroup && bySearch
    })
  }, [searchTerm, selectedGroup])

  const favoriteLibrary = useMemo(
    () => exerciseLibrary.filter((item) => favoriteExercises.includes(item.name)),
    [favoriteExercises],
  )
  const activeTutorial = exerciseTutorials[selectedPreset]

  const allTemplates = useMemo(() => [...workoutTemplates, ...customTemplates], [customTemplates])

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const { data } = await workoutService.getAll()
        const normalized = data.map((item) => ({
          ...item,
          id: item._id,
        }))
        dispatch(setWorkouts(normalized))
      } catch {
        // Local dummy state remains available when backend is offline.
      }
    }

    loadWorkouts()
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('favoriteExercises', JSON.stringify(favoriteExercises))
  }, [favoriteExercises])

  useEffect(() => {
    localStorage.setItem('customWorkoutTemplates', JSON.stringify(customTemplates))
  }, [customTemplates])

  useEffect(() => {
    const message = location.state?.toastMessage
    if (!message) {
      return
    }

    setToastMessage(message)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('')
    }, 2500)

    return () => clearTimeout(timeoutId)
  }, [toastMessage])

  const addExerciseInput = () => setExercises([...exercises, { ...emptyExercise }])

  const addPresetExercise = (presetName) => {
    const preset = exerciseLibrary.find((item) => item.name === presetName)
    if (!preset) {
      return
    }

    setExercises([
      ...exercises,
      {
        name: preset.name,
        sets: String(preset.defaultSets),
        reps: String(preset.defaultReps),
        weight: String(preset.defaultWeight),
      },
    ])
    setSelectedPreset(preset.name)
  }

  const openTutorial = (exerciseName) => {
    setSelectedPreset(exerciseName)
  }

  const addRoutineTemplate = (templateName) => {
    const template = allTemplates.find((item) => item.name === templateName)
    if (!template) {
      return
    }

    const mappedExercises = template.exercises
      .map((exerciseName) => {
        const preset = exerciseLibrary.find((item) => item.name === exerciseName)
        if (!preset) {
          return null
        }

        return {
          name: preset.name,
          sets: String(preset.defaultSets),
          reps: String(preset.defaultReps),
          weight: String(preset.defaultWeight),
        }
      })
      .filter(Boolean)

    if (!mappedExercises.length) {
      return
    }

    setTitle(template.name)
    setExercises(mappedExercises)
  }

  const saveCurrentAsTemplate = () => {
    const name = customTemplateName.trim()
    if (!name) {
      return
    }

    const exerciseNames = exercises
      .map((item) => item.name.trim())
      .filter(Boolean)

    if (!exerciseNames.length) {
      return
    }

    const deduped = [...new Set(exerciseNames)]
    const template = {
      name,
      exercises: deduped,
    }

    setCustomTemplates((prev) => {
      const filtered = prev.filter((item) => item.name.toLowerCase() !== name.toLowerCase())
      return [template, ...filtered]
    })

    setCustomTemplateName('')
  }

  const removeTemplate = (templateName) => {
    setCustomTemplates((prev) => prev.filter((item) => item.name !== templateName))
  }

  const toggleFavorite = (exerciseName) => {
    if (favoriteExercises.includes(exerciseName)) {
      setFavoriteExercises(favoriteExercises.filter((name) => name !== exerciseName))
      return
    }
    setFavoriteExercises([...favoriteExercises, exerciseName])
  }

  const updateExercise = (index, key, value) => {
    if (value !== '' && Number(value) < 0) {
      return
    }

    const updated = [...exercises]
    updated[index][key] = value
    setExercises(updated)
  }

  const replaceExercise = (index, presetName) => {
    const preset = exerciseLibrary.find((item) => item.name === presetName)
    if (!preset) {
      return
    }

    const updated = [...exercises]
    updated[index] = {
      name: preset.name,
      sets: String(preset.defaultSets),
      reps: String(preset.defaultReps),
      weight: String(preset.defaultWeight),
    }
    setExercises(updated)
  }

  const removeExercise = (index) => {
    setExercises((prev) => {
      if (prev.length === 1) {
        return [{ ...emptyExercise }]
      }
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const onDragStartExercise = (index) => {
    setDragIndex(index)
  }

  const onDropExercise = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      return
    }

    setExercises((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(dragIndex, 1)
      updated.splice(dropIndex, 0, moved)
      return updated
    })
    setDragIndex(null)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const normalized = exercises
      .filter((exercise) => exercise.name)
      .map((exercise) => ({
        ...exercise,
        sets: toNonNegativeNumber(exercise.sets),
        reps: toNonNegativeNumber(exercise.reps),
        weight: toNonNegativeNumber(exercise.weight),
      }))

    if (!title || normalized.length === 0) {
      return
    }

    const payload = {
      title,
      date: new Date().toISOString(),
      calories: 300 + normalized.length * 40,
      exercises: normalized,
    }

    try {
      const { data } = await workoutService.create(payload)
      const savedWorkout = { ...data, id: data._id }
      dispatch(addWorkout(savedWorkout))
      navigate(`/workouts/${savedWorkout.id}`)
    } catch {
      const localWorkout = {
        id: crypto.randomUUID(),
        ...payload,
      }
      dispatch(
        addWorkout(localWorkout),
      )
      navigate(`/workouts/${localWorkout.id}`)
    }

    setTitle('')
    setExercises([{ ...emptyExercise }])
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card title="Log Workout" subtitle="Add exercises with sets, reps, and weight">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Workout name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="auth-input"
              placeholder="Pull Day"
            />
          </label>
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-3">
            <p className="mb-3 text-xs uppercase tracking-widest text-red-200/80">Exercise Library</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {workoutTemplates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => addRoutineTemplate(template.name)}
                  className="rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-1.5 text-xs text-red-200 transition hover:border-red-500/80 hover:text-white"
                >
                  {template.name}
                </button>
              ))}
            </div>

            {customTemplates.length > 0 && (
              <div className="mb-3 rounded-lg border border-slate-700/70 p-2">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Custom Templates</p>
                <div className="flex flex-wrap gap-2">
                  {customTemplates.map((template) => (
                    <div key={`custom-template-${template.name}`} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => addRoutineTemplate(template.name)}
                        className="text-xs text-slate-200 transition hover:text-white"
                      >
                        {template.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTemplate(template.name)}
                        className="text-xs text-red-300 transition hover:text-red-200"
                        aria-label={`Delete ${template.name} template`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                value={customTemplateName}
                onChange={(event) => setCustomTemplateName(event.target.value)}
                className="auth-input"
                placeholder="Save current workout as template"
              />
              <button
                type="button"
                onClick={saveCurrentAsTemplate}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white"
              >
                Save Template
              </button>
            </div>

            <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="auth-input"
                placeholder="Search exercise (e.g. squat, row)"
              />
              <select
                value={selectedGroup}
                onChange={(event) => setSelectedGroup(event.target.value)}
                className="auth-input w-full md:w-44"
              >
                {exerciseGroups.map((group) => (
                  <option key={group} value={group} className="bg-slate-900">
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {favoriteLibrary.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Favorites</p>
                <div className="flex flex-wrap gap-2">
                  {favoriteLibrary.map((item) => (
                    <div key={`fav-${item.name}`} className="flex items-center gap-1 rounded-lg border border-red-500/60 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => addPresetExercise(item.name)}
                        className="text-xs text-red-200 transition hover:text-white"
                      >
                        {item.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => openTutorial(item.name)}
                        className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300 transition hover:border-red-500/70 hover:text-white"
                      >
                        Demo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {filteredLibrary.slice(0, 12).map((item) => (
                <div key={item.name} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => addPresetExercise(item.name)}
                    className="text-xs text-slate-200 transition hover:text-white"
                  >
                    {item.name} <span className="text-slate-400">({item.group})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openTutorial(item.name)}
                    className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300 transition hover:border-red-500/70 hover:text-white"
                  >
                    Demo
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {filteredLibrary.slice(0, 12).map((item) => (
                <button
                  key={`fav-toggle-${item.name}`}
                  type="button"
                  onClick={() => toggleFavorite(item.name)}
                  className={`rounded-md px-2 py-1 text-[11px] transition ${
                    favoriteExercises.includes(item.name)
                      ? 'border border-red-600 bg-red-950/50 text-red-200'
                      : 'border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {favoriteExercises.includes(item.name) ? 'Unfavorite' : 'Favorite'} {item.name}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <select
                value={selectedPreset}
                onChange={(event) => setSelectedPreset(event.target.value)}
                className="auth-input w-auto min-w-56"
              >
                {exerciseLibrary.map((item) => (
                  <option key={item.name} value={item.name} className="bg-slate-900">
                    {item.group} - {item.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addPresetExercise(selectedPreset)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white"
              >
                Add from Library
              </button>
              <button
                type="button"
                onClick={() => openTutorial(selectedPreset)}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-red-500/70 hover:text-white"
              >
                View Demo
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-3">
              <p className="mb-2 text-xs uppercase tracking-widest text-red-200/80">
                Tutorial Demo: {selectedPreset}
              </p>
              {activeTutorial ? (
                <>
                  <div className="aspect-video overflow-hidden rounded-lg border border-slate-700">
                    <iframe
                      title={`${selectedPreset} tutorial`}
                      src={activeTutorial.embedUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
                    {activeTutorial.cues.map((cue) => (
                      <li key={`${selectedPreset}-${cue}`}>{cue}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-slate-400">No tutorial available for this exercise yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div
                key={`exercise-${index}`}
                draggable
                onDragStart={() => onDragStartExercise(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDropExercise(index)}
                onDragEnd={() => setDragIndex(null)}
                className={`rounded-xl border p-3 ${
                  dragIndex === index ? 'border-red-500/80 bg-red-950/20' : 'border-slate-700/70'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Drag to reorder</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={exercise.name || selectedPreset}
                      onChange={(event) => replaceExercise(index, event.target.value)}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    >
                      {exerciseLibrary.map((item) => (
                        <option key={`replace-${item.name}`} value={item.name} className="bg-slate-900">
                          Replace: {item.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="rounded-md border border-red-800/70 px-2 py-1 text-xs text-red-300 transition hover:border-red-500 hover:text-red-200"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => openTutorial(exercise.name || selectedPreset)}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-red-500/70 hover:text-white"
                    >
                      Demo
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-4">
                  <input
                    value={exercise.name}
                    onChange={(event) => updateExercise(index, 'name', event.target.value)}
                    className="auth-input"
                    placeholder="Exercise"
                  />
                  <input
                    value={exercise.sets}
                    min="0"
                    step="1"
                    onChange={(event) => updateExercise(index, 'sets', event.target.value)}
                    type="number"
                    className="auth-input"
                    placeholder="Sets"
                  />
                  <input
                    value={exercise.reps}
                    min="0"
                    step="1"
                    onChange={(event) => updateExercise(index, 'reps', event.target.value)}
                    type="number"
                    className="auth-input"
                    placeholder="Reps"
                  />
                  <input
                    value={exercise.weight}
                    min="0"
                    step="0.5"
                    onChange={(event) => updateExercise(index, 'weight', event.target.value)}
                    type="number"
                    className="auth-input"
                    placeholder="Weight"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={addExerciseInput} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200">
              Add Exercise
            </button>
            <button type="submit" className="auth-button w-auto px-6">
              Save Workout
            </button>
          </div>
        </form>
        </Card>

        <Card title="Workout History">
          <div className="space-y-3">
            {workouts.map((workout) => (
              <article
                key={workout.id || workout._id}
                onClick={() => navigate(`/workouts/${workout.id || workout._id}`)}
                className="cursor-pointer rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 transition hover:border-red-500/60"
              >
                <h3 className="font-semibold text-white">{workout.title}</h3>
                <p className="text-xs text-slate-400">{formatDate(workout.date)}</p>
                <p className="mt-2 text-sm text-slate-300">{workout.exercises.length} exercises</p>
                <ul className="mt-3 space-y-1 text-xs text-slate-400">
                  {workout.exercises.map((exercise) => (
                    <li key={`${workout.id || workout._id}-${exercise.name}`}>
                      {exercise.name}: {exercise.sets}x{exercise.reps} @ {exercise.weight}kg
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-red-300">Click to view or edit this workout</p>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <ToastMessage message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  )
}
