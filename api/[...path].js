import app from '../server/src/app.js'
import { initializeServer } from '../server/src/bootstrap.js'

let startupPromise

export default async function handler(req, res) {
  try {
    if (!startupPromise) {
      startupPromise = initializeServer()
    }

    await startupPromise
    return app(req, res)
  } catch (error) {
    console.error('Failed to initialize API handler:', error.message)

    if (!res.headersSent) {
      res.status(500).json({ message: 'Server initialization failed.' })
    }
  }
}
