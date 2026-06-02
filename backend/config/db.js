const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool with SSL for TiDB Cloud
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 4000,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ MySQL Connected (with SSL)');
    connection.release();
});

module.exports = pool.promise();
