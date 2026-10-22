import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import AppError from '../utils/AppError.js'

export async function getStats(req, res) {
  const [totalPosts, published, drafts, comments, users, viewsAgg, recent, top] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    Comment.countDocuments(),
    User.countDocuments(),
    Post.aggregate([{ $group: { _id: null, views: { $sum: '$views' } } }]),
    Post.find().select('title slug status createdAt views').sort({ createdAt: -1 }).limit(5).lean(),
    Post.find({ status: 'published' }).select('title slug views').sort({ views: -1 }).limit(5).lean(),
  ])

  res.json({
    totalPosts,
    published,
    drafts,
    comments,
    users,
    views: viewsAgg[0]?.views || 0,
    recent,
    top,
  })
}

export async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 }).lean()
  res.json({ users })
}

export async function updateUserRole(req, res) {
  const { role } = req.body
  if (!['user', 'admin'].includes(role)) throw new AppError('Role must be user or admin')
  if (req.params.id === String(req.user._id)) throw new AppError("You can't change your own role")

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
  if (!user) throw new AppError('User not found', 404)
  res.json({ user })
}

export async function deleteUser(req, res) {
  if (req.params.id === String(req.user._id)) throw new AppError("You can't delete your own account")

  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) throw new AppError('User not found', 404)

  await Promise.all([
    Comment.deleteMany({ user: user._id }),
    Post.updateMany({}, { $pull: { likes: user._id } }, { timestamps: false }),
  ])
  res.json({ message: 'User deleted' })
}
