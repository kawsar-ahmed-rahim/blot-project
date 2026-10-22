// Local development entry. On Vercel, api/index.js is used instead.
import app from './app.js'

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`API running on http://localhost:${port}`))
