import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import Database from 'better-sqlite3'
import { serve } from '@hono/node-server'
import { bearerAuth } from 'hono/bearer-auth'
import { config } from './config'
import { initializeDb } from './database'
import { queryRouter } from './routes/query'

// 类型定义
type Bindings = {
  DB: Database.Database
}

// 创建 Hono 应用
const app = new Hono<{ Bindings: Bindings }>()

// 中间件
app.use('*', cors())
app.use('*', logger())
app.use('*', prettyJSON())

// Add authentication middleware before routes
app.use('*', bearerAuth({ token: config.authToken }))

// Move database initialization before route setup
const db = new Database(config.dbPath)
initializeDb(db)

app.use('*', async (c, next) => {
  c.env.DB = db
  await next()
})

// Then setup routes
app.route('/api', queryRouter)

// 错误处理
app.onError((err, c) => {
  console.error(`[Error Details]:`, err)
  
  // In development, return detailed error information
  if (process.env.NODE_ENV !== 'production') {
    return c.json({
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack
    }, 500)
  }
  
  // In production, return generic error
  return c.json({ error: 'Internal Server Error' }, 500)
})

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

serve(app, () => {
  console.log(`Server is running on http://localhost:${config.port}`)
}) 