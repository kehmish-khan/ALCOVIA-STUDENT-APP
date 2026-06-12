import path from 'path'
import fs from 'fs'
import initSqlJs, { Database } from 'sql.js'

let db: Database

// Path to save database file
const DB_PATH = path.join(__dirname, '../../alcovia.db.json')

// Initialize database — creates tables if they don't exist
export const initDatabase = async (): Promise<void> => {
  const SQL = await initSqlJs()

  // Load existing database if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    const data = JSON.parse(fileBuffer.toString())
    db = new SQL.Database(Buffer.from(data))
  } else {
    db = new SQL.Database()
  }

  // Run schema
  const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf-8'
  )
  db.run(schema)

  // Save initial database
  saveDatabase()
  console.log('Database initialized')
}

// Save database to file after every change
export const saveDatabase = (): void => {
  const data = db.export()
  fs.writeFileSync(DB_PATH, JSON.stringify(Array.from(data)))
}

// Get database instance
export const getDb = (): Database => {
  if (!db) throw new Error('Database not initialized')
  return db
}

// Run a query that modifies data
export const run = (sql: string, params: any[] = []): void => {
  getDb().run(sql, params)
  saveDatabase()
}

// Get multiple rows
export const query = <T>(sql: string, params: any[] = []): T[] => {
  const stmt = getDb().prepare(sql)
  stmt.bind(params)
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

// Get single row
export const queryOne = <T>(sql: string, params: any[] = []): T | null => {
  const rows = query<T>(sql, params)
  return rows[0] ?? null
}