import { Database } from 'better-sqlite3'

export const initializeDb = (db: Database) => {
  // 创建 cookies 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS cookies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      cookie TEXT NOT NULL,
      user TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(domain, user)
    )
  `)
}

// 添加数据库文件路径配置
export const DB_PATH = '/app/data/database.sqlite' 