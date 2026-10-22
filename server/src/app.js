import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import adminRoutes from './routes/admin.js'
import { notFound, errorHandler } from './middleware/error.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)
      callback(null, allowed)
    },
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/', (req, res) => res.json({ message: 'Blog API is running' }))

// Connect to MongoDB before any /api route (reused between serverless calls)
app.use('/api', async (req, res, next) => {
  await connectDB()
  next()
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
