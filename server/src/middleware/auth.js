import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import { verifyToken } from '../utils/token.js'

async function userFromRequest(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  const decoded = verifyToken(header.slice(7))
  return User.findById(decoded.id)
}

// Requires a valid login
export async function protect(req, res, next) {
  const user = await userFromRequest(req)
  if (!user) throw new AppError('Please log in to continue', 401)
  req.user = user
  next()
}

// Attaches the user when a valid token is sent, but never blocks the request
export async function optionalAuth(req, res, next) {
  try {
    req.user = await userFromRequest(req)
  } catch {
    req.user = null
  }
  next()
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') throw new AppError('Admin access required', 403)
  next()
}
