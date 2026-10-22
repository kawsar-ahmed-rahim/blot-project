import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import { signToken } from '../utils/token.js'

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })

export async function register(req, res) {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || !email || !password) throw new AppError('Name, email and password are required')
  if (password.length < 6) throw new AppError('Password must be at least 6 characters')
  if (await User.exists({ email })) throw new AppError('An account with this email already exists', 409)

  const user = await User.create({ name, email, password })
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
}

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }
  res.json({ token: signToken(user), user: publicUser(user) })
}

export function me(req, res) {
  res.json({ user: publicUser(req.user) })
}

export async function updateProfile(req, res) {
  const user = await User.findById(req.user._id).select('+password')
  const { name, currentPassword, newPassword } = req.body

  if (name !== undefined) {
    const trimmed = String(name).trim()
    if (!trimmed) throw new AppError('Name cannot be empty')
    user.name = trimmed
  }

  if (newPassword) {
    if (String(newPassword).length < 6) throw new AppError('New password must be at least 6 characters')
    if (!currentPassword || !(await user.matchPassword(String(currentPassword)))) {
      throw new AppError('Current password is incorrect', 401)
    }
    user.password = String(newPassword)
  }

  await user.save()
  res.json({ user: publicUser(user) })
}
