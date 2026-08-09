import mysql from 'mysql2/promise';

let pool;

export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'bokasha_user',
      password: process.env.DB_PASSWORD || 'Bokasha@2024',
      database: process.env.DB_NAME || 'bokasha',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql, params) {
  const db = await getDbPool();
  const [results] = await db.execute(sql, params);
  return results;
}
