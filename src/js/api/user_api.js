const fetchAppointments = async () => {
  try {
    // เรียก API พร้อมกับการส่ง cookies (รวมถึง token)
    const response = await axios.post('http://localhost:8000/api/users/appointment', null, {
      withCredentials: true // ส่ง cookies
    });
    console.log(response.data);

    // ตรวจสอบสถานะการตอบกลับ
    if (response.status === 200 && response.data.success) {
      const appointments = response.data.appointments;

      // ถ้าไม่มีข้อมูลการนัดหมาย
      if (appointments.length === 0) {
        alert('ยังไม่มีการนัดหมาย');
        return;
      }

      // ดึง tbody element
      const appointmentTable = document.getElementById('userAppointment');

      // ลบข้อมูลเก่าทั้งหมดในตาราง (กรณีที่มีการอัปเดต)
      appointmentTable.innerHTML = '';

      // ตรวจสอบและแสดงแถวของข้อมูลที่มี status ไม่เป็น 'ยกเลิก'
      let hasAppointments = false; // ตัวแปรเพื่อเช็คว่ามีการนัดหมายที่ไม่ถูกยกเลิกหรือไม่
      appointments.forEach((appointment) => {
        if (appointment.status !== 'ยกเลิก') {
          hasAppointments = true;

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
          console.log(appointment.doc_name);
      
          // เพิ่มข้อมูลลงในตาราง
          const row = `
          <tr data-id="${appointment.Appointment_id}">
            <td>${appointment.doc_name ? appointment.doc_name : "ยังไม่มีการนัด"}</td>
            <td>${formattedDate ? formattedDate : "ยังไม่มีการนัด"}</td>
            <td class="text-center">
              ${buttonHtml ? buttonHtml : "ยังไม่มีการนัด"}
            </td>
          </tr>
        `;
          appointmentTable.innerHTML += row;
        }
      });

      // ถ้าไม่มีการนัดหมายที่ไม่ถูกยกเลิก
      if (!hasAppointments) {
        appointmentTable.innerHTML = '<tr><td colspan="3" class="text-center">ยังไม่มีการนัดหมายที่ไม่ถูกยกเลิก</td></tr>';
      }

    } else if (response.status === 404) {
      alert('ยังไม่มีการนัดหมาย');
    } else {
      alert('ไม่พบข้อมูลการนัดหมาย');
    }
  } catch (error) {
    // จัดการสถานะ 404 จากข้อผิดพลาด (เช่นเซิร์ฟเวอร์ตอบ 404)
    if (error.response && error.response.status === 404) {
      alert('ยังไม่มีการนัดหมาย');
    } else {
      console.error('Error fetching appointments:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
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
    const currentPage = window.location.pathname.split("/").pop();
  
    // ตรวจสอบว่าอยู่ในหน้า user_main.html หรือไม่
    if (currentPage === "user_main.html") {
      fetchAppointments();
    }
  });
  