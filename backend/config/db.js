const mysql = require('mysql2/promise');

const connectDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'blind_upi'
        });
        console.log('MySQL Connected');
        return connection;
    } catch (err) {
        console.error('Database Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB; 