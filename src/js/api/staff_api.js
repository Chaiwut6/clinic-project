
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addDoctorForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // ป้องกันการ refresh หน้า

    // รับค่าจากฟอร์ม
    const doctorID = document.getElementById("doctorID").value.trim();
    const doctorName = document.getElementById("doctorName").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!doctorID || !doctorName || !phoneNumber) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง API
      const response = await axios.post("http://localhost:8000/api/register-doctor", {
        doc_id: doctorID,
        doc_name: doctorName,
        phone: phoneNumber,
        status: "active", // หรือสถานะเริ่มต้นที่คุณต้องการ
      });

      if (response.data && response.data.message === "Doctor registration successful") {
        alert("เพิ่มข้อมูลแพทย์สำเร็จ");
        // ปิด modal และ clear ฟอร์ม
        document.getElementById("addDoctorModal").style.display = "none";
        form.reset();
      } else {
        alert("เกิดข้อผิดพลาด: " + (response.data.message || "ไม่สามารถบันทึกข้อมูลได้"));
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  });
});


const Logout = async () => {
    try {
      // เรียก API logout ไปที่เซิร์ฟเวอร์
      const response = await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
  
      // ตรวจสอบผลลัพธ์จากการออกจากระบบ
      if (response.data.message === 'ออกจากระบบสำเร็จ') {
        console.log('คุณออกจากระบบเรียบร้อยแล้ว');
       
        // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
        window.location.href = '/view/index.html'; // 
       // หรือหน้าอื่นที่คุณต้องการ
      } else {
        console.error('การออกจากระบบล้มเหลว');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const fetchEmployeeInfo = async () => {
      try {
        // ใช้ POST แทน GET ในการดึงข้อมูล employee
        const response = await axios.post('http://localhost:8000/api/employeeinfo', {}, {
          withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
        });
  
        if (response.data && response.data.employee) {
          const employeeInfo = response.data.employee;
          console.log("employeeInfo:", employeeInfo);
  
  
          // แสดงข้อมูลบนหน้า
          updatePageData(employeeInfo);
  
        } else {
          console.error('Invalid data format received from API');
        }
      } catch (error) {
        console.error('Error fetching employee info:', error);
      }
    };
  
    const updatePageData = (employeeInfo) => {
      const updateElements = (selector, value) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => el.textContent = value || 'N/A');
        }
      };
  
      // อัปเดตข้อมูลพนักงาน
      if (employeeInfo) {
        updateElements('.employee_id', employeeInfo.employee_id);
        updateElements('.employee_roles', employeeInfo.roles);
      } else {
        console.warn("Employee info is missing");
      }
    };
  
    // เรียก fetchEmployeeInfo เมื่อโหลดหน้าเสร็จ
    if (window.location.pathname !== '/view/index.html') {
      fetchEmployeeInfo();
    }
  });
  