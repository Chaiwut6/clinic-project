const mysql = require("mysql2/promise");
require("dotenv").config();

const initMySQL = async () => {
  console.log("🔍 Connecting to MySQL with:");
  console.log("   🔹 HOST:", process.env.DB_HOST);
  console.log("   🔹 USER:", process.env.DB_USER);
  console.log("   🔹 DATABASE:", process.env.DB_NAME);

  let connection;
  for (let attempt = 1; attempt <= 10; attempt++) { // 🔄 ลองเชื่อมต่อ 10 ครั้ง
    try {
      console.log(`🔄 Attempt ${attempt}: Connecting to MySQL at ${process.env.DB_HOST}...`);
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306, // ใช้ 3306 ถ้าไม่ได้กำหนดพอร์ต
        connectTimeout: 10000 // ⏳ 10 วินาที
      });
      console.log("✅ Connected to MySQL successfully!");
      return connection;
    } catch (err) {
      console.error(`❌ Attempt ${attempt}: MySQL connection failed. Retrying in 5 seconds...`);
      await new Promise((res) => setTimeout(res, 5000)); // ⏳ รอ 5 วิ ก่อนลองใหม่
    }
  }
  throw new Error("🔥 Could not connect to MySQL after multiple attempts");
};

module.exports = initMySQL;
