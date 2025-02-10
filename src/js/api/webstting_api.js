async function uploadImage() {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("กรุณาเลือกไฟล์ก่อนอัปโหลด!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        // ✅ อัปโหลดไปยังเซิร์ฟเวอร์
        await axios.post("http://localhost:8000/api/upload/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        alert("อัปโหลดรูปภาพสำเร็จ!");

        // ✅ โหลดรูปใหม่ทันที
        const response = await axios.get("http://localhost:8000/api/upload/latest-image");
        document.querySelector(".clinic-image").src = response.data.imageUrl;

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await axios.get("http://localhost:8000/api/upload/latest-image");
        let latestImageUrl = response.data.imageUrl;
        const defaultImage = "http://localhost:8000/uploads/default_page.jpg";
        
        // ✅ ตรวจสอบว่ามี `.clinic-image` ก่อนเปลี่ยน src
        const clinicImage = document.querySelector(".clinic-image");
        if (!clinicImage) return;

        // ✅ ถ้า `latestImageUrl` ไม่มีค่า หรือเป็นค่าไม่ถูกต้อง ให้ใช้ `defaultImage`
        if (!latestImageUrl || latestImageUrl.includes("uploads/profiles")) {
            clinicImage.src = defaultImage;
        } else {
            clinicImage.src = latestImageUrl;
        }

    } catch (error) {
        console.error("Error fetching latest image:", error);

        // ✅ ใช้ค่าเริ่มต้นเมื่อเกิดข้อผิดพลาด
        const clinicImage = document.querySelector(".clinic-image");
        if (clinicImage) {
            clinicImage.src = "http://localhost:8000/uploads/default_page.jpg";
        }
    }
});





