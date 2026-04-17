import mongoose from 'mongoose'

export async function connectDB(mongoUri) {
  await mongoose.connect(mongoUri, {
    // Fail fast in serverless so initialization errors surface in API responses/logs.
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  })
}
