import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import router from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Gen-Pay API is running' })
})

app.use('/api/v1', router)

app.use(errorHandler)

export default app
