const jwt = require('jsonwebtoken');
const secret = 'mysecret'; // ควรย้ายไปที่ environment variables

const verifyToken = (req, res, next) => {
  try {
    // ตรวจสอบว่ามี cookie ที่ชื่อ 'token' หรือไม่
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Token not found.' });
    }

    // ตรวจสอบความถูกต้องของ token
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden. Token invalid.' });
      }

      // บันทึกข้อมูลที่ถอดรหัสได้ใน req.user
      req.user = decoded;
      req.employee = decoded;

      next(); // ส่งต่อการทำงานไปยัง middleware หรือ endpoint ถัดไป
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
