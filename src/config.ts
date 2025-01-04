export const config = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || './data.db',
  authToken: process.env.AUTH_TOKEN || '1234567890'
} 