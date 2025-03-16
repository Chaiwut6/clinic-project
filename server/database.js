const mysql = require("mysql2/promise");
require("dotenv").config();

const initMySQL = async () => {
  let connection;
  for (let attempt = 0; attempt < 5; attempt++) {  // ลองเชื่อมต่อ 5 ครั้ง
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || "db", // ใช้ชื่อ `db` ตาม Docker Compose
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "root",
        database: process.env.DB_NAME || "clinic",
        port: process.env.DB_PORT || 3306,
      });
      console.log("✅ Connected to MySQL successfully!");
      return connection;
    } catch (err) {
      console.error(`❌ MySQL connection attempt ${attempt + 1} failed. Retrying...`);
      await new Promise((res) => setTimeout(res, 3000)); // รอ 3 วิ แล้วลองใหม่
    }
  }
  throw new Error("🔥 Could not connect to MySQL after multiple attempts");
};

module.exports = initMySQL;
