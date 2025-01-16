async function fetchAppointment() {
    try {
      const response = await axios.post("http://localhost:8000/api/doctors/doctorResult");
      if (response.status >= 200 && response.status < 300) {
        const doctors = response.data.doctor;
        populateDoctorDropdown(doctors);
      } else {
        throw new Error("Error fetching doctor data");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลแพทย์");
    }
  }
  
  function populateDoctorDropdown(doctors) {
    const doctorSelect = document.getElementById("doctorSelect");
  
    // เติมตัวเลือกลงใน select
    doctors.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.doc_id; 
      option.value = doctor.doc_name; 
      option.textContent = doctor.doc_name; 
      doctorSelect.appendChild(option);
    });
  
   
    doctorSelect.addEventListener("change", () => {
      selectedDoctorId = doctorSelect.value || null; // ถ้าไม่ได้เลือกให้เป็น null
      selectedDoctorName = doctors.find(doctor => doctor.doc_id === selectedDoctorId)?.doc_name || null; // ดึงชื่อแพทย์
      // console.log("Selected Doctor ID:", selectedDoctorId);
      // console.log("Selected Doctor Name:", selectedDoctorName);
    });
  }

  async function fetchPatientslist() {
    try {
      // แสดงข้อความกำลังโหลดข้อมูล
      document.getElementById("patientTable").innerHTML = `<tr><td colspan="8">กำลังโหลดข้อมูล...</td></tr>`;
  
      // เรียก API เพื่อดึงข้อมูล
      const response = await axios.post("http://localhost:8000/api/employees/receivecare");
      console.log(response.data);
  
      const { users, appointments } = response.data;
  
      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (!users || users.length === 0) {
        document.getElementById("patientTable").innerHTML = `<tr><td colspan="8">ไม่พบข้อมูลผู้ใช้</td></tr>`;
        return;
      }
  
      // สร้าง HTML สำหรับข้อมูลแต่ละแถว
      const rows = users.map((user) => {
        // หาการนัดหมายที่เกี่ยวข้องกับผู้ใช้นั้น และกรองเฉพาะที่มี status เป็น "ยืนยัน"
        const userAppointments = appointments.filter((appointment) => {
          return appointment.user_id === user.user_id && appointment.status === "ยืนยัน";
        });
  
        // หากไม่มีข้อมูลการนัดหมายที่ตรงกับเงื่อนไข
        if (userAppointments.length === 0) {
          return null; // จะไม่คืนค่าหรือไม่แสดงแถวนี้
        }
  
        const appointmentDate = userAppointments[0]?.date
          ? new Date(userAppointments[0].date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "ไม่ระบุ";
  
        // แสดงการนัดหมาย หรือข้อความ "ไม่มีการนัด"
        const appointmentDetails = userAppointments.length
          ? `
              <td>${userAppointments[0]?.problem || "ไม่ระบุ"}</td>
              <td>${appointmentDate}</td>
              <td>${userAppointments[0]?.doc_name || "ไม่ระบุ"}</td>
            `
          : `
              <td>ไม่มีการนัด</td>
              <td>ไม่มีการนัด</td>
            `;
  
        // สร้างแถวของตาราง
        return `
          <tr data-id="${user.user_id}">
            <td>${user.user_id}</td>
            <td>${(user.user_fname) + " " + (user.user_lname || "")}</td>
            <td>${user.nickname}</td>
            <td>${user.faculty}</td>
            <td>${user.phone}</td>
            ${appointmentDetails}
           
          </tr>
        `;
      }).filter(row => row !== null); // กรองค่า null ออกจาก rows
  
      // หากไม่พบข้อมูลที่ตรงกับเงื่อนไข (ไม่มีข้อมูลการนัดหมายที่ยืนยัน)
      if (rows.length === 0) {
        document.getElementById("patientTable").innerHTML = `<tr><td colspan="8">ไม่มีข้อมูลการนัดหมายที่ยืนยัน</td></tr>`;
      } else {
        // แสดงข้อมูลใน <tbody>
        document.getElementById("patientTable").innerHTML = rows.join("");
      }
  
    } catch (error) {
      console.error("Error fetching user and appointment data:", error);
      document.getElementById("patientTable").innerHTML = `<tr><td colspan="8">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    }
  }
  
  
  
  

  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "patientslist.html") {
      fetchAppointment()
      fetchPatientslist()
    }
  });