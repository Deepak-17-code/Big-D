import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import calorieRoutes from './routes/calorieRoutes.js'
import stepRoutes from './routes/stepRoutes.js'
import postRoutes from './routes/postRoutes.js'
import assistantRoutes from './routes/assistantRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/calories', calorieRoutes)
app.use('/api/steps', stepRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/assistant', assistantRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
