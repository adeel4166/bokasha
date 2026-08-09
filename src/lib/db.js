import mysql from 'mysql2/promise';

let pool;

export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: 'localhost',
      user: 'bokasha_user',
      password: 'Bokasha@2024',
      database: 'bokasha',
      port: 3306,
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
