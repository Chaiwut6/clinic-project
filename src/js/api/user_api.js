const fetchAppointments = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/users/appointment', null, {
      withCredentials: true,
    });

    if (response.status === 200 && response.data.success) {
      const { pendingAppointment, confirmedAppointment } = response.data;

      const appointmentTable = document.getElementById('userAppointment');
      appointmentTable.innerHTML = ''; // ล้างข้อมูลเก่า

      // ถ้ามีการนัดที่รอการยืนยัน
      if (pendingAppointment) {
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(pendingAppointment.date));

        const row = `
          <tr>
            <td>${pendingAppointment.doc_name || 'ยังไม่มีการนัด'}</td>
            <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
            <td>${pendingAppointment.time_start || 'ไม่ระบุ'}</td>
            <td>${pendingAppointment.time_end || 'ไม่ระบุ'}</td>
            <td class="text-center">
              <button class="btn btn-success" onclick="updateStatus('${pendingAppointment.Appointment_id}', 'ยืนยัน')">ยืนยัน</button>
              <button class="btn btn-danger" onclick="updateStatus('${pendingAppointment.Appointment_id}', 'ยกเลิก')">ยกเลิก</button>
            </td>
          </tr>
        `;
        appointmentTable.innerHTML = row;
      }
      // ถ้าไม่มีการรอการยืนยัน ให้แสดงการยืนยันล่าสุด
      else if (confirmedAppointment) {
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(confirmedAppointment.date));

        const row = `
          <tr>
            <td>${confirmedAppointment.doc_name || 'ยังไม่มีการนัด'}</td>
            <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
            <td>${confirmedAppointment.time_start || 'ไม่ระบุ'}</td>
            <td>${confirmedAppointment.time_end || 'ไม่ระบุ'}</td>
            <td class="text-center">
              <button class="btn btn-secondary" disabled>ยืนยันแล้ว</button>
            </td>
          </tr>
        `;
        appointmentTable.innerHTML = row;
      } else {
        // ถ้าไม่มีข้อมูลทั้งสองแบบ
        appointmentTable.innerHTML = '<tr><td colspan="5" class="text-center">ไม่มีการนัดหมาย</td></tr>';
      }
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
    const currentPage = window.location.pathname.split("/").pop();
  
    // ตรวจสอบว่าอยู่ในหน้า user_main.html หรือไม่
    if (currentPage === "user_main.html") {
      fetchAppointments();
    }
  });
  