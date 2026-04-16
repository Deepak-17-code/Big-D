import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.model('Post', postSchema)
