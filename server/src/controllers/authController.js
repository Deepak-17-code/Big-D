import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    goal: user.goal,
    socialLinks: user.socialLinks || {},
  }
}

export async function signup(req, res) {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Missing required fields.')
  }

  if (password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters long.')
  }

  const existing = await User.findOne({ email })
  if (existing) {
    res.status(409)
    throw new Error('User already exists.')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  })

  const token = generateToken(user._id)

  res.status(201).json({
    token,
    user: publicUser(user),
  })
}

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!email || !password) {
    res.status(400)
    throw new Error('Missing credentials.')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(401)
    throw new Error('Invalid credentials.')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid credentials.')
  }

  const token = generateToken(user._id)

  res.json({
    token,
    user: publicUser(user),
  })
}
