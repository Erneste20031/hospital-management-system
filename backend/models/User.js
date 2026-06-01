const db = require('../config/db');

const User = {
    // Find user by email
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    
    // Find user by ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    
    // Create new user
    create: async (userData) => {
        const { name, email, password, role, avatar } = userData;
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, avatar || null]
        );
        return result.insertId;
    },
    
    // Update user
    update: async (id, userData) => {
        const { name, email, avatar } = userData;
        const [result] = await db.query(
            'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
            [name, email, avatar, id]
        );
        return result.affectedRows;
    },
    
    // Delete user
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    },
    
    // Get all users by role
    findByRole: async (role) => {
        const [rows] = await db.query('SELECT id, name, email, role, avatar FROM users WHERE role = ?', [role]);
        return rows;
    }
};

module.exports = User;