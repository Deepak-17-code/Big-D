import app from './app.js'
import { initializeServer } from './bootstrap.js'

async function startServer() {
  try {
    const env = await initializeServer()

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
