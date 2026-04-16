const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:5000/api'
const TEST_EMAIL = process.env.SMOKE_EMAIL || `smoke.${Date.now()}@example.com`
const TEST_PASSWORD = process.env.SMOKE_PASSWORD || 'Pass1234!'
const TEST_NAME = process.env.SMOKE_NAME || 'Smoke Tester'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let body = null

  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  return { response, body }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  console.log(`Running API smoke test against ${BASE_URL}`)

  const health = await request('/health', { method: 'GET' })
  assert(health.response.ok, 'Health endpoint failed')
  console.log('Health check passed')

  const signup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  })

  if (!signup.response.ok && signup.response.status !== 409) {
    throw new Error(`Signup failed with status ${signup.response.status}`)
  }

  console.log('Signup check passed')

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  })

  assert(login.response.ok, `Login failed with status ${login.response.status}`)
  assert(login.body?.token, 'Login response does not include token')
  console.log('Login check passed')

  const authHeader = { Authorization: `Bearer ${login.body.token}` }

  const me = await request('/users/me', {
    method: 'GET',
    headers: authHeader,
  })
  assert(me.response.ok, `/users/me failed with status ${me.response.status}`)
  console.log('User profile check passed')

  const steps = await request('/steps', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ day: 'Mon', steps: 5000 }),
  })
  assert(steps.response.ok, `/steps POST failed with status ${steps.response.status}`)
  console.log('Steps upsert check passed')

  const calories = await request('/calories', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ day: 'Mon', calories: 2200 }),
  })
  assert(calories.response.ok, `/calories POST failed with status ${calories.response.status}`)
  console.log('Calories upsert check passed')

  console.log('API smoke test completed successfully')
}

main().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`)
  process.exit(1)
})
