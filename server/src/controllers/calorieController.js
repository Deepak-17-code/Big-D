import CalorieEntry from '../models/CalorieEntry.js'

const validDays = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

export async function getCalories(req, res) {
  const entries = await CalorieEntry.find({ user: req.user._id }).sort({ day: 1 })
  res.json(entries)
}

export async function upsertCalories(req, res) {
  const { day, calories } = req.body
  if (!day || calories === undefined) {
    res.status(400)
    throw new Error('Day and calories are required.')
  }

  const normalizedDay = String(day).trim()
  if (!validDays.has(normalizedDay)) {
    res.status(400)
    throw new Error('Day must be one of Mon, Tue, Wed, Thu, Fri, Sat, Sun.')
  }

  const normalizedCalories = Number(calories)
  if (!Number.isFinite(normalizedCalories) || normalizedCalories < 0) {
    res.status(400)
    throw new Error('Calories must be a non-negative number.')
  }

  const entry = await CalorieEntry.findOneAndUpdate(
    { user: req.user._id, day: normalizedDay },
    { calories: normalizedCalories },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  res.status(201).json(entry)
}

export async function updateCalories(req, res) {
  const { day, calories } = req.body
  if (!day || calories === undefined) {
    res.status(400)
    throw new Error('Day and calories are required.')
  }

  const normalizedDay = String(day).trim()
  if (!validDays.has(normalizedDay)) {
    res.status(400)
    throw new Error('Day must be one of Mon, Tue, Wed, Thu, Fri, Sat, Sun.')
  }

  const normalizedCalories = Number(calories)
  if (!Number.isFinite(normalizedCalories) || normalizedCalories < 0) {
    res.status(400)
    throw new Error('Calories must be a non-negative number.')
  }

  const existingEntry = await CalorieEntry.findOne({ _id: req.params.id, user: req.user._id })
  if (!existingEntry) {
    res.status(404)
    throw new Error('Calorie entry not found.')
  }

  const duplicateDay = await CalorieEntry.findOne({
    _id: { $ne: existingEntry._id },
    user: req.user._id,
    day: normalizedDay,
  })

  if (duplicateDay) {
    res.status(400)
    throw new Error(`An entry for ${normalizedDay} already exists.`)
  }

  existingEntry.day = normalizedDay
  existingEntry.calories = normalizedCalories
  await existingEntry.save()

  res.json(existingEntry)
}

export async function deleteCalories(req, res) {
  const existingEntry = await CalorieEntry.findOne({ _id: req.params.id, user: req.user._id })
  if (!existingEntry) {
    res.status(404)
    throw new Error('Calorie entry not found.')
  }

  await existingEntry.deleteOne()
  res.json({ message: 'Calorie entry deleted successfully.' })
}
