import jwt from 'jsonwebtoken'

export function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
