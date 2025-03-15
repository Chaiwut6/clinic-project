# ใช้ Node.js เวอร์ชันล่าสุดเป็น Base Image
FROM node:21

# ตั้งค่า Working Directory ภายใน Container
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี) ไปยัง Container
COPY server/package.json ./server/
WORKDIR /usr/src/app/server

# ติดตั้ง Dependencies ของ Backend
RUN npm install

# คัดลอกโค้ดทั้งหมด (Backend + Frontend) เข้าไปใน Container
COPY server/. ./server
COPY src/. ./src

# เปิด Port 8000 สำหรับ Express.js
EXPOSE 8000

# เริ่มต้น Server
CMD ["npx", "nodemon", "--legacy-watch", "server/index.js"]
