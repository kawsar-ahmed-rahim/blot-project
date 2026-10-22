import mongoose from 'mongoose'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import AppError from '../utils/AppError.js'
import { escapeRegex, parsePaging, normalizeTags } from '../utils/helpers.js'

// Replace the likes array with a count so we never leak user ids
const shape = (post) => {
  const { likes = [], ...rest } = post
  return { ...rest, likesCount: likes.length }
}

/* ---------- Public ---------- */

export async function listPosts(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 9, 30)
  const filter = { status: 'published' }

  if (req.query.category) filter.category = String(req.query.category)
  if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase()
  if (req.query.featured === 'true') filter.featured = true
  if (req.query.exclude && mongoose.isValidObjectId(req.query.exclude)) filter._id = { $ne: req.query.exclude }
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i')
    filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }, { category: rx }]
  }

  const sort = req.query.sort === 'popular' ? { views: -1, createdAt: -1 } : { createdAt: -1 }

  const [posts, total] = await Promise.all([
    Post.find(filter).select('-content').populate('author', 'name').sort(sort).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ])

  res.json({ posts: posts.map(shape), page, pages: Math.ceil(total / limit), total })
}

export async function getMeta(req, res) {
  const match = { $match: { status: 'published' } }
  const [categories, tags] = await Promise.all([
    Post.aggregate([match, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]),
    Post.aggregate([match, { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }]),
  ])
  res.json({
    categories: categories.map((c) => ({ name: c._id, count: c.count })),
    tags: tags.map((t) => ({ name: t._id, count: t.count })),
  })
}

export async function getPost(req, res) {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name')
  const isAdmin = req.user?.role === 'admin'
  if (!post || (post.status !== 'published' && !isAdmin)) throw new AppError('Post not found', 404)

  if (post.status === 'published') {
    await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } }, { timestamps: false })
    post.views += 1
  }

  const { likes, ...data } = post.toObject()
  res.json({
    post: {
      ...data,
      likesCount: likes.length,
      liked: req.user ? likes.some((id) => id.equals(req.user._id)) : false,
    },
  })
}

export async function toggleLike(req, res) {
  const post = await Post.findOne({ _id: req.params.id, status: 'published' })
  if (!post) throw new AppError('Post not found', 404)

  const liked = post.likes.some((id) => id.equals(req.user._id))
  await Post.updateOne(
    { _id: post._id },
    liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } },
    { timestamps: false }
  )
  res.json({ liked: !liked, likesCount: post.likes.length + (liked ? -1 : 1) })
}

/* ---------- Admin ---------- */

const pickFields = (body) => {
  const data = {}
  for (const key of ['title', 'excerpt', 'content', 'coverImage', 'category']) {
    if (body[key] !== undefined) data[key] = String(body[key])
  }
  if (body.tags !== undefined) data.tags = normalizeTags(body.tags)
  if (body.status !== undefined) data.status = body.status
  if (body.featured !== undefined) data.featured = Boolean(body.featured)
  if (data.category !== undefined && !data.category.trim()) data.category = 'General'
  return data
}

export async function adminListPosts(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 10, 50)
  const filter = {}
  if (['draft', 'published'].includes(req.query.status)) filter.status = req.query.status
  if (req.query.search) filter.title = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i')

  const [posts, total] = await Promise.all([
    Post.find(filter).select('-content').populate('author', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ])
  res.json({ posts: posts.map(shape), page, pages: Math.ceil(total / limit), total })
}

export async function adminGetPost(req, res) {
  const post = await Post.findById(req.params.id).lean()
  if (!post) throw new AppError('Post not found', 404)
  res.json({ post: shape(post) })
}

export async function createPost(req, res) {
  const post = await Post.create({ ...pickFields(req.body), author: req.user._id })
  res.status(201).json({ post })
}

export async function updatePost(req, res) {
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  post.set(pickFields(req.body))
  await post.save()
  res.json({ post })
}

export async function deletePost(req, res) {
  const post = await Post.findByIdAndDelete(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  await Comment.deleteMany({ post: post._id })
  res.json({ message: 'Post deleted' })
}
