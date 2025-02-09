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
        const response = await axios.post("http://localhost:8000/api/upload/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const imageUrl = response.data.imageUrl; // URL ที่เซิร์ฟเวอร์ส่งกลับมา

        // ✅ อ่านไฟล์เป็น Base64 และเก็บใน localStorage
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const base64Image = reader.result;
            // console.log(base64Image);
            localStorage.setItem("uploadedImage", base64Image);

            alert("อัปโหลดรูปภาพสำเร็จ!");

            // ✅ แสดงรูปที่อัปโหลดจาก localStorage
            
            document.getElementById("clinicImage").src == base64Image;
        };

        // ✅ ตั้งค่าให้ `<img>` ใช้ภาพจากเซิร์ฟเวอร์แทน
        document.getElementById("clinicImage").src == imageUrl;

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
       
    }
}

// ✅ โหลดรูปจาก localStorage ทันทีที่เปิดหน้า
document.addEventListener("DOMContentLoaded", () => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
        document.getElementById("clinicImage").src = savedImage;
    }
});