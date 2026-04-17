const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/hevyx'

export function validateEnv(env) {
  const missing = []
  const nodeEnv = env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  if (!env.JWT_SECRET) {
    missing.push('JWT_SECRET')
  }

  if (isProduction && !env.MONGO_URI) {
    missing.push('MONGO_URI')
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  const hasCloudinary = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
  const hasOpenAI = Boolean(env.OPENAI_API_KEY)
  const hasGemini = Boolean(env.GEMINI_API_KEY)

  return {
    PORT: Number(env.PORT) || 5000,
    MONGO_URI: env.MONGO_URI || DEFAULT_MONGO_URI,
    NODE_ENV: nodeEnv,
    hasCloudinary,
    hasOpenAI,
    hasGemini,
    CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET || '',
    OPENAI_API_KEY: env.OPENAI_API_KEY || '',
    OPENAI_MODEL: env.OPENAI_MODEL || 'gpt-4o-mini',
    GEMINI_API_KEY: env.GEMINI_API_KEY || '',
    GEMINI_MODEL: env.GEMINI_MODEL || 'gemini-2.5-flash',
  }
}
