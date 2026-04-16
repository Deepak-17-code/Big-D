import StepEntry from '../models/StepEntry.js'

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const validDays = new Set(dayOrder)

export async function getSteps(req, res) {
  const entries = await StepEntry.find({ user: req.user._id })
  entries.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  res.json(entries)
}

export async function upsertSteps(req, res) {
  const { day, steps } = req.body
  if (!day || steps === undefined) {
    res.status(400)
    throw new Error('Day and steps are required.')
  }

  const normalizedDay = String(day).trim()
  if (!validDays.has(normalizedDay)) {
    res.status(400)
    throw new Error('Day must be one of Mon, Tue, Wed, Thu, Fri, Sat, Sun.')
  }

  const normalizedSteps = Number(steps)
  if (!Number.isFinite(normalizedSteps) || normalizedSteps < 0) {
    res.status(400)
    throw new Error('Steps must be a non-negative number.')
  }

  const entry = await StepEntry.findOneAndUpdate(
    { user: req.user._id, day: normalizedDay },
    { steps: normalizedSteps },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  res.status(201).json(entry)
}

export async function updateSteps(req, res) {
  const { day, steps } = req.body
  if (!day || steps === undefined) {
    res.status(400)
    throw new Error('Day and steps are required.')
  }

  const normalizedDay = String(day).trim()
  if (!validDays.has(normalizedDay)) {
    res.status(400)
    throw new Error('Day must be one of Mon, Tue, Wed, Thu, Fri, Sat, Sun.')
  }

  const normalizedSteps = Number(steps)
  if (!Number.isFinite(normalizedSteps) || normalizedSteps < 0) {
    res.status(400)
    throw new Error('Steps must be a non-negative number.')
  }

  const existingEntry = await StepEntry.findOne({ _id: req.params.id, user: req.user._id })
  if (!existingEntry) {
    res.status(404)
    throw new Error('Step entry not found.')
  }

  const duplicateDay = await StepEntry.findOne({
    _id: { $ne: existingEntry._id },
    user: req.user._id,
    day: normalizedDay,
  })

  if (duplicateDay) {
    res.status(400)
    throw new Error(`An entry for ${normalizedDay} already exists.`)
  }

  existingEntry.day = normalizedDay
  existingEntry.steps = normalizedSteps
  await existingEntry.save()

  res.json(existingEntry)
}

export async function deleteSteps(req, res) {
  const existingEntry = await StepEntry.findOne({ _id: req.params.id, user: req.user._id })
  if (!existingEntry) {
    res.status(404)
    throw new Error('Step entry not found.')
  }

  await existingEntry.deleteOne()
  res.json({ message: 'Step entry deleted successfully.' })
}

export async function getWeeklyAnalytics(req, res) {
  const entries = await StepEntry.find({ user: req.user._id })
  const total = entries.reduce((sum, item) => sum + item.steps, 0)
  const average = entries.length ? Math.round(total / entries.length) : 0

  res.json({
    total,
    average,
    daysTracked: entries.length,
  })
}
