import User from '../models/User.js'
import { cloudinary } from '../config/cloudinary.js'

const socialLinkKeys = ['instagram', 'x', 'youtube', 'tiktok', 'website']

function normalizeSocialUrl(value, platform) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  const stripped = raw.replace(/^@/, '')

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${stripped}`
    case 'x':
      return `https://x.com/${stripped}`
    case 'youtube':
      return `https://youtube.com/@${stripped.replace(/^@/, '')}`
    case 'tiktok':
      return `https://tiktok.com/@${stripped}`
    default:
      return raw
  }
}

function normalizeSocialLinks(input = {}) {
  return socialLinkKeys.reduce((links, key) => {
    links[key] = normalizeSocialUrl(input[key], key)
    return links
  }, {})
}

export async function getMe(req, res) {
  res.json({ user: req.user })
}

export async function updateMe(req, res) {
  const { name, avatar, bio, goal, socialLinks = {} } = req.body

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  user.name = name || user.name
  user.avatar = avatar || user.avatar
  user.bio = bio || user.bio
  user.goal = goal || user.goal
  user.socialLinks = {
    ...(user.socialLinks || {}),
    ...normalizeSocialLinks(socialLinks),
  }

  await user.save()
  res.json({ user })
}

export async function uploadAvatar(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Avatar file is required.')
  }

  if (!req.file.mimetype?.startsWith('image/')) {
    res.status(400)
    throw new Error('Only image files are allowed for avatar upload.')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: 'hevyx-avatars',
    resource_type: 'image',
  })

  user.avatar = uploadResult.secure_url
  await user.save()

  res.json({ user })
}

export async function updateMetrics(req, res) {
  const { weight, height, goalWeight, goalTimelineWeeks } = req.body

  // Validate inputs
  if (weight !== undefined && (typeof weight !== 'number' || weight <= 0)) {
    res.status(400)
    throw new Error('Weight must be a positive number')
  }

  if (height !== undefined && (typeof height !== 'number' || height <= 0)) {
    res.status(400)
    throw new Error('Height must be a positive number')
  }

  if (goalWeight !== undefined && goalWeight !== null && (typeof goalWeight !== 'number' || goalWeight <= 0)) {
    res.status(400)
    throw new Error('Goal weight must be a positive number or null')
  }

  if (goalTimelineWeeks !== undefined && goalTimelineWeeks !== null && (typeof goalTimelineWeeks !== 'number' || goalTimelineWeeks <= 0)) {
    res.status(400)
    throw new Error('Goal timeline must be a positive number of weeks or null')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  // Update metrics
  if (weight !== undefined) {
    user.weight = weight

    // Add to weight history
    if (!user.weightHistory) {
      user.weightHistory = []
    }
    user.weightHistory.push({
      weight,
      date: new Date(),
    })
  }

  if (height !== undefined) {
    user.height = height
  }

  if (goalWeight !== undefined) {
    user.goalWeight = goalWeight
  }

  if (goalTimelineWeeks !== undefined) {
    user.goalTimelineWeeks = goalTimelineWeeks
  }

  await user.save()
  res.json({ user })
}

export async function getAssistantChatHistory(req, res) {
  res.json({
    history: Array.isArray(req.user.assistantChatHistory) ? req.user.assistantChatHistory : [],
  })
}

export async function saveAssistantChatHistory(req, res) {
  const { history } = req.body

  if (!Array.isArray(history)) {
    res.status(400)
    throw new Error('History must be an array.')
  }

  const sanitizedHistory = history
    .filter((entry) => entry && (entry.role === 'user' || entry.role === 'assistant'))
    .map((entry) => ({
      role: entry.role,
      content: String(entry.content || '').trim(),
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
    }))
    .filter((entry) => entry.content)
    .slice(-30)

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  user.assistantChatHistory = sanitizedHistory
  await user.save()

  res.json({ history: user.assistantChatHistory })
}

export async function clearAssistantChatHistory(req, res) {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  user.assistantChatHistory = []
  await user.save()

  res.json({ history: [] })
}

export async function getSavedAssistantAnswers(req, res) {
  res.json({
    savedAnswers: Array.isArray(req.user.savedAssistantAnswers) ? req.user.savedAssistantAnswers : [],
  })
}

export async function saveAssistantAnswer(req, res) {
  const { title, question, answer } = req.body

  if (!question || !answer) {
    res.status(400)
    throw new Error('Question and answer are required.')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  if (!Array.isArray(user.savedAssistantAnswers)) {
    user.savedAssistantAnswers = []
  }

  const cleanedTitle = String(title || question).trim().slice(0, 80)
  const cleanedQuestion = String(question).trim()
  const cleanedAnswer = String(answer).trim()

  const exists = user.savedAssistantAnswers.some(
    (entry) => entry.question === cleanedQuestion && entry.answer === cleanedAnswer,
  )

  if (!exists) {
    user.savedAssistantAnswers.unshift({
      title: cleanedTitle || 'Saved answer',
      question: cleanedQuestion,
      answer: cleanedAnswer,
      createdAt: new Date(),
    })

    user.savedAssistantAnswers = user.savedAssistantAnswers.slice(0, 20)
    await user.save()
  }

  res.json({ savedAnswers: user.savedAssistantAnswers })
}

export async function deleteSavedAssistantAnswer(req, res) {
  const { answerId } = req.params

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found.')
  }

  user.savedAssistantAnswers = (user.savedAssistantAnswers || []).filter(
    (entry) => String(entry._id) !== answerId,
  )

  await user.save()

  res.json({ savedAnswers: user.savedAssistantAnswers })
}
