import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import User from './models/User.js'
import Post from './models/Post.js'

const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.')
  process.exit(1)
}

const samples = [
  {
    title: 'Getting started with React hooks',
    category: 'React',
    tags: ['react', 'hooks', 'beginners'],
    featured: true,
    content: `Hooks let function components use state and other React features.\n\n## useState\n\nUse \`useState\` to keep a value that changes over time:\n\n\`\`\`jsx\nconst [count, setCount] = useState(0)\n\`\`\`\n\n## useEffect\n\nRun side effects such as fetching data after render. Always list the values your effect depends on.\n\n> Start small: convert one class component and compare the result.`,
  },
  {
    title: 'A calm guide to CSS Grid',
    category: 'CSS',
    tags: ['css', 'layout'],
    content: `Grid is the first layout system designed for two dimensions.\n\n## The basics\n\n- Define columns with \`grid-template-columns\`\n- Place items with \`grid-area\`\n- Use \`gap\` for spacing\n\nOnce the mental model clicks, most layouts take a few lines.`,
  },
  {
    title: 'Ten habits that made me a faster competitive programmer',
    category: 'Programming',
    tags: ['competitive-programming', 'habits'],
    content: `Speed comes from practice that is deliberate.\n\n1. Read the whole problem twice\n2. Write the brute force first\n3. Test on tiny cases by hand\n4. Review every wrong submission\n\nKeep a notebook of mistakes and revisit it weekly.`,
  },
  {
    title: 'Deploying a full-stack app on Vercel',
    category: 'Deployment',
    tags: ['vercel', 'deployment', 'nodejs'],
    content: `Deploy the frontend and the API as two Vercel projects.\n\n## Frontend\n\nSet the root directory to \`client\` and add \`VITE_API_URL\`.\n\n## Backend\n\nSet the root directory to \`server\` and add your database and JWT secrets.\n\nRedeploy after changing environment variables.`,
  },
]

await connectDB()

let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
if (!admin) {
  admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' })
  console.log(`Created admin account: ${admin.email}`)
} else if (admin.role !== 'admin') {
  admin.role = 'admin'
  await admin.save()
  console.log(`Promoted ${admin.email} to admin`)
} else {
  console.log(`Admin already exists: ${admin.email}`)
}

if (process.argv.includes('--samples')) {
  if ((await Post.countDocuments()) === 0) {
    for (const [i, sample] of samples.entries()) {
      const slug = sample.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      await Post.create({
        ...sample,
        status: 'published',
        author: admin._id,
        coverImage: `https://picsum.photos/seed/${slug}/1200/675`,
        views: 40 - i * 7,
      })
    }
    console.log(`Added ${samples.length} sample posts`)
  } else {
    console.log('Posts already exist, skipped samples')
  }
}

await mongoose.disconnect()
