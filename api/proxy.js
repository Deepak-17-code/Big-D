import app from '../server/src/app.js'
import { initializeServer } from '../server/src/bootstrap.js'

let startupPromise

export default async function handler(req, res) {
  try {
    if (!startupPromise) {
      startupPromise = initializeServer()
    }

    await startupPromise

    const url = new URL(req.url, 'http://localhost')
    const pathParam = url.searchParams.get('path') || ''
    url.searchParams.delete('path')

    const suffix = pathParam ? `/${pathParam}` : ''
    const query = url.searchParams.toString()
    req.url = `/api${suffix}${query ? `?${query}` : ''}`

    return app(req, res)
  } catch (error) {
    console.error('Failed to initialize API proxy handler:', error.message)

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Server initialization failed.',
        error: error.message,
      })
    }
  }
}