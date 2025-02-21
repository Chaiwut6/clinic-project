let currentPages = 1;
const itemsPerPages = 12;
let patientsData = []; 
let filteredPatientsData = [];

async function fetchPatientslist(page = 1) {
    currentPages = page;
    try {
        document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">ยังไม่มีข้อมูล</td></tr>`;

        const response = await axios.post("http://localhost:8000/api/doctors/doctorappointments", {}, {
            withCredentials: true
        });

        if (!response.data || !response.data.appointments || response.data.appointments.length === 0) {
            document.getElementById("patientTable").innerHTML = `<tr><td colspan="9">ไม่พบข้อมูลผู้ป่วย</td></tr>`;
            document.getElementById("paginationControls").innerHTML = "";
            return;
        }

        let latestAppointments = {};

        // ✅ คัดกรองเฉพาะวันนัดล่าสุดของแต่ละ user_id
        response.data.appointments.forEach(appointment => {
            const userId = appointment.user_id;
            const appointmentDate = new Date(appointment.date);

            if (
                !latestAppointments[userId] || 
                new Date(latestAppointments[userId].date) < appointmentDate
            ) {
                latestAppointments[userId] = appointment;
            }
        });

        // ✅ แปลง Object กลับเป็น Array เพื่อใช้แสดงผล
        patientsData = Object.values(latestAppointments).map(appointment => {
            const rawDate = new Date(appointment.date); // ✅ เก็บ Date Object สำหรับการเรียงลำดับ
            const thaiDate = rawDate.toLocaleDateString("th-TH", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
            });
            return {
                Appointment_id: appointment.Appointment_id,
                user_id: appointment.user_id,
                title: appointment.title,
                user_fname: appointment.user_fname,
                user_lname: appointment.user_lname,
                nickname: appointment.nickname,
                faculty: appointment.faculty,
                phone: appointment.phone,
                problem: appointment.problem || "ไม่ระบุ",
                rawDate: rawDate, // ✅ เก็บ Date Object สำหรับการเรียงลำดับ
                appointmentDate: thaiDate, // ✅ แสดงผลเป็น พ.ศ.
                doctor: appointment.doc_name || "ไม่ระบุ"
            };
        });

        // ✅ เรียงลำดับวันนัดจาก **ใหม่สุดไปหาเก่าสุด**
        patientsData.sort((a, b) => b.rawDate - a.rawDate);

        filteredPatientsData = [...patientsData];
        renderPatientsTable(page);
        renderPaginationControls();

    } catch (error) {
        console.error("Error fetching patient data:", error);
    }
}





// ✅ ฟังก์ชันเรนเดอร์ตารางผู้ป่วย
function renderPatientsTable(page = 1) {
    currentPages = page;  // ✅ อัปเดตค่าปัจจุบัน
    const startIndex = (page - 1) * itemsPerPages;
    const endIndex = startIndex + itemsPerPages;
    const pageData = filteredPatientsData.slice(startIndex, endIndex);

    const rows = pageData.map((patient, index) => `
        <tr data-id="${patient.Appointment_id}">
            <td>${startIndex + index + 1}</td> <!-- ✅ แสดงลำดับที่ -->
            <td>${patient.user_id}</td>
            <td>${patient.title} ${patient.user_fname} ${patient.user_lname}</td>
            <td>${patient.nickname}</td>
            <td>${patient.faculty}</td>
            <td>${patient.phone}</td>
            <td>${patient.problem}</td>
            <td>${patient.appointmentDate}</td>
            <td>
                <button class="action-btn" onclick="goToAppointmentPage('${patient.user_id}', '${patient.Appointment_id}')">จัดการข้อมูล</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("patientTable").innerHTML = rows || `<tr><td colspan="9">ไม่มีข้อมูล</td></tr>`;

    // ✅ อัปเดตปุ่มเปลี่ยนหน้า
    renderPaginationControls();
}

const goToAppointmentPage = (userId, appointmentId) => {

    const encrypAppointment = btoa(appointmentId);
    const encrypUser = btoa(userId);
    sessionStorage.setItem("appointment_id", encrypAppointment);
    sessionStorage.setItem('user_id', encrypUser);
    window.location.href = 'doctormange_data.html';
};
  


// ✅ ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
    const paginationContainer = document.getElementById("paginationControls");

    if (!paginationContainer) {
        console.warn("⚠️ ไม่พบ paginationControls ใน DOM");
        return;
    }

    const totalPages = Math.ceil(filteredPatientsData.length / itemsPerPage);
    let controlsHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

function changePage(page) {
    currentPages = page;
    renderPatientsTable(page);
}

function filterReceivecare() {
    const searchFilter = document.getElementById('searchName').value.trim().toLowerCase();
    const facultyFilter = document.getElementById('searchFaculty').value.trim();
    const monthFilter = document.getElementById('monthSelect').value.trim();
    const yearFilter = document.getElementById('yearSelect').value.trim();

    const monthMap = {
        'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
        'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
        'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    };

    filteredPatientsData = patientsData.filter(patient => {
        const fullName = (patient.user_fname + " " + patient.user_lname).trim().toLowerCase();
        const userID = (patient.user_id || "").trim().toLowerCase();
        const faculty = (patient.faculty || "").trim();
        const dateText = (patient.appointmentDate || "").trim();

        // ✅ คำนวณเดือนที่ตรงกัน
        let formattedMonth = "";
        let formattedYear = "";
        if (dateText) {
            const dateParts = dateText.split(' ');
            if (dateParts.length >= 2) {
                formattedMonth = monthMap[dateParts[1].trim()] || '';
                formattedYear = dateParts[2].trim();
            }
        }

        return (
            // ✅ ค้นหาจาก ชื่อ-นามสกุล หรือ รหัสประจำตัว
            (!searchFilter || fullName.includes(searchFilter) || userID.includes(searchFilter)) &&
            (!facultyFilter || faculty === facultyFilter) &&
            (!monthFilter || formattedMonth === monthFilter) &&
            (!yearFilter || formattedYear === yearFilter)
        );
    });

    currentPages = 1;  
    renderPatientsTable();
    renderPaginationControls();
}






document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "doc_main.html") {
    fetchPatientslist()
  }
});