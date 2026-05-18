import express, { Application } from 'express'
import authRoute from './routes/auth.route'
import webhookRoute from './routes/webhook.route'
import errorMiddleware from './middleware/errorMiddleware'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoute)
app.use('/api/webhook' , webhookRoute)

app.use(errorMiddleware)


export default app
