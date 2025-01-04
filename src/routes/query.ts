import { Hono } from 'hono'
import { Database } from 'better-sqlite3'

type Bindings = {
  DB: Database
}

type QueryBody = {
  query: string
}

type CookieRecord = {
  id?: number
  domain: string
  cookie: string
  user: string
}

const queryRouter = new Hono<{ Bindings: Bindings }>()

queryRouter.post('/query', async (c) => {
  const body = await c.req.json<QueryBody>()
  const { query } = body
  
  if (!query) {
    return c.json({ error: 'Query parameter is required' }, 400)
  }

  try {
    const db = c.env.DB
    const isSelect = query.trim().toUpperCase().startsWith('SELECT')

    if (isSelect) {
      const rows = db.prepare(query).all()
      return c.json({ results: rows })
    } else {
      const result = db.prepare(query).run()
      return c.json({
        message: 'Query executed successfully',
        changes: result.changes
      })
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// 新增插入记录路由
queryRouter.post('/cookies', async (c) => {
  try {
    const body = await c.req.json<CookieRecord>()
    const { domain, cookie, user } = body
    
    if (!domain || !cookie || !user) {
      return c.json({ error: 'domain, cookie and user are required' }, 400)
    }

    const db = c.env.DB
    
    // 尝试更新已存在的记录
    const result = db.prepare(`
      INSERT INTO cookies (domain, cookie, user, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(domain, user) 
      DO UPDATE SET 
        cookie = excluded.cookie,
        updated_at = datetime('now')
    `).run(domain, cookie, user)

    return c.json({
      message: 'Cookie record created/updated successfully',
      id: result.lastInsertRowid
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// 更新记录路由 - 现在需要同时指定 domain 和 user
queryRouter.put('/cookies/:domain/:user', async (c) => {
  try {
    const domain = c.req.param('domain')
    const user = c.req.param('user')
    const body = await c.req.json<Partial<CookieRecord>>()
    const { cookie } = body
    
    if (!cookie) {
      return c.json({ error: 'cookie is required' }, 400)
    }

    const db = c.env.DB
    const result = db.prepare(`
      UPDATE cookies 
      SET cookie = ?, 
          updated_at = datetime('now')
      WHERE domain = ? AND user = ?
    `).run(cookie, domain, user)

    if (result.changes === 0) {
      // 如果记录不存在，则创建新记录
      const insertResult = db.prepare(
        'INSERT INTO cookies (domain, cookie, user, updated_at) VALUES (?, ?, ?, datetime("now"))'
      ).run(domain, cookie, user)

      return c.json({
        message: 'Cookie record created successfully',
        id: insertResult.lastInsertRowid
      }, 201)
    }

    return c.json({
      message: 'Cookie record updated successfully',
      changes: result.changes
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// 新增查询路由
queryRouter.get('/cookies/:domain/:user', async (c) => {
  try {
    const domain = c.req.param('domain')
    const user = c.req.param('user')
    
    const db = c.env.DB
    const row = db.prepare(`
      SELECT * FROM cookies 
      WHERE domain = ? AND user = ?
    `).get(domain, user)

    if (!row) {
      return c.json({ error: 'Cookie record not found' }, 404)
    }

    return c.json(row)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

export { queryRouter } 