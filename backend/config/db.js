const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool with full SSL for TiDB Cloud
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    },
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
    },
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        console.error('Please check your TiDB Cloud credentials');
        return;
    }
    console.log('✅ MySQL Connected to TiDB Cloud');
    connection.release();
});

module.exports = pool.promise();
