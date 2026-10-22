import Comment from '../models/Comment.js'
import Post from '../models/Post.js'
import AppError from '../utils/AppError.js'
import { parsePaging } from '../utils/helpers.js'

export async function listComments(req, res) {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()
  res.json({ comments })
}

export async function addComment(req, res) {
  const content = String(req.body.content || '').trim()
  if (!content) throw new AppError('Write something before posting')
  if (content.length > 1000) throw new AppError('Comments can be up to 1000 characters')

  if (!(await Post.exists({ _id: req.params.postId, status: 'published' }))) {
    throw new AppError('Post not found', 404)
  }

  const comment = await Comment.create({ post: req.params.postId, user: req.user._id, content })
  await comment.populate('user', 'name')
  res.status(201).json({ comment })
}

export async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id)
  if (!comment) throw new AppError('Comment not found', 404)

  const isOwner = comment.user.equals(req.user._id)
  if (!isOwner && req.user.role !== 'admin') throw new AppError('You can only delete your own comments', 403)

  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
}

export async function adminListComments(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 15, 50)
  const [comments, total] = await Promise.all([
    Comment.find()
      .populate('user', 'name email')
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(),
  ])
  res.json({ comments, page, pages: Math.ceil(total / limit), total })
}
