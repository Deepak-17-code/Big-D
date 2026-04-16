import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    goal: { type: String, default: '' },
    // AI Personal Trainer metrics
    weight: { type: Number, default: null }, // in kg
    height: { type: Number, default: null }, // in cm
    goalWeight: { type: Number, default: null }, // in kg
    goalTimelineWeeks: { type: Number, default: null }, // in weeks
    weightHistory: [
      {
        weight: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    socialLinks: {
      instagram: { type: String, default: '' },
      x: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    assistantChatHistory: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    savedAssistantAnswers: [
      {
        title: { type: String, required: true },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
