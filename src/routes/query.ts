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
  project: string
  key: string
  value: string
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

// Route to create or update a cookie record
queryRouter.post('/cookies', async (c) => {
  try {
    const body = await c.req.json<CookieRecord>()
    const { project, key, value } = body
    
    if (!project || !key || !value) {
      return c.json({ error: 'project, key, and value are required' }, 400)
    }

    const db = c.env.DB
    
    const result = db.prepare(`
      INSERT INTO cookies (project, key, value, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(project)
      DO UPDATE SET 
        key = excluded.key,
        value = excluded.value,
        updated_at = datetime('now')
    `).run(project, key, value)

    return c.json({
      message: 'Cookie record created/updated successfully',
      id: result.lastInsertRowid
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Route to update a cookie record by project
queryRouter.put('/cookies/:project', async (c) => {
  try {
    const project = c.req.param('project')
    const body = await c.req.json<Partial<Pick<CookieRecord, 'key' | 'value'>>>()
    const { key, value } = body
    
    if (!key && !value) {
      return c.json({ error: 'key or value is required for update' }, 400)
    }

    const db = c.env.DB

    // Construct parts of the SET clause conditionally
    const setClauses: string[] = []
    const params: (string | undefined)[] = []

    if (key !== undefined) {
      setClauses.push('key = ?')
      params.push(key)
    }
    if (value !== undefined) {
      setClauses.push('value = ?')
      params.push(value)
    }
    setClauses.push("updated_at = datetime('now')")
    params.push(project)


    const result = db.prepare(`
      UPDATE cookies 
      SET ${setClauses.join(', ')}
      WHERE project = ?
    `).run(...params)

    if (result.changes === 0) {
      // If the record does not exist, we cannot update it.
      // The previous behavior was to create it, but with UNIQUE(project),
      // a POST to /cookies should be used for creation.
      // If we want to create if not exists on PUT, we'd need project, key, and value.
      // For now, let's assume PUT is only for existing records.
      // If `key` and `value` are both provided, we could consider an INSERT here,
      // but it might be better to keep PUT for updates and POST for creations/upserts.
      if (key && value) { // Only attempt insert if all required fields for a new record are present
        const insertResult = db.prepare(
          'INSERT INTO cookies (project, key, value, updated_at) VALUES (?, ?, ?, datetime("now"))'
        ).run(project, key, value)
         return c.json({
          message: 'Cookie record created successfully as it did not exist',
          id: insertResult.lastInsertRowid
        }, 201)
      }
      return c.json({ error: 'Cookie record not found or no changes made' }, 404)
    }

    return c.json({
      message: 'Cookie record updated successfully',
      changes: result.changes
    })
  } catch (error: any) {
    // Catch potential UNIQUE constraint errors if trying to INSERT on PUT without proper ON CONFLICT
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: `Record with project '${c.req.param('project')}' already exists. Use POST to update or ensure the project name is unique if creating.` }, 409);
    }
    return c.json({ error: error.message }, 400)
  }
})

// Route to get a cookie record by project
queryRouter.get('/cookies/:project', async (c) => {
  try {
    const project = c.req.param('project')
    
    const db = c.env.DB
    const row = db.prepare(`
      SELECT * FROM cookies 
      WHERE project = ?
    `).get(project)

    if (!row) {
      return c.json({ error: 'Cookie record not found' }, 404)
    }

    return c.json(row)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

export { queryRouter } 