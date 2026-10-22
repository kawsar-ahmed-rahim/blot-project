import mongoose from 'mongoose'
import { slugify } from '../utils/helpers.js'

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: [true, 'Content is required'] },
    coverImage: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'General', maxlength: 40 },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readTime: { type: Number, default: 1 },
  },
  { timestamps: true }
)

postSchema.pre('validate', async function () {
  // Slug is created once so published URLs never change
  if (this.isNew && !this.slug && this.title) {
    const base = slugify(this.title) || 'post'
    let slug = base
    let n = 1
    while (await this.constructor.exists({ slug })) slug = `${base}-${++n}`
    this.slug = slug
  }

  if (this.isModified('content') && this.content) {
    const words = this.content.trim().split(/\s+/).length
    this.readTime = Math.max(1, Math.ceil(words / 200))

    if (!this.excerpt) {
      const plain = this.content.replace(/[#*_`>[\]()!-]/g, '').replace(/\s+/g, ' ').trim()
      this.excerpt = plain.length > 160 ? `${plain.slice(0, 157)}...` : plain
    }
  }
})

export default mongoose.models.Post || mongoose.model('Post', postSchema)
