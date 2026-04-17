let startupPromise
let appHandler

export default async function handler(req, res) {
  try {
    if (!appHandler) {
      const [{ default: app }, { initializeServer }] = await Promise.all([
        import('../server/src/app.js'),
        import('../server/src/bootstrap.js'),
      ])

      appHandler = app

      if (!startupPromise) {
        startupPromise = initializeServer()
      }
    }

    if (!startupPromise) {
      const { initializeServer } = await import('../server/src/bootstrap.js')
      startupPromise = initializeServer()
    }

    await startupPromise

    const url = new URL(req.url, 'http://localhost')
    const pathParam = url.searchParams.get('path') || ''
    url.searchParams.delete('path')

    const suffix = pathParam ? `/${pathParam}` : ''
    const query = url.searchParams.toString()
    req.url = `/api${suffix}${query ? `?${query}` : ''}`

    return appHandler(req, res)
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