import mongoose from 'mongoose'

const calorieEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true },
    calories: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

calorieEntrySchema.index({ user: 1, day: 1 }, { unique: true })

export default mongoose.model('CalorieEntry', calorieEntrySchema)
