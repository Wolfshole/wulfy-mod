import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: import.meta.env.DB_HOST,
  port: import.meta.env.DB_PORT,
  user: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
  database: import.meta.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 20000,
});

// Fehlerhafte Verbindungen automatisch ersetzen
pool.on("connection", (conn) => {
  conn.on("error", (err) => {
    console.error("DB-Verbindungsfehler:", err.message);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      // Pool ersetzt die Verbindung automatisch
    }
  });
});

export default pool;
