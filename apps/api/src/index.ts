import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'https://lumina.vercel.app',
  ],
  credentials: true,
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
