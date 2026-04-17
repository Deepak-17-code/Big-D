import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { configureCloudinary } from './config/cloudinary.js'
import { validateEnv } from './config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let initializationPromise

export async function initializeServer() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      dotenv.config({ path: path.resolve(__dirname, '../.env') })

      const env = validateEnv(process.env)

      if (env.NODE_ENV !== 'production' && !process.env.MONGO_URI) {
        console.warn('MONGO_URI not set in server/.env, using local default mongodb://127.0.0.1:27017/hevyx')
      }

      await connectDB(env.MONGO_URI)

      if (env.hasCloudinary) {
        configureCloudinary(env)
      } else {
        console.warn('Cloudinary credentials are missing. Image upload features will remain disabled.')
      }

      if (env.hasOpenAI) {
        console.log(`AI assistant OpenAI enabled with ${env.OPENAI_MODEL}`)
      }

      if (env.hasGemini) {
        console.log(`AI assistant Gemini enabled with ${env.GEMINI_MODEL}`)
      }

      if (!env.hasOpenAI && !env.hasGemini) {
        console.warn('No AI provider key found (OPENAI_API_KEY or GEMINI_API_KEY). The assistant will use fallback answers.')
      }

      return env
    })()
  }

  return initializationPromise
}
