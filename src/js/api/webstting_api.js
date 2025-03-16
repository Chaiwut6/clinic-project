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
        //  อัปโหลดไปยังเซิร์ฟเวอร์
        await axios.post("https://clinic-project-w900.onrender.com/api/upload/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        alert("อัปโหลดรูปภาพสำเร็จ!");

        //  โหลดรูปใหม่ทันที
        const response = await axios.get("https://clinic-project-w900.onrender.com/api/upload/latest-image");
        document.querySelector(".clinic-image").src = response.data.imageUrl;

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    try {
        //  เรียก API เพื่อตรวจสอบรูปล่าสุดในโฟลเดอร์ uploads
        const response = await axios.get("https://clinic-project-w900.onrender.com/api/upload/latest-image");
        let latestImageUrl = response.data.imageUrl;
        const defaultImage = "https://clinic-project-w900.onrender.com/uploads/default_page.jpg";
        
        //  ค้นหา .clinic-image ก่อนเปลี่ยน src
        const clinicImage = document.querySelector(".clinic-image");
        if (!clinicImage) return;

        //  ตรวจสอบว่า `latestImageUrl` มีค่าและไม่ใช่รูป default
        if (latestImageUrl && !latestImageUrl.includes("default_page.jpg")) {
            //  ตรวจสอบว่ารูปล่าสุดยังมีอยู่จริง
            const imageExists = await checkImageExists(latestImageUrl);
            clinicImage.src = imageExists ? latestImageUrl : defaultImage;
        } else {
            clinicImage.src = defaultImage;
        }

    } catch (error) {
        console.error("Error fetching latest image:", error);

        //  ใช้รูป default เมื่อเกิดข้อผิดพลาด
        const clinicImage = document.querySelector(".clinic-image");
        if (clinicImage) {
            clinicImage.src = "https://clinic-project-w900.onrender.com/uploads/default_page.jpg";
        }
    }
});

//  ฟังก์ชันตรวจสอบว่ารูปมีอยู่จริงหรือไม่
async function checkImageExists(imageUrl) {
    try {
        const response = await axios.head(imageUrl);
        return response.status === 200;
    } catch (error) {
        console.error("Error checking image existence:", error);
        return false;
    }
}





