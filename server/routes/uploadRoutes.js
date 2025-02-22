const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 📂 กำหนดโฟลเดอร์อัปโหลด
const uploadDir = path.join(__dirname, "../uploads");

// ✅ ตรวจสอบว่ามีโฟลเดอร์ `uploads` หรือไม่ ถ้าไม่มีให้สร้าง
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ ตั้งค่า `multer` สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage });

// ✅ API สำหรับอัปโหลดรูปภาพ
router.post("/upload-image", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์รูปภาพ" });
        }

        // ✅ ดึงชื่อไฟล์จาก multer
        const filename = req.file.filename;
        const filePath = `/uploads/${filename}`;
        const imageUrl = `http://localhost:8000${filePath}`;

        // ✅ อ่านไฟล์เป็น Base64
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Image = `data:image/${path.extname(filename).slice(1)};base64,${fileBuffer.toString("base64")}`;

        // ✅ ตอบกลับ JSON พร้อม URL และ Base64
        res.json({
            message: "อัปโหลดสำเร็จ",
            imageUrl: imageUrl, // URL ของรูปที่เซิร์ฟเวอร์
            base64: base64Image // รูปในรูปแบบ Base64
        });

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
    }
});

router.get("/latest-image", (req, res) => {
    try {
        const uploadDir = path.join(__dirname, "../uploads");

        // ✅ อ่านไฟล์ทั้งหมดจากโฟลเดอร์ `uploads`
        const files = fs.readdirSync(uploadDir);

        if (files.length === 0) {
            return res.status(404).json({ message: "ไม่มีไฟล์รูปภาพในโฟลเดอร์" });
        }

        // ✅ เรียงลำดับตามวันที่อัปโหลด (ใช้ timestamp ในชื่อไฟล์)
        const sortedFiles = files
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(uploadDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); 

        // ✅ ดึงไฟล์ล่าสุด
        const latestFile = sortedFiles[0].name;
        const latestFilePath = `/uploads/${latestFile}`;
        const imageUrl = `http://localhost:8000${latestFilePath}`;

        res.json({ imageUrl });

    } catch (error) {
        console.error("Error retrieving latest image:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรูปภาพล่าสุด" });
    }
});



// ✅ API แสดงรูปภาพที่อัปโหลด
router.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: "ไม่พบรูปภาพ" });
    }
});

// ✅ API ลบรูปภาพ
router.delete("/delete-image/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: "ลบรูปภาพสำเร็จ" });
    } else {
        res.status(404).json({ message: "ไม่พบรูปภาพ" });
    }
});

module.exports = router;
