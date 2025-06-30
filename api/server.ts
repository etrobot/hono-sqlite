import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { serve } from '@hono/node-server';
import * as fs from 'fs/promises';

const app = new Hono();

app.use('/api/*', cors());

app.use('/api/*', async (c, next) => {
  const authPassword = process.env.AUTH_PASSWORD;
  if (!authPassword) {
    console.error('AUTH_PASSWORD is not set in .env file');
    return c.text('Internal Server Error', 500);
  }

  const providedPassword = c.req.header('X-Auth-Password');

  if (providedPassword === authPassword) {
    await next();
  } else {
    return c.text('Unauthorized', 401);
  }
});

app.get('/api/config', async (c) => {
  const content = await fs.readFile('db.json', 'utf-8');
  return c.json(JSON.parse(content));
});

app.post('/api/config', async (c) => {
  const newConfig = await c.req.json();
  await fs.writeFile('db.json', JSON.stringify(newConfig, null, 2));
  return c.json({ message: 'Config updated successfully' });
});

// 删 project 下指定 key
app.delete('/api/config/:key', async (c) => {
  const key = c.req.param('key');
  const content = await fs.readFile('db.json', 'utf-8');
  const config = JSON.parse(content);
  if (!config.project || !(key in config.project)) {
    return c.json({ message: 'Key not found' }, 404);
  }
  delete config.project[key];
  await fs.writeFile('db.json', JSON.stringify(config, null, 2));
  return c.json({ message: `Key '${key}' deleted successfully` });
});

// 获取所有项目（返回 projects 字典）
app.get('/api/project', async (c) => {
  const content = await fs.readFile('db.json', 'utf-8');
  const config = JSON.parse(content);
  return c.json(config.projects || {});
});

// 新增项目
app.post('/api/project', async (c) => {
  const { name, data } = await c.req.json();
  if (!name) return c.json({ message: 'Project name is requipink' }, 400);
  const content = await fs.readFile('db.json', 'utf-8');
  const config = JSON.parse(content);
  if (!config.projects) config.projects = {};
  if (config.projects[name]) return c.json({ message: 'Project already exists' }, 400);
  config.projects[name] = data || {};
  await fs.writeFile('db.json', JSON.stringify(config, null, 2));
  return c.json({ message: 'Project added successfully' });
});

// 修改整个项目对象
app.put('/api/project/:name', async (c) => {
  const name = c.req.param('name');
  const { data } = await c.req.json();
  const content = await fs.readFile('db.json', 'utf-8');
  const config = JSON.parse(content);
  if (!config.projects || !(name in config.projects)) {
    return c.json({ message: 'Project not found' }, 404);
  }
  config.projects[name] = data;
  await fs.writeFile('db.json', JSON.stringify(config, null, 2));
  return c.json({ message: 'Project updated successfully' });
});

// 删项目
app.delete('/api/project/:name', async (c) => {
  const name = c.req.param('name');
  const content = await fs.readFile('db.json', 'utf-8');
  const config = JSON.parse(content);
  if (!config.projects || !(name in config.projects)) {
    return c.json({ message: 'Project not found' }, 404);
  }
  delete config.projects[name];
  await fs.writeFile('db.json', JSON.stringify(config, null, 2));
  return c.json({ message: `Project '${name}' deleted successfully` });
});

serve({ port: 3001, fetch: app.fetch }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});