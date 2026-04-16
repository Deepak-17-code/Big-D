import Workout from '../models/Workout.js'

const toNonNegativeNumber = (value) => Math.max(0, Number(value) || 0)

function normalizeExercises(exercises) {
  if (!Array.isArray(exercises)) {
    return []
  }

  return exercises.map((exercise) => ({
    name: exercise.name,
    sets: toNonNegativeNumber(exercise.sets),
    reps: toNonNegativeNumber(exercise.reps),
    weight: toNonNegativeNumber(exercise.weight),
  }))
}

function hasNegativeExerciseValue(exercises) {
  return Array.isArray(exercises)
    && exercises.some(
      (exercise) =>
        Number(exercise.sets) < 0 || Number(exercise.reps) < 0 || Number(exercise.weight) < 0,
    )
}

export async function getWorkouts(req, res) {
  const workouts = await Workout.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(workouts)
}

export async function getWorkoutById(req, res) {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id })

  if (!workout) {
    res.status(404)
    throw new Error('Workout not found.')
  }

  res.json(workout)
}

export async function createWorkout(req, res) {
  const { title, calories, exercises, date } = req.body
  if (!title) {
    res.status(400)
    throw new Error('Workout title is required.')
  }

  if (hasNegativeExerciseValue(exercises)) {
    res.status(400)
    throw new Error('Exercise sets, reps, and weight must be non-negative numbers.')
  }

  const workout = await Workout.create({
    user: req.user._id,
    title,
    calories,
    exercises: normalizeExercises(exercises),
    date: date || new Date(),
  })

  res.status(201).json(workout)
}

export async function updateWorkout(req, res) {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id })

  if (!workout) {
    res.status(404)
    throw new Error('Workout not found.')
  }

  const { title, calories, exercises, date } = req.body

  if (hasNegativeExerciseValue(exercises)) {
    res.status(400)
    throw new Error('Exercise sets, reps, and weight must be non-negative numbers.');
  }

  workout.title = title ?? workout.title
  workout.calories = calories ?? workout.calories
  workout.exercises = exercises ? normalizeExercises(exercises) : workout.exercises
  workout.date = date ?? workout.date

  await workout.save()
  res.json(workout)
}

export async function deleteWorkout(req, res) {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id })

  if (!workout) {
    res.status(404)
    throw new Error('Workout not found.')
  }

  await workout.deleteOne()
  res.json({ message: 'Workout deleted.' })
}
