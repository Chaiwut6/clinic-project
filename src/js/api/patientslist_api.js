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
  doctorSelect.innerHTML = `<option value="">--เลือกหมอ--</option>`;

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


async function fetchPatientslist(page = 1) {
    currentPages = page;
    try {
        document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">กำลังโหลดข้อมูล...</td></tr>`;

        const response = await axios.post("http://localhost:8000/api/employees/receivecare");
        const { students, appointments } = response.data;

        if (!students || students.length === 0) {
            document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">ไม่พบข้อมูลผู้ใช้</td></tr>`;
            document.getElementById("paginationControls").innerHTML = "";
            return;
        }

        patientsData = appointments.map(appointment => {
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

            // ✅ ค้นหาข้อมูล `nickname`, `faculty`, `phone` จาก `students`
            const userInfo = students.find(user => user.stu_id === appointment.stu_id) || {};

            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString("th-TH", { 
                year: "numeric", month: "long", day: "numeric" 
            });

            return {
                stu_id: appointment.stu_id,
                title: userInfo.title,
                stu_fname: appointment.stu_fname,
                stu_lname: appointment.stu_lname,
                nickname: userInfo.nickname || "ไม่ระบุ",
                faculty: userInfo.faculty || "ไม่ระบุ",
                phone: userInfo.phone || "ไม่ระบุ",
                problem: appointment.problem || "ไม่ระบุ",
                symptoms: symptomsArray.join(" / ") || "ไม่ระบุ",
                appointmentDate: formattedDate,
                rawDate: appointmentDate,
                doctor: appointment.doc_name || "ไม่ระบุ"
            };
        });

        patientsData.sort((a, b) => b.rawDate - a.rawDate);

        filteredPatientsData = [...patientsData];
        renderPatientsTable();
        renderPaginationControls();
    } catch (error) {
        console.error("Error fetching patient data:", error);
        document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
        document.getElementById("paginationControls").innerHTML = "";
    }
}


  

function renderPatientsTable() {
    const startIndex = (currentPages - 1) * itemsPerPages;
    const endIndex = startIndex + itemsPerPages;
    const pageData = filteredPatientsData.slice(startIndex, endIndex);
  
    const rows = pageData.map((patient, index) => `
        <tr>
            <td>${startIndex + index + 1}</td>
            <td>${patient.stu_id}</td>
            <td>${patient.title} ${patient.stu_fname} ${patient.stu_lname}</td>
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
    const yearFilter = document.getElementById('yearSelect').value.trim();

    const monthMap = {
        'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
        'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
        'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    // ✅ ใช้ `patientsData` ที่โหลดจาก API
    filteredPatientsData = patientsData.filter(patient => {
        const name = (patient.stu_fname + " " + patient.stu_lname).trim().toLowerCase();
        const userID = (patient.stu_id || "").trim().toLowerCase();
        const doctor = (patient.doctor || "").trim();
        const dateText = (patient.appointmentDate || "").trim();

        let formattedMonth = "";
        let formattedYear = "";
        if (dateText) {
            const dateParts = dateText.split(' ');
            if (dateParts.length >= 3) {
                formattedMonth = monthMap[dateParts[1].trim()] || '';
                formattedYear = dateParts[2].trim();
            }
        }

        return (
            (!nameFilter || name.includes(nameFilter) || userID.includes(nameFilter)) &&
            (!doctorFilter || doctor === doctorFilter) &&
            (!monthFilter || formattedMonth === monthFilter) &&
            (!yearFilter || formattedYear === yearFilter)  // ✅ เพิ่มการกรองตามปี
        );
    });

    currentPages = 1; // รีเซ็ตหน้าแรกหลังจากกรองข้อมูล
    renderPatientsTable();
    renderPaginationControls();
}


function exportToExcel() {
  const doctorSelect = document.getElementById("doctorSelect");
  const selectedDoctor = doctorSelect.value;

  const monthSelect = document.getElementById("monthSelect");
  const selectedMonth = monthSelect.value;

  const groupedData = {};

  // ✅ ใช้ patientsData เพื่อดึงข้อมูลทุกหน้า
  patientsData.forEach((patient) => {
      const doctorName = patient.doctor || "ไม่ระบุ";
      const dateText = patient.appointmentDate || "";
      let rowMonth = "";

      // แปลงวันที่เป็นเดือน
      if (dateText) {
          const dateParts = dateText.split(" ");
          const monthMap = {
              "มกราคม": "01", "กุมภาพันธ์": "02", "มีนาคม": "03", "เมษายน": "04",
              "พฤษภาคม": "05", "มิถุนายน": "06", "กรกฎาคม": "07", "สิงหาคม": "08",
              "กันยายน": "09", "ตุลาคม": "10", "พฤศจิกายน": "11", "ธันวาคม": "12"
          };
          rowMonth = monthMap[dateParts[1]] || "";
      }

      // ✅ ตรวจสอบเงื่อนไขการกรอง
      if (
          (selectedDoctor === "" || doctorName === selectedDoctor) &&
          (selectedMonth === "" || rowMonth === selectedMonth)
      ) {
          if (!groupedData[doctorName]) {
              groupedData[doctorName] = [];
          }
          groupedData[doctorName].push([
              patient.stu_id,
              `${patient.title} ${patient.stu_fname} ${patient.stu_lname}`,
              patient.nickname || "-",
              patient.faculty || "-",
              patient.phone || "-",
              patient.problem || "-",
              patient.appointmentDate || "-",
              patient.symptoms || "-",
              patient.doctor || "-"
          ]);
      }
  });

  const workbook = XLSX.utils.book_new();

  Object.keys(groupedData).forEach((doctorName) => {
      const sheetData = [
          [`หมอที่ดูแล: ${doctorName}`],
          ["รหัสประจำตัว", "ชื่อ-นามสกุล", "ชื่อเล่น", "คณะ", "เบอร์โทร", "ปัญหา", "วันนัด", "ประเภทโรค", "หมอ"]
      ];

      sheetData.push(...groupedData[doctorName]);

      const sheetName = doctorName || "ทั้งหมด";
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // ✅ ปรับขนาดคอลัมน์ให้เหมาะสม
      worksheet["!cols"] = [
          { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
          { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 },
          { wch: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const fileName = selectedDoctor ? `รายชื่อ_${selectedDoctor}.xlsx` : "รายชื่อผู้ป่วยทั้งหมด.xlsx";
  XLSX.writeFile(workbook, fileName);
}


document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "patientslist.html") {
    fetchAppointment()
    fetchPatientslist()
  }
});