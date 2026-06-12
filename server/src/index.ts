import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './db/database'
import syncRouter from './routes/sync'
import studentRouter from './routes/student'
import sessionsRouter from './routes/sessions'
import { webhookRouter } from './routes/webhook'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(logger)

app.use('/sync', syncRouter)
app.use('/student', studentRouter)
app.use('/sessions', sessionsRouter)
app.use('/webhook', webhookRouter)

app.get('/ping', (req, res) => {
  res.json({ status: 'ok' })
})

app.use(errorHandler)

const start = async () => {
  await initDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()