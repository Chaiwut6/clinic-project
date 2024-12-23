

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
  