async function fetchAppointment() {
  try {
    const response = await axios.post("http://localhost:8000/api/doctors/doctorResult");
    if (response.status >= 200 && response.status < 300) {
      let doctors = response.data.doctor;

      // ลบรายการแพทย์ที่ซ้ำ
      doctors = removeDuplicateDoctors(doctors);

      // เติมตัวเลือกลงใน select
      populateDoctorDropdown(doctors);
    } else {
      throw new Error("Error fetching doctor data");
    }
  } catch (error) {
    console.error("Error:", error);
    // alert("เกิดข้อผิดพลาดในการดึงข้อมูลแพทย์");
  }
}

function removeDuplicateDoctors(doctors) {
  const uniqueDoctors = [];
  const seen = new Set();

  doctors.forEach(doctor => {
    if (!seen.has(doctor.doc_id)) {
      uniqueDoctors.push(doctor);
      seen.add(doctor.doc_id);
    }
  });

  return uniqueDoctors;
}

function populateDoctorDropdown(doctors) {
  const doctorSelect = document.getElementById("doctorSelect");

  // ลบตัวเลือกเก่าที่อาจมีอยู่แล้วใน select
  doctorSelect.innerHTML = `<option value="">--เลือกแพทย์--</option>`;

  // เติมตัวเลือกลงใน select
  doctors.forEach(doctor => {
    const option = document.createElement("option");
    option.value = doctor.doc_name; // ใช้ doc_id เป็น value
    option.textContent = doctor.doc_name; // ใช้ doc_name เป็นข้อความ
    doctorSelect.appendChild(option);
  });

  doctorSelect.addEventListener("change", () => {
    const selectedDoctorId = doctorSelect.value || null; // ถ้าไม่ได้เลือกให้เป็น null
    const selectedDoctor = doctors.find(doctor => doctor.doc_id === selectedDoctorId);
    const selectedDoctorName = selectedDoctor ? selectedDoctor.doc_name : null; // ดึงชื่อแพทย์
  });
}

let currentPages = 1;
const itemsPerPages = 12;
let patientsData = []; 
let filteredPatientsData = [];

// ✅ ฟังก์ชันโหลดข้อมูลผู้ป่วยจาก API
async function fetchPatientslist(page = 1) {
  currentPages = page;
  try {
      document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">กำลังโหลดข้อมูล...</td></tr>`;

      const response = await axios.post("http://localhost:8000/api/employees/receivecare");
      const { users, appointments } = response.data;

      if (!users || users.length === 0) {
          document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">ไม่พบข้อมูลผู้ใช้</td></tr>`;
          document.getElementById("paginationControls").innerHTML = "";
          return;
      }

      let latestAppointments = {};

      // ✅ เลือกเฉพาะวันนัดหมายล่าสุดของแต่ละ `user_id`
      appointments.forEach(appointment => {
          if (appointment.status !== "ยืนยัน") return;

          const userId = appointment.user_id;
          const appointmentDate = new Date(appointment.date);

          // ถ้า user_id ยังไม่มีข้อมูล หรือ ถ้าวันใหม่กว่า ให้เก็บไว้
          if (!latestAppointments[userId] || new Date(latestAppointments[userId].date) < appointmentDate) {
              latestAppointments[userId] = appointment;
          }
      });

      // ✅ เปลี่ยนจาก Object เป็น Array เพื่อใช้ในการแสดงผล
      patientsData = Object.values(latestAppointments).map(appointment => {
          let symptomsData = appointment.symptoms || "[]"; 
          let symptomsArray = [];

          try {
              if (typeof symptomsData === "string") {
                  symptomsArray = JSON.parse(symptomsData);
              } else if (Array.isArray(symptomsData)) {
                  symptomsArray = symptomsData;
              }
          } catch (error) {
              console.error("Error parsing symptoms:", error);
              symptomsArray = [];
          }

          // ✅ ค้นหาข้อมูล `nickname`, `faculty`, `phone` จาก `users`
          const userInfo = users.find(user => user.user_id === appointment.user_id) || {};

          return {
              user_id: appointment.user_id,
              user_fname: appointment.user_fname,
              user_lname: appointment.user_lname,
              nickname: userInfo.nickname || "ไม่ระบุ",
              faculty: userInfo.faculty || "ไม่ระบุ",
              phone: userInfo.phone || "ไม่ระบุ",
              problem: appointment.problem || "ไม่ระบุ",
              symptoms: symptomsArray.join(" / ") || "ไม่ระบุ",  
              appointmentDate: appointment.date
                  ? new Date(appointment.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
                  : "ไม่ระบุ",
              doctor: appointment.doc_name || "ไม่ระบุ"
          };
      });

      filteredPatientsData = [...patientsData];
      renderPatientsTable();
      renderPaginationControls();
  } catch (error) {
      console.error("Error fetching patient data:", error);
      document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
      document.getElementById("paginationControls").innerHTML = "";
  }
}



// ✅ ฟังก์ชันเรนเดอร์ตารางผู้ป่วย
function renderPatientsTable() {
  const startIndex = (currentPages - 1) * itemsPerPages;
  const endIndex = startIndex + itemsPerPages;
  const pageData = filteredPatientsData.slice(startIndex, endIndex);

  const rows = pageData.map((patient, index) => `
      <tr>
          <td>${startIndex + index + 1}</td>
          <td>${patient.user_id}</td>
          <td>${patient.user_fname} ${patient.user_lname}</td>
          <td>${patient.nickname}</td>
          <td>${patient.faculty}</td>
          <td>${patient.phone}</td>
          <td>${patient.problem}</td>
          <td>${patient.appointmentDate}</td>
          <td>${patient.symptoms}</td>
          <td>${patient.doctor}</td>
      </tr>
  `).join("");

  document.getElementById("patientTable").innerHTML = rows || `<tr><td colspan="10">ไม่มีข้อมูล</td></tr>`;
}



// ✅ ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
    const paginationContainer = document.getElementById("paginationControls");

    if (!paginationContainer) {
        console.warn("⚠️ ไม่พบ paginationControls ใน DOM");
        return;
    }

    const totalPages = Math.ceil(filteredPatientsData.length / itemsPerPages);
    let controlsHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        controlsHTML += `<button class="page-btn ${i === currentPages ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

// ✅ ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
    currentPages = page;
    renderPatientsTable();
    renderPaginationControls();
}

// ✅ ฟังก์ชันกรองข้อมูล
function filterReceivecare() {
    const nameFilter = document.getElementById('searchName').value.trim().toLowerCase();
    const doctorFilter = document.getElementById('doctorSelect').value.trim();
    const monthFilter = document.getElementById('monthSelect').value.trim();

    const monthMap = {
        'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
        'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
        'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    // ✅ ใช้ `patientsData` ที่โหลดจาก API
    filteredPatientsData = patientsData.filter(patient => {
        const name = (patient.user_fname + " " + patient.user_lname).trim().toLowerCase();
        const userID = (patient.user_id || "").trim().toLowerCase();
        const doctor = (patient.doctor || "").trim();
        const dateText = (patient.appointmentDate || "").trim();

        let formattedMonth = "";
        if (dateText) {
            const dateParts = dateText.split(' ');
            if (dateParts.length >= 2) {
                formattedMonth = monthMap[dateParts[1].trim()] || '';
            }
        }

        return (
            (!nameFilter || name.includes(nameFilter) || userID.includes(nameFilter)) &&
            (!doctorFilter || doctor === doctorFilter) &&
            (!monthFilter || formattedMonth === monthFilter)
        );
    });

    currentPages = 1; // รีเซ็ตหน้าแรกหลังจากกรองข้อมูล
    renderPatientsTable();
    renderPaginationControls();
}


document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "patientslist.html") {
    fetchAppointment()
    fetchPatientslist()
  }
});