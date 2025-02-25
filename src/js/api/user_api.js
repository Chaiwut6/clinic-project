const fetchAppointments = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/students/appointment', null, {
      withCredentials: true,
    });

    if (response.status === 200 && response.data.success) {
      const { pendingAppointment, confirmedAppointment } = response.data;
      const appointmentTable = document.getElementById('userAppointment');
      appointmentTable.innerHTML = ''; // ล้างข้อมูลเก่า

      const formatTime = (time) => {
        if (!time) return 'ไม่ระบุ';
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        date.setMinutes(date.getMinutes() - 15); 
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      };

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
            <td>${formatTime(pendingAppointment.time_start)}</td>
            <td class="text-center">
              <button class="btn btn-success" onclick="updateStatus('${pendingAppointment.Appointment_id}', 'ยืนยัน')">ยืนยัน</button>
              <button class="btn btn-danger" onclick="updateStatus('${pendingAppointment.Appointment_id}', 'ยกเลิก')">ยกเลิก</button>
            </td>
          </tr>
        `;
        appointmentTable.innerHTML = row;
      }
      else if (confirmedAppointment) {
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(confirmedAppointment.date));

        const [endHours, endMinutes] = confirmedAppointment.time_end.split(':').map(Number);
        const appointmentDate = new Date(confirmedAppointment.date);
        const appointmentEndTime = new Date();
        const today = new Date();
        appointmentEndTime.setHours(endHours, endMinutes, 0, 0);

        const now = new Date(); 

        let formButton = '';
        if (appointmentDate < today || (appointmentDate.getTime() === today.getTime() && now > appointmentEndTime)) {
          formButton = `
            <tr>
              <td colspan="4" class="text-center">
                <a href="https://forms.gle/i2DaETjH2oMbX3mG9" target="_blank" class="btn btn-info">
                  กรอกแบบฟอร์มหลังตรวจเสร็จ
                </a>
              </td>
            </tr>
          `;
        }

        const row = `
          <tr>
            <td>${confirmedAppointment.doc_name || 'ยังไม่มีการนัด'}</td>
            <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
            <td>${formatTime(confirmedAppointment.time_start)}</td>
            <td class="text-center">
              <button class="btn btn-secondary" disabled>ยืนยันแล้ว</button>
            </td>
          </tr>
          ${formButton} 
        `;

        appointmentTable.innerHTML = row;
      } else {
        appointmentTable.innerHTML = '<tr><td colspan="4" class="text-center">ไม่มีการนัดหมาย</td></tr>';
      }
    } else {
      alert('ไม่พบข้อมูลการนัดหมาย');
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
};

const fetchNotifications = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/students/appointment', null, {
      withCredentials: true,
    });

    if (response.status === 200 && response.data.success) {
      const { pendingAppointment } = response.data;
      const notificationBadge = document.getElementById('notificationBadge');
      const alertItems = document.getElementById('alertItems');
      alertItems.innerHTML = ''; 

      if (pendingAppointment) {
        notificationBadge.textContent = "1"; // ตั้งค่าให้แจ้งเตือนมีจำนวน 1

        const formattedDate = new Intl.DateTimeFormat('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(pendingAppointment.date));

        const alertHTML = `
        <a class="dropdown-item d-flex align-items-center" href="user_main.html">
          <div class="mr-3">
              <div class="icon-circle bg-warning">
                  <i class="fas fa-exclamation-triangle text-white"></i>
              </div>
          </div>
          <div>
              <div class="small text-gray-500">${formattedDate}</div>
              มีการนัดหมายที่ต้องกดยืนยัน!
          </div>
        </a>
      `;
      

        alertItems.innerHTML = alertHTML;
      } else {
        notificationBadge.textContent = "0"; // ไม่มีการแจ้งเตือน
        alertItems.innerHTML = '<a class="dropdown-item text-center small text-gray-500" href="#">ไม่มีการแจ้งเตือน</a>';
      }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};


  const updateStatus = async (Appointment_id, status) => {
    try {
      // เรียก API เพื่ออัปเดตสถานะการนัดหมาย
      const response = await axios.post('http://localhost:8000/api/students/update-appointment', {
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
      fetchNotifications();
    }
    if (currentPage === "user_info.html") {
      fetchNotifications();
    }
    if (currentPage === "Assessment_history.html") {
      fetchNotifications();
    }
    if (currentPage === "profile.html") {
      fetchNotifications();
    }
    if (currentPage === "changepass.html") {
      fetchNotifications();
    }
  });
  