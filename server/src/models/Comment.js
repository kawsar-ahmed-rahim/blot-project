import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Comment cannot be empty'], trim: true, maxlength: 1000 },
  },
  { timestamps: true }
)

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema)
