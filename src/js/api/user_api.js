const fetchAppointments = async () => {
    try {
      const user_id = sessionStorage.getItem('user_id');

      // เรียก API เพื่อนำข้อมูลนัดหมาย
      const response = await axios.post('http://localhost:8000/api/users/appointment', { user_id: user_id });
  
      // ตรวจสอบสถานะการตอบกลับ
      if (response.status === 200 && response.data.success) {
        const appointments = response.data.appointments;
  
        // ดึง tbody element
        const appointmentTable = document.querySelector('#userAppointment');
  
        // ลบข้อมูลเก่าทั้งหมดในตาราง (กรณีที่มีการอัปเดต)
        appointmentTable.innerHTML = '';
  
        // สร้างแถวสำหรับข้อมูลแต่ละรายการที่มี status ไม่เป็น 'ยกเลิก'
        appointments.forEach((appointment) => {
          // ตรวจสอบว่า status ไม่เป็น 'ยกเลิก'
          if (appointment.status !== 'ยกเลิก') {
            // จัดรูปแบบวันที่
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(appointment.date));
  
            // กำหนดปุ่มที่จะแสดง
            let buttonHtml = '';
            if (appointment.status === 'รอการยืนยัน') {
              buttonHtml = `
                <button class="btn btn-success" onclick="updateStatus('${appointment.Appointment_id}', 'ยืนยัน')">ยืนยัน</button>
                <button class="btn btn-danger" onclick="updateStatus('${appointment.Appointment_id}', 'ยกเลิก')">ยกเลิก</button>
              `;
            } else if (appointment.status === 'ยืนยัน') {
              buttonHtml = `<button class="btn btn-secondary" disabled>ยืนยันแล้ว</button>`;
            }
  
            const row = `
              <tr data-id="${appointment.Appointment_id}">
                <td>${appointment.doc_name}</td>
                <td>${formattedDate}</td>
                <td class="text-center">
                  ${buttonHtml}
                </td>
              </tr>
            `;
            appointmentTable.innerHTML += row;
          }
        });
      } else {
        alert('ไม่พบข้อมูลการนัดหมาย');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  };
  




  const updateStatus = async (Appointment_id, status) => {
    try {
      // เรียก API เพื่ออัปเดตสถานะการนัดหมาย
      const response = await axios.post('http://localhost:8000/api/users/update-appointment', {
        Appointment_id: Appointment_id,
        status: status
      });

      // ตรวจสอบการอัปเดตสถานะ
      if (response.status === 200 && response.data.success) {
        alert(`สถานะการนัดหมายถูกอัปเดตเป็น ${status}`);

        // เรียกใช้ฟังก์ชัน fetchAppointments เพื่อรีเฟรชข้อมูล
        fetchAppointments();
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  

  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "user_main.html") {
        fetchAppointments();
    }
  });