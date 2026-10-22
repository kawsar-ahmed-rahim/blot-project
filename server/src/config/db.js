import mongoose from 'mongoose'

// Cache the connection so serverless invocations on Vercel reuse it
const cached = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null })

export default async function connectDB() {
  if (cached.conn) return cached.conn

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }
  return cached.conn
}
