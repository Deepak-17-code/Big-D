import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, default: 0, min: 0 },
    reps: { type: Number, default: 0, min: 0 },
    weight: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
)

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    calories: { type: Number, default: 0, min: 0 },
    exercises: [exerciseSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Workout', workoutSchema)
