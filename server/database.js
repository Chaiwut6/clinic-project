const mysql = require('mysql2/promise');
require('dotenv').config();

const initMySQL = async () => {
  let connection;
  let retries = 5; // จำนวนครั้งที่ลองเชื่อมต่อใหม่

  while (retries) {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',  // ✅ ใช้ชื่อ service `db` จาก Docker Compose
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'clinic',
        port: process.env.DB_PORT || 3306
      });

      console.log("✅ Connected to MySQL successfully!");
      return connection;
    } catch (error) {
      console.error("❌ Database connection failed. Retrying in 5 seconds...");
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // รอ 5 วินาทีแล้วลองใหม่
    }
  }

  throw new Error("🔥 Could not connect to MySQL after multiple attempts");
};

module.exports = initMySQL;
