async function saveSymptoms() {
    const encrypUser = sessionStorage.getItem("stu_id");
    const userId = encrypUser ? atob(encrypUser) : null;

    if (!userId) {
        alert("ไม่พบข้อมูลผู้ใช้");
        return;
    }

    // ✅ ดึงค่าที่เลือกจาก Checkbox
    const selectedSymptoms = [...document.querySelectorAll("input[name='symptoms']:checked")]
        .map(input => input.value);

    // ✅ ดึงค่าอาการที่พิมพ์เพิ่ม
    const additionalSymptom = document.getElementById("additional-symptom").value.trim();

    try {
        const response = await axios.post("http://localhost:8000/api/employees/saveSymptoms", {
            stu_id: userId,
            symptoms: selectedSymptoms,
            additionalSymptom: additionalSymptom
        });

        if (response.status === 200) {
            alert("บันทึกอาการสำเร็จ");
            document.querySelectorAll("input[name='symptoms']").forEach(input => input.checked = false);
            document.getElementById("additional-symptom").value = "";
        }
    } catch (error) {
        console.error("Error saving symptoms:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกอาการ");
    }
}


