import mongoose from 'mongoose'

const stepEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true },
    steps: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

stepEntrySchema.index({ user: 1, day: 1 }, { unique: true })

export default mongoose.model('StepEntry', stepEntrySchema)
