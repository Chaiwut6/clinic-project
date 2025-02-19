const fetchAdminInfo = async () => {
    try {
      // ใช้ POST แทน GET ในการดึงข้อมูล employee
      const response = await axios.post(`http://localhost:8000/api/admin/admininfo`, {}, {
        withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
      });
      // console.log(response);
  
      if (response.data && response.data.admin) {
        const adminInfo = response.data.admin;
        // console.log("adminInfo:", adminInfo);

  
  
        // แสดงข้อมูลบนหน้า
        updatePageData(adminInfo);
  
      } else {
        console.error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addDoctorForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // ป้องกันการ refresh หน้า

    // รับค่าจากฟอร์ม
    const doctorID = document.getElementById("doctorID").value.trim();
    const doctorName = document.getElementById("doctorName").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!doctorID || !doctorName || !phoneNumber|| !password || !confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password !== confirmPassword) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    // ตรวจสอบเบอร์โทรศัพท์
    if (!/^\d{10}$/.test(phoneNumber)) {
      alert("กรุณากรอกเบอร์โทรที่ถูกต้อง (10 ตัวและเป็นเลขเท่านั้น)");
      document.getElementById("phoneNumber").focus();
      return;
    }


    try {
      // ส่งข้อมูลไปยัง API
      const response = await axios.post("http://localhost:8000/api/doctors/register-doctor", {
        doc_id: doctorID,
        doc_name: doctorName,
        phone: phoneNumber,
        password: password,
      });

      if (response.data && response.data.message === "Doctor registration successful") {
        alert("เพิ่มข้อมูลหมอสำเร็จ");
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
  
  const updatePageData = (adminInfo) => {
    const updateElements = (selector, value) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => el.textContent = value || 'N/A');
      }
    };
  
    if (adminInfo) {
      updateElements('.admin_id', adminInfo.admin_id);
      updateElements('.adm_fname', adminInfo.adm_fname);
      updateElements('.adm_lname', adminInfo.adm_lname);
    } else {
      console.warn("admin info is missing");
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addEmployeeForm");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // ป้องกันการ refresh หน้า
  
      // รับค่าจากฟอร์ม
      const employeeID = document.getElementById("employeeId").value;
      const emp_fname = document.getElementById('emp_fname').value;
      const emp_lname = document.getElementById('emp_lname').value;
      const emp_password = document.getElementById('emp_password').value;
      const emp_confirmPassword = document.getElementById('emp_confirmPassword').value;
  
      // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!employeeID || !emp_fname || !emp_lname || !emp_password || !emp_confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
  
      if (emp_password !== emp_confirmPassword) {
        alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
  
      try {
        // ส่งข้อมูลไปยัง API
        const response = await axios.post('http://localhost:8000/api/employees/register-employee', {
          employee_id: employeeID,
          password: emp_password,
          emp_fname: emp_fname,
          emp_lname: emp_lname
        });
  
        // เปลี่ยนข้อความในการตรวจสอบให้ตรงกับข้อความที่ API ส่งกลับ
        if (response.data && response.data.message === "Employee registered successfully") {
          alert("เพิ่มข้อมูลพนักงานสำเร็จ");
          document.getElementById("addEmployeeModal").style.display = "none";
          form.reset();
        } else {
          alert("เกิดข้อผิดพลาด: " + (response.data.message || "ไม่สามารถบันทึกข้อมูลได้"));
        }
      } catch (error) {
        console.error("Error adding employee:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    });
  });
  //เพิ่มผู้บริหาร
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addmangerForm");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // ป้องกันการ refresh หน้า
  
      // รับค่าจากฟอร์ม
      const mangerID = document.getElementById("mangerID").value;
      const man_fname = document.getElementById('man_fname').value;
      const man_lname = document.getElementById('man_lname').value;
      const man_password = document.getElementById('man_password').value;
      const man_confirmPassword = document.getElementById('man_confirmPassword').value;
  
      // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!mangerID || !man_fname || !man_lname || !man_password || !man_confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
  
      if (man_password !== man_confirmPassword) {
        alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
  
      try {
        // ส่งข้อมูลไปยัง API
        const response = await axios.post('http://localhost:8000/api/manager/register-manger', {
          man_id: mangerID,
          password: man_password,
          man_fname: man_fname,
          man_lname: man_lname
        });
  
        // เปลี่ยนข้อความในการตรวจสอบให้ตรงกับข้อความที่ API ส่งกลับ
        if (response.data && response.data.message === "Manager registered successfully") {
          alert("เพิ่มข้อมูลพนักงานสำเร็จ");
          document.getElementById("addMangerModal").style.display = "none";
          form.reset();
        } else {
          alert("เกิดข้อผิดพลาด: " + (response.data.message || "ไม่สามารถบันทึกข้อมูลได้"));
        }
      } catch (error) {
        console.error("Error adding Manger:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    });
  });
  
  
  
  const Logout = async () => {
    try {
      // เรียก API logout ไปที่เซิร์ฟเวอร์
      const response = await axios.post('http://localhost:8000/api/users/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('employeeID');
      sessionStorage.removeItem('user_id');
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
  

  let currentDoctorPage = 1;
let doctorData = [];
let filteredDoctorData = [];

async function fetchDoctors() {
  try {
    // แสดงข้อความโหลด
    document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="5">กำลังโหลดข้อมูล...</td></tr>`;

    // ดึงข้อมูลแพทย์จาก API
    const response = await axios.post("http://localhost:8000/api/doctors/doctorResult");
    doctorData = response.data?.doctor || [];

    if (doctorData.length === 0) {
      document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="5">ไม่พบข้อมูลหมอ</td></tr>`;
      document.getElementById("doctorPaginationControls").innerHTML = "";
      return;
    }

    // ตั้งค่าเริ่มต้นสำหรับการกรอง
    filteredDoctorData = [...doctorData];

    // เรนเดอร์ตารางและปุ่มแบ่งหน้า
    renderDoctorTable();
    renderDoctorPaginationControls();
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="5">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    document.getElementById("doctorPaginationControls").innerHTML = "";
  }
}

// ✅ ฟังก์ชันกรองข้อมูลแพทย์
function filterDoctor() {
  const nameFilter = document.getElementById('searchdoctor').value.toLowerCase();

  filteredDoctorData = doctorData.filter(doc => {
    const ID = (doc.doc_id || "").toLowerCase();
    const name = (doc.doc_name || "").toLowerCase();

    return ID.includes(nameFilter) || name.includes(nameFilter) || !nameFilter;
  });

  currentDoctorPage = 1; // รีเซ็ตไปหน้าที่ 1
  renderDoctorTable();
  renderDoctorPaginationControls();
}

// ✅ ฟังก์ชันเรนเดอร์ตารางแพทย์
function renderDoctorTable() {
  const startIndex = (currentDoctorPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredDoctorData.slice(startIndex, endIndex);

  const rows = pageData.map((doc, index) => {
    const displayIndex = startIndex + index + 1; // คำนวณลำดับที่

    return `
    <tr data-id="${doc.doc_id}">
      <td>${displayIndex}</td>
      <td>${doc.doc_id || "ไม่ระบุ"}</td>
      <td>${doc.doc_name || "ไม่ระบุ"}</td>
      <td>${doc.phone || "ไม่ระบุ"}</td>
      <td>
        <div class="dropdown-doctor">
          <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
          <div class="dropdown-content">
            <a href="#" class="editBtn" onclick="editDoctor('${doc.doc_id}', '${doc.doc_name}', '${doc.phone}')">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>แก้ไขข้อมูล</span>
            </a>
            <a href="#" class="delete-trigger" onclick="deleteDoctor('${doc.doc_id}')">
              <i class="fa-solid fa-trash"></i>
              <span>ลบ</span>
            </a>
            <a href="#" class="manageAvailability" onclick="openAvailabilityModal('${doc.doc_id}', '${doc.doc_name}')">
              <i class="fa-solid fa-calendar"></i>
              <span>จัดการวันว่าง</span>
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
  }).join("");

  document.getElementById("doctorinTable").innerHTML = rows || `<tr><td colspan="5">ไม่พบข้อมูล</td></tr>`;
  
  attachDropdownEventListeners(); 

  
}

// ✅ ฟังก์ชันจัดการ Dropdown
function attachDropdownEventListeners() {
  document.querySelectorAll(".actionBtn").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // ป้องกันการปิด dropdown ทันทีที่กด
      const dropdown = button.closest(".dropdown-doctor");
      const dropdownContent = dropdown.querySelector(".dropdown-content");

      // ปิด dropdown อื่นๆ ก่อน
      document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove("show");
          openDropdown.querySelector(".dropdown-content").style.display = "none";
        }
      });

      // เปิด/ปิด dropdown
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
        dropdownContent.style.display = "none";
      } else {
        dropdown.classList.add("show");
        dropdownContent.style.display = "block";
      }
    });
  });

  // ✅ ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
      openDropdown.classList.remove("show");
      openDropdown.querySelector(".dropdown-content").style.display = "none";
    });
  });
}

// ✅ ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderDoctorPaginationControls() {
  const paginationContainer = document.getElementById("doctorPaginationControls");
  
  if (!paginationContainer) {
    console.warn("⚠️ ไม่พบ doctorPaginationControls ใน DOM");
    return; // หยุดทำงานถ้าไม่พบ element
  }

  const totalPages = Math.ceil(filteredDoctorData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentDoctorPage ? 'active' : ''}" onclick="changeDoctorPage(${i})">${i}</button>`;
  }

  paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

function changeDoctorPage(page) {
  currentDoctorPage = page;
  renderDoctorTable();
  renderDoctorPaginationControls();
}

function editDoctor(docId, docName, docPhone) {
  const formHtml = `
    <div class="popup-container">
      <div class="popup-content">
        <div>
          <span class="close" id="cancelEdit">&times;</span>
        </div>
        <label for="editName">ชื่อหมอ</label>
        <input type="text" id="editName" value="${docName}" required />
        <label for="editPhone">เบอร์โทรศัพท์</label>
        <input type="text" id="editPhone" value="${docPhone}" pattern="^\\d{10}$" title="กรุณากรอกตัวเลข 10 หลัก" required />
        <button id="saveEdit">บันทึก</button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", formHtml);

  document.getElementById("saveEdit").addEventListener("click", async () => {
    const newName = document.getElementById("editName").value;
    const newPhone = document.getElementById("editPhone").value;

    try {
      await axios.post("http://localhost:8000/api/doctors/doctorUpdate", {
        doc_id: docId,
        doc_name: newName,
        phone: newPhone,
      });

      alert("แก้ไขข้อมูลสำเร็จ");
      document.querySelector(".popup-container").remove();
      fetchDoctors();
    } catch (err) {
      console.error("Error updating doctor data:", err);
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  });

  document.getElementById("cancelEdit").addEventListener("click", () => {
    document.querySelector(".popup-container").remove();
  });
}

async function deleteDoctor(docId) {
  if (!confirm("คุณต้องการลบข้อมูลหมอนี้หรือไม่?")) return;

  try {
    await axios.post("http://localhost:8000/api/doctors/doctorDelete", { doc_id: docId });
    alert("ลบข้อมูลหมอสำเร็จ");
    fetchDoctors();
  } catch (err) {
    console.error("Error deleting doctor data:", err);
    alert("เกิดข้อผิดพลาดในการลบข้อมูล");
  }
}

function openAvailabilityModal(doctorID, doctorName) {
  const modal = document.getElementById("availabilityModal");
  document.getElementById("doctorNameTitle").textContent = doctorName;
  modal.setAttribute("data-doctor-id", doctorID);
  modal.style.display = "block";
  fetchAvailability(doctorID);
}

function closeAvailabilityModal() {
  const modal = document.getElementById("availabilityModal");
  modal.style.display = "none";
}

let currentPage = 1;
let availabilityData = []; // เก็บข้อมูลทั้งหมดหลังจากดึงจาก API


async function fetchAvailability(doctorID) { 
  try {
    const response = await axios.post("http://localhost:8000/api/doctors/get-availability", { doc_id: doctorID });
    availabilityData = response.data.availability || [];

    // เรียงวันจากน้อยไปมาก
    availabilityData.sort((a, b) => new Date(a.available_date) - new Date(b.available_date));

    currentPage = 1; // รีเซ็ตหน้าปัจจุบัน
    updateAvailabilityTable();
  } catch (error) {
    console.error("Error fetching availability:", error);
    document.getElementById("availabilityTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}

// ✅ อัปเดตตารางเมื่อเลือกเดือน
function updateAvailabilityTable() {
  const selectedMonth = document.getElementById("monthFilter").value;
  
  // กรองข้อมูลตามเดือนที่เลือก
  filteredData = selectedMonth
    ? availabilityData.filter(item => new Date(item.available_date).getMonth() + 1 == selectedMonth)
    : [...availabilityData]; // ถ้าไม่เลือกเดือนให้แสดงทั้งหมด

  renderAvailabilityTable();
  renderPaginationControls();
}

function renderAvailabilityTable() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const rows = pageData.map((item) => {
    const formattedDate = new Date(item.available_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedStartTime = item.start_time.slice(0, 5);
    const formattedEndTime = item.end_time.slice(0, 5);

    return `
      <tr>
        <td>${formattedDate}</td>
        <td>${formattedStartTime}</td>
        <td>${formattedEndTime}</td>
        <td>
          <button class="delete-availability" data-id="${item.Availability_id}">ลบ</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("availabilityTable").innerHTML = rows || `<tr><td colspan="4">ไม่มีข้อมูลวันว่าง</td></tr>`;
  attachDeleteAvailabilityListeners();
}

// ✅ สร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  document.getElementById("paginationControls").innerHTML = totalPages > 1 ? controlsHTML : "";
}

// ✅ ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderAvailabilityTable();
  renderPaginationControls();
}

// ✅ ผูก Event Listener ให้ปุ่มลบ
function attachDeleteAvailabilityListeners() {
  document.querySelectorAll(".delete-availability").forEach(button => {
    button.addEventListener("click", async (event) => {
      const availabilityId = event.target.dataset.id;
      if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
        try {
          await axios.post("http://localhost:8000/api/doctors/delete-availability", { Availability_id: availabilityId });
          alert("ลบรายการสำเร็จ");
          fetchAvailability(sessionStorage.getItem("selectedDoctorID")); // รีโหลดตารางใหม่
        } catch (error) {
          console.error("Error deleting availability:", error);
          alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      }
    });
  });
}

function attachDeleteAvailabilityListeners(doctorID) {
  document.querySelectorAll(".delete-availability").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const availabilityId = event.target.dataset.id;
      if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
        try {
          await axios.post("http://localhost:8000/api/doctors/delete-availability", { Availability_id: availabilityId });
          alert("ลบรายการสำเร็จ");
          fetchAvailability(doctorID);
        } catch (error) {
          console.error("Error deleting availability:", error);
          alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      }
    });
  });
}

function addAvailabilityEventListener() {
  const form = document.getElementById("addAvailabilityForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const modal = document.getElementById("availabilityModal");
    const doctorID = modal ? modal.getAttribute("data-doctor-id") : sessionStorage.getItem("selectedDoctorID");
    const availableDate = document.getElementById("availableDate").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!doctorID || !availableDate || !startTime || !endTime) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/doctors/add-availability", {
        doc_id: doctorID,
        available_date: availableDate,
        start_time: startTime,
        end_time: endTime,
      });

      if (response.data.message === "Availability added successfully") {
        alert("เพิ่มวันว่างสำเร็จ");
        fetchAvailability(doctorID);
      } else {
        alert("เกิดข้อผิดพลาด: " + response.data.message);
      }
    } catch (error) {
      console.error("Error adding availability:", error);
      alert("เกิดข้อผิดพลาด");
    }
  });
}

let adminData = [];
let filteredAdminData = [];

// ✅ ฟังก์ชันโหลดข้อมูลเจ้าหน้าที่จาก API
async function fetchEmployee(page = 1) {
    currentPage = page;
    try {
        document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;

        const response = await axios.post("http://localhost:8000/api/employees/employeeResult");
        const { employee } = response.data;

        if (!employee || employee.length === 0) {
            document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลพนักงาน</td></tr>`;
            document.getElementById("paginationControls").innerHTML = "";
            return;
        }


        adminData = [...employee];
        filteredAdminData = [...adminData];

        renderAdminTable();
        renderPaginationControls();
       
    } catch (error) {
        console.error("Error fetching employee data:", error);
        document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
        document.getElementById("paginationControls").innerHTML = "";
    }
}


function renderAdminTable() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredAdminData.slice(startIndex, endIndex);

  const rows = pageData.map((emp,index) => {
    const displayIndex = startIndex + index + 1;
  return `
     <tr data-id="${emp.employee_id}">
      <td>${displayIndex}</td>
        <td>${emp.employee_id || "ไม่ระบุ"}</td>
        <td>${emp.emp_fname || "ไม่ระบุ"}</td>
        <td>${emp.emp_lname || "ไม่ระบุ"}</td>
        <td>
          <div class="dropdown-doctor">
              <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
              <div class="dropdown-content">
                  <a href="#" class="editBtn" data-id="${emp.employee_id}" data-fname="${emp.emp_fname}" data-lname="${emp.emp_lname}">
                      <i class="fa-solid fa-pen-to-square"></i> <span>แก้ไขข้อมูล</span>
                  </a>
                  <a href="#" class="delete-trigger" data-id="${emp.employee_id}">
                      <i class="fa-solid fa-trash"></i> <span>ลบ</span>
                  </a>
              </div>
          </div>
        </td>
      </tr>
  `}).join("");

  document.getElementById("addminTable").innerHTML = rows || `<tr><td colspan="4">ไม่มีข้อมูล</td></tr>`;
  
  attachDropdownEmployee();
  attachEditAndDeleteEvents();
}

function attachEditAndDeleteEvents() {
  // ✅ ปุ่มแก้ไข
  document.querySelectorAll(".editBtn").forEach(button => {
      button.addEventListener("click", (e) => {
          e.preventDefault();
          const empId = button.getAttribute("data-id");
          const empFname = button.getAttribute("data-fname");
          const empLname = button.getAttribute("data-lname");

          const formHtml = `
              <div class="popup-container">
                <div class="popup-content">
                  <div>
                    <span class="close" id="cancelEdit">&times;</span>
                  </div>
                  <label for="editFname">ชื่อ:</label>
                  <input type="text" id="editFname" value="${empFname}" placeholder="ชื่อพนักงาน..." required />
                  <label for="editLname">นามสกุล:</label>
                  <input type="text" id="editLname" value="${empLname}" placeholder="นามสกุล..." required />
                  <button id="saveEdit">บันทึก</button>
                </div>
              </div>
          `;

          document.body.insertAdjacentHTML("beforeend", formHtml);
          
          document.getElementById("cancelEdit").addEventListener("click", () => {
              document.querySelector(".popup-container").remove();
          });

          document.getElementById("saveEdit").addEventListener("click", async () => {
              try {
                  await axios.post("http://localhost:8000/api/employees/employeeUpdate", {
                      employee_id: empId,
                      emp_fname: document.getElementById("editFname").value,
                      emp_lname: document.getElementById("editLname").value,
                  });

                  alert("ข้อมูลพนักงานได้รับการอัปเดตเรียบร้อยแล้ว");
                  fetchEmployee();
                  document.querySelector(".popup-container").remove();
              } catch (err) {
                  console.error("Error updating employee:", err);
                  alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
              }
          });
      });
  });

  // ✅ ปุ่มลบ
  document.querySelectorAll(".delete-trigger").forEach(button => {
      button.addEventListener("click", async (e) => {
          e.preventDefault();
          const empId = button.getAttribute("data-id");

          if (confirm("คุณต้องการลบข้อมูลพนักงานนี้หรือไม่?")) {
              try {
                  await axios.post("http://localhost:8000/api/employees/employeeDelete", {
                      employee_id: empId,
                  });

                  alert("ลบข้อมูลพนักงานสำเร็จ");
                  fetchEmployee(); // รีเฟรชข้อมูล
              } catch (err) {
                  console.error("Error deleting employee:", err);
                  alert("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
          }
      });
  });
}

function attachDropdownEmployee() {
  document.querySelectorAll(".actionBtn").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // ป้องกันการปิด dropdown ทันทีที่กด
      const dropdown = button.closest(".dropdown-doctor");
      const dropdownContent = dropdown.querySelector(".dropdown-content");

      // ปิด dropdown อื่นๆ ก่อน
      document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove("show");
          openDropdown.querySelector(".dropdown-content").style.display = "none";
        }
      });

      // เปิด/ปิด dropdown
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
        dropdownContent.style.display = "none";
      } else {
        dropdown.classList.add("show");
        dropdownContent.style.display = "block";
      }
    });
  });

  // ✅ ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
      openDropdown.classList.remove("show");
      openDropdown.querySelector(".dropdown-content").style.display = "none";
    });
  });
}


function renderPaginationControls() {
  const paginationContainer = document.getElementById("PaginationControls");

  if (!paginationContainer) {
      console.warn("⚠️ ไม่พบ PaginationControls ใน DOM");
      return;
  }

  const totalPages = Math.ceil(filteredAdminData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
      controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

// ✅ ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderAdminTable();
  renderPaginationControls();
}



// ✅ ฟังก์ชันกรองข้อมูลเจ้าหน้าที่
function filterAddmin() {
    const nameFilter = document.getElementById('searchaddmin').value.trim().toLowerCase();
    const idFilter = document.getElementById('searchaddmin').value.trim().toLowerCase();

    filteredAdminData = adminData.filter(emp => {
        const name = (emp.emp_fname + " " + emp.emp_lname).trim().toLowerCase();
        const ID = (emp.employee_id || "").trim().toLowerCase();

        return (
            (!nameFilter || name.includes(nameFilter)) ||
            (!idFilter || ID.includes(idFilter))
        );
    });

    currentPage = 1;
    renderAdminTable();
    renderPaginationControls();
}


let currentUserPage = 1;
const itemsPerPage = 12;
let userData = []; // เก็บข้อมูลทั้งหมด
let filteredData = []; // เก็บข้อมูลที่ถูกกรอง

// ✅ ดึงข้อมูลผู้ใช้
async function fetchUserlist() {
  try {
    document.getElementById("UserTable").innerHTML = `<tr><td colspan="8">กำลังโหลดข้อมูล...</td></tr>`;

    const response = await axios.post("http://localhost:8000/api/employees/userList");

    userData = response.data?.users || [];
    

    filteredData = [...userData]; // ✅ สำเนาข้อมูลเพื่อใช้ในการกรอง

    if (userData.length === 0) {
      document.getElementById("UserTable").innerHTML = `<tr><td colspan="8">ไม่พบข้อมูลผู้ใช้</td></tr>`;
      document.getElementById("userPaginationControls").innerHTML = "";
      return;
    }

    renderUserTable();
    renderUserPaginationControls();
  } catch (error) {
    console.error("Error fetching user data:", error);
    document.getElementById("UserTable").innerHTML = `<tr><td colspan="8">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    document.getElementById("userPaginationControls").innerHTML = "";
  }
}


function filterPatients() {
  const nameFilter = document.getElementById('searchName').value.toLowerCase();
  const facultyFilter = document.getElementById('searchFaculty').value;

  // ✅ กรองข้อมูลจาก userData
  filteredData = userData.filter(user => {
    const ID = (user.user_id || "").toLowerCase();
    const name = `${user.title} ${user.user_fname} ${user.user_lname}`.toLowerCase();
    const faculty = user.faculty?.trim() || "";

    return (
      (ID.includes(nameFilter) || name.includes(nameFilter) || !nameFilter) &&
      (faculty === facultyFilter || !facultyFilter)
    );
  });

  currentUserPage = 1; // ✅ รีเซ็ตไปหน้าที่ 1 หลังค้นหา
  renderUserTable();
  renderUserPaginationControls();
}

// ✅ ฟังก์ชันแบ่งหน้า
function renderUserTable() {
  const startIndex = (currentUserPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const rows = pageData.map((user, index) => {
    const displayIndex = startIndex + index + 1; // ✅ ลำดับแสดงในตาราง
    return `
      <tr data-id="${user.user_id}">
        <td>${displayIndex}</td>  
        <td>${user.user_id || "ไม่ระบุ"}</td>
        <td>${user.user_fname} ${user.user_lname || "ไม่ระบุ"}</td>
        <td>${user.nickname || "ไม่ระบุ"}</td>
        <td>${user.faculty || "ไม่ระบุ"}</td>
        <td>${user.phone || "ไม่ระบุ"}</td>
        <td>${user.latest_appointment_status || "ไม่มีข้อมูล"}</td>  <!-- ✅ แสดงสถานะนัดหมายล่าสุด -->
        <td>
          <button class="action-btn" onclick="goToAppointmentPage('${user.user_id}')">จัดการข้อมูล</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("UserTable").innerHTML = rows || `<tr><td colspan="8">ไม่พบข้อมูล</td></tr>`;
}


function renderUserPaginationControls() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentUserPage ? 'active' : ''}" onclick="changeUserPage(${i})">${i}</button>`;
  }

  document.getElementById("userPaginationControls").innerHTML = totalPages > 1 ? controlsHTML : ""; 
}

function changeUserPage(page) {
  currentUserPage = page;
  renderUserTable();
  renderUserPaginationControls();
}



async function fetchUserDataAndDisplay() {
  try {
    const encrypUser = sessionStorage.getItem("user_id");
    const user_id = encrypUser ? atob(encrypUser) : null;
    if (!user_id) {
      throw new Error('User ID is not available in session storage');
    }

    const response = await axios.post("http://localhost:8000/api/employees/userdetails", { userId: user_id });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Error fetching user data');
    }

    const data = response.data;
    const user = data.user;

    // Check if user data is valid
    if (!user || !Array.isArray(user) || user.length === 0) {
      console.error('User data is missing or invalid');
      alert('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    // Populate user data on the page
    document.getElementById('userid').innerHTML = user[0].user_id;
    document.getElementById('user-fname').innerHTML = user[0].user_fname;
    document.getElementById('user-lname').innerHTML = user[0].user_lname;
    document.getElementById('user-phone').innerHTML = user[0].phone;
    document.getElementById('user-faculty').innerHTML = user[0].faculty;
    document.getElementById('user-year').innerHTML = user[0].year;
  

    const filterContainer = document.getElementById('filter-container');

    // Create <select> element for month filter
    const select = document.createElement('select');
    select.id = "assessment-month";
    select.addEventListener("change", handleMonthSelection);

    // Array of months
    const months = [
      { value: "all", text: "เลือกเดือน" },
      { value: "01", text: "มกราคม" },
      { value: "02", text: "กุมภาพันธ์" },
      { value: "03", text: "มีนาคม" },
      { value: "04", text: "เมษายน" },
      { value: "05", text: "พฤษภาคม" },
      { value: "06", text: "มิถุนายน" },
      { value: "07", text: "กรกฎาคม" },
      { value: "08", text: "สิงหาคม" },
      { value: "09", text: "กันยายน" },
      { value: "10", text: "ตุลาคม" },
      { value: "11", text: "พฤศจิกายน" },
      { value: "12", text: "ธันวาคม" }
    ];

    // Add options to the <select> element
    months.forEach(month => {
      const option = document.createElement('option');
      option.value = month.value;
      option.textContent = month.text;
      select.appendChild(option);
    });

    // Add <select> to the filter-container
    filterContainer.appendChild(select);

    // Function to filter assessment history by month
    function filterAssessmentHistory(selectedMonth) {
      const assessmentBody = document.getElementById('assessment-history-body');
      assessmentBody.innerHTML = ''; // Clear previous data
    
      const filteredResults = data.results.filter(result => {
        const date = new Date(result.date);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Format month as two digits
        return selectedMonth === 'all' || month === selectedMonth;
      });
    
      if (filteredResults.length === 0) {
        assessmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
      } else {
        filteredResults.forEach(result => {
          const date = new Date(result.date);
          const formattedDate = date.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          });

          // ✅ ตรวจสอบระดับผลการประเมินและกำหนดสี
          let assessmentClass = "";
          if (result.result.includes("ระดับน้อย")) {
              assessmentClass = "assessment-low";
          } else if (result.result.includes("ระดับปานกลาง")) {
              assessmentClass = "assessment-medium";
          } else if (result.result.includes("ระดับรุนแรง")) {
              assessmentClass = "assessment-high";
          }

          const row = document.createElement('tr');
          row.innerHTML = `<td>${formattedDate}</td><td class="${assessmentClass}">${result.result}</td>`;
          assessmentBody.appendChild(row);
      });
      }
    }

    // Handle month selection
    function handleMonthSelection() {
      const selectedMonth = document.getElementById('assessment-month').value;
      filterAssessmentHistory(selectedMonth);
    }

    // Call the function to filter the assessment history on page load
    handleMonthSelection();

    // Handle appointment month selection
    const appointmentMonthSelect = document.getElementById('appointment-month');
    appointmentMonthSelect.addEventListener('change', filterAppointmentsByMonth);

    // Function to filter appointments by month
    function filterAppointmentsByMonth() {
      const selectedMonth = appointmentMonthSelect.value;
      const appointmentBody = document.getElementById('appointment-history-body');
      appointmentBody.innerHTML = ''; // Clear previous data
    
      const filteredAppointments = data.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        const appointmentMonth = String(appointmentDate.getMonth() + 1).padStart(2, '0'); // Format month as two digits
        return selectedMonth === 'all' || appointmentMonth === selectedMonth;
      });
    
      if (filteredAppointments.length === 0) {
        appointmentBody.innerHTML = '<tr><td colspan="4">ไม่มีข้อมูล</td></tr>';
      } else {
        filteredAppointments
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // ✅ เรียงจากวันล่าสุด -> วันเก่า
        .forEach(appointment => {
          const appointmentDate = new Date(appointment.date);
          const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }); // ✅ แปลงวันที่ให้แสดงในรูปแบบไทย
      
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
            <td>${appointment.doc_name || 'ไม่ระบุ'}</td>
            <td>${Array.isArray(appointment.symptoms) ? appointment.symptoms.join(" / ") : 'ไม่ระบุ'}</td>
            <td>${appointment.status || 'ไม่ระบุ'}</td>
          `;
          appointmentBody.appendChild(row);
        });
      }
    }

    // Call function to filter appointments on page load
    filterAppointmentsByMonth();

    // Display appointment history
    const appointmentBody = document.getElementById('appointment-history-body');
    const appointmentList = document.getElementById('appointment-list');
    
    // Clear old data before rendering new data
    appointmentBody.innerHTML = '';
    appointmentList.innerHTML = '';
    
    if (!data.appointments || data.appointments.length === 0) {
      // ไม่มีข้อมูลการนัดหมาย
      appointmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
      appointmentList.innerHTML = '<tr><td colspan="3">ไม่มีการนัดล่าสุด</td></tr>';
    } else {
      // แสดงประวัติการนัดทั้งหมด
      data.appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date)) 
      .forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
          <td>${appointment.doc_name || 'ไม่ระบุ'}</td>
          <td>${Array.isArray(appointment.symptoms) ? appointment.symptoms.join(" / ") : 'ไม่ระบุ'}</td>
          <td>${appointment.status || 'ไม่ระบุ'}</td>
        `;
        appointmentBody.appendChild(row);
      });
    
      // กรองข้อมูล "รอการยืนยัน" สำหรับการนัดล่าสุด
      const pendingAppointments = data.appointments.filter(
        (appointment) => appointment.status === 'รอการยืนยัน'
      );
    
      if (pendingAppointments.length === 0) {
        // ไม่มีการนัดที่รอการยืนยัน
        appointmentList.innerHTML = '<tr><td colspan="3">ไม่มีการนัดล่าสุด</td></tr>';
      } else {
        // เรียงข้อมูลตามวันที่ล่าสุด
        const sortedAppointments = pendingAppointments.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // เรียงจากวันที่ล่าสุด
        });
    
        // แสดงเฉพาะการนัดที่รอการยืนยันล่าสุด
        const firstAppointment = sortedAppointments[0];
        const firstAppointmentDate = new Date(firstAppointment.date);
        const formattedFirstDate = firstAppointmentDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    
        const row2 = document.createElement('tr');
        row2.innerHTML = `
          <td>${formattedFirstDate || 'ยังไม่มีการนัด'}</td>
          <td>${firstAppointment.status || 'ยังไม่มีการนัด'}</td>
          <td>
            <button class="confirm-appointment" data-appointment-id="${firstAppointment.Appointment_id}">ยืนยัน</button>
            <button class="cancel-appointment" data-appointment-id="${firstAppointment.Appointment_id}">ยกเลิก</button>
          </td>
        `;
        appointmentList.appendChild(row2);
    
       // เพิ่ม Event Listener ให้กับปุ่ม "ยกเลิก"
    const cancelButton = row2.querySelector('.cancel-appointment');
    cancelButton.addEventListener('click', handleCancelAppointment);

    // เพิ่ม Event Listener ให้กับปุ่ม "ยืนยัน"
    const confirmButton = row2.querySelector('.confirm-appointment');
    confirmButton.addEventListener('click', handleConfirmAppointment);
      }
    }
    
    // ฟังก์ชันยกเลิกการนัด
    async function handleCancelAppointment(event) {
      const appointmentId = event.target.getAttribute('data-appointment-id');
    
      try {
        const response = await axios.post("http://localhost:8000/api/employees/Statusappointments", {
          Appointment_id: appointmentId,
          status: 'ยกเลิก'
        });
    
        if (response.status === 200) {
          alert('การนัดหมายถูกยกเลิกเรียบร้อยแล้ว');
          // ดึงข้อมูลใหม่และอัปเดตตาราง
          location.reload();
          // fetchAppointmentsAndUpdateUI();
        } else {
          alert('ไม่สามารถยกเลิกการนัดหมายได้');
        }
      } catch (error) {
        console.error('Error canceling appointment:', error);
        alert('เกิดข้อผิดพลาดในการยกเลิกการนัดหมาย');
      }
    }

    async function handleConfirmAppointment(event) {
      const appointmentId = event.target.getAttribute('data-appointment-id');
    
      try {
        const response = await axios.post("http://localhost:8000/api/employees/Statusappointments", {
          Appointment_id: appointmentId,
          status: 'ยืนยัน',
        });
    
        if (response.status === 200) {
          alert('การนัดหมายได้รับการยืนยันเรียบร้อยแล้ว');
          location.reload();
        } else {
          alert('ไม่สามารถยืนยันการนัดหมายได้');
        }
      } catch (error) {
        console.error('Error confirming appointment:', error);
        alert('เกิดข้อผิดพลาดในการยืนยันการนัดหมาย');
      }
    }
    
    // ฟังก์ชันดึงข้อมูลการนัดหมายและอัปเดต UI
    // async function fetchAppointmentsAndUpdateUI() {
    //   try {
    //     const response = await axios.post("http://localhost:8000/api/employees/getAppointments");
    //     const data = response.data;
    
    //     updateAppointmentUI(data);
    //   } catch (error) {
    //     console.error("Error fetching appointments:", error);
    //     appointmentBody.innerHTML = '<tr><td colspan="2">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>';
    //     appointmentList.innerHTML = '<tr><td colspan="3">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>';
    //   }
    // }
    
    // ฟังก์ชันอัปเดต UI
    // function updateAppointmentUI(data) {
    //   // Clear tables
    //   appointmentBody.innerHTML = '';
    //   appointmentList.innerHTML = '';
    
    //   if (!data.appointments || data.appointments.length === 0) {
    //     appointmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
    //     appointmentList.innerHTML = '<tr><td colspan="3">ไม่มีการนัดล่าสุด</td></tr>';
    //     return;
    //   }
    
    //   // ดึงข้อมูลประวัติทั้งหมด
    //   data.appointments.forEach((appointment) => {
    //     const appointmentDate = new Date(appointment.date);
    //     const formattedDate = appointmentDate.toLocaleDateString('th-TH');
    
    //     const row = document.createElement('tr');
    //     row.innerHTML = `
    //       <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
    //       <td>${appointment.status || 'ไม่ระบุสถานะ'}</td>
    //     `;
    //     appointmentBody.appendChild(row);
    //   });
    
    //   // ดึงข้อมูล "รอการยืนยัน"
    //   const pendingAppointments = data.appointments.filter(
    //     (appointment) => appointment.status === 'รอการยืนยัน'
    //   );
    
    //   if (pendingAppointments.length === 0) {
    //     appointmentList.innerHTML = '<tr><td colspan="3">ไม่มีการนัดล่าสุด</td></tr>';
    //   } else {
    //     const sortedAppointments = pendingAppointments.sort((a, b) => {
    //       const dateA = new Date(a.date);
    //       const dateB = new Date(b.date);
    //       return dateB - dateA;
    //     });
    
    //     const firstAppointment = sortedAppointments[0];
    //     const firstAppointmentDate = new Date(firstAppointment.date);
    //     const formattedFirstDate = firstAppointmentDate.toLocaleDateString('th-TH');
    
    //     const row2 = document.createElement('tr');
    //     row2.innerHTML = `
    //       <td>${formattedFirstDate || 'ยังไม่มีการนัด'}</td>
    //       <td>${firstAppointment.status || 'ยังไม่มีการนัด'}</td>
    //       <td><button class="cancel-appointment" data-appointment-id="${firstAppointment.Appointment_id}">ยกเลิก</button></td>
    //     `;
    //     appointmentList.appendChild(row2);
    
    //     const cancelButton = row2.querySelector('.cancel-appointment');
    //     cancelButton.addEventListener('click', handleCancelAppointment);
    //   }
    // }
    
    document.getElementById("close-case-btn").addEventListener("click", async () => {
      const userId = document.getElementById("userid").textContent;
    
      if (!userId) {
          alert("ไม่พบรหัสผู้ใช้งาน");
          return;
      }
    
      if (!confirm("คุณต้องการปิดเคสนี้หรือไม่?")) {
          return; // หากผู้ใช้ยกเลิกการยืนยัน
      }
    
      try {
          const response = await axios.post("http://localhost:8000/api/employees/closeCase", {
              user_id: userId,
          });
    
          if (response.status === 200) {
              alert("ปิดเคสสำเร็จ");
              fetchUserDetails(userId); 
          } else {
              alert(response.data.message || "ไม่สามารถปิดเคสได้");
          }
      } catch (error) {
          console.error("Error closing case:", error);
          alert("เกิดข้อผิดพลาดในการปิดเคส");
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

const changePassword = async () => {
  document.getElementById('change-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/employees/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        alert("อัปเดตรหัสผ่านเรียบร้อยแล้ว");
        window.location.reload()
        // window.location.href = 'profile.html'; 
      } else {
        alert(response.data.message || "An error occurred");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("ไม่สามารถอัปเดตรหัสผ่าน โปรดลองอีกครั้งในภายหลัง");
    }
  });
};


let selectedDoctorId = null;
let selectedDoctorName = ''; 
const encrypUser = sessionStorage.getItem("user_id");
const userId = encrypUser ? atob(encrypUser) : null;
let userFname = '';
let userLname = '';

// ดึงข้อมูลผู้ใช้
async function fetchUserDetails() {
  try {
    const response = await axios.post("http://localhost:8000/api/employees/userdetails", { userId: userId });
    const user = response.data.user;
    if (user && user.length > 0) {
      userFname = user[0].user_fname;
      userLname = user[0].user_lname;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
  }
}

// ดึงข้อมูลแพทย์
let selectedAvailability = null;

async function fetchAppointment() {
  try {
    const response = await axios.post("http://localhost:8000/api/doctors/doctorResult");
    const doctors = response.data.doctor;
    if (doctors && doctors.length > 0) {
      populateDoctorDropdown(doctors);
    } else {
      alert("ไม่พบข้อมูลหมอ");
    }
  } catch (error) {
    console.error("Error fetching doctor data:", error);
  }
}

function populateDoctorDropdown(doctors) {
  const doctorSelect = document.getElementById("doctor");

  if (!doctorSelect) {
    console.error("Element with id 'doctor' not found.");
    return;
  }

  doctorSelect.innerHTML = '<option value="">--เลือกหมอ--</option>';

  doctors.forEach(doctor => {
    const option = document.createElement("option");
    option.value = doctor.doc_id;
    option.textContent = doctor.doc_name;
    doctorSelect.appendChild(option);
  });

  doctorSelect.addEventListener("change", async () => {
    selectedDoctorId = doctorSelect.value || null;
    selectedDoctorName = doctors.find(doctor => doctor.doc_id === selectedDoctorId)?.doc_name || null;

    if (selectedDoctorId) {
      await fetchAvailabilityList(selectedDoctorId);
    }
  });
}

function populateMonthDropdown() {
  const monthSelect = document.getElementById("monthFilter");

  if (!monthSelect) {
    console.error("Element with id 'monthFilter' not found.");
    return; // หยุดทำงานหากไม่พบ element
  }

  const currentYear = new Date().getFullYear();

  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = `${currentYear}-${month.toString().padStart(2, "0")}`;
    option.textContent = new Date(currentYear, month - 1).toLocaleString("th-TH", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    monthSelect.appendChild(option);
  }

  monthSelect.addEventListener("change", () => {
    const selectedMonth = monthSelect.value;
    filterAvailabilityByMonth(availability, selectedMonth);
  });
}

let availability = [];

async function fetchAvailabilityList(docId) {
  try {
    const response = await axios.post("http://localhost:8000/api/doctors/getAvailabilitytime", {
      doc_id: docId,
    });

    availability = response.data?.availability || [];
    populateMonthDropdown();
    filterAvailabilityByMonth(availability);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert(error.response.data.message || "ยังไม่มีการเพิ่มวันที่ว่าง"); 
    } else {
      console.error("Error fetching availability:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลวันเวลาที่ว่างของหมอ");
    }
  }
}


function filterAvailabilityByMonth(availability, selectedMonth = "") {
  const filteredAvailability = availability.filter(item => {
    const itemDate = new Date(item.available_date);
    const itemMonth = itemDate.getMonth() + 1; // ดึงเดือนจากวันที่ (0-indexed)
    return selectedMonth ? itemMonth === parseInt(selectedMonth, 10) : true;
  });

  populateAvailabilityTable(filteredAvailability);
}

function populateAvailabilityTable(availability) {
  const tableBody = document.getElementById("availabilityTable");
  tableBody.innerHTML = "";

  if (!Array.isArray(availability) ||availability.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "ไม่มีข้อมูลวันเวลาที่หมอว่าง";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  availability.forEach(item => {
    const row = document.createElement("tr");
  
    // ตรวจสอบและแปลงค่าของวันที่
    const formattedDate = item.available_date
      ? new Date(item.available_date).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Invalid Date";
  
    // ตรวจสอบและแปลงค่าของเวลา
    const timeStart = item.start_time ? item.start_time.slice(0, 5) : "N/A";
    const timeEnd = item.end_time ? item.end_time.slice(0, 5) : "N/A";
  
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${timeStart}</td>
      <td>${timeEnd}</td>
    `;
  
    // เพิ่ม Event Listener ให้ทุกแถว
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      selectedAvailability = item;
      alert(`เลือกวันและเวลานี้: ${formattedDate} (${timeStart} - ${timeEnd})`);
    });
  
    tableBody.appendChild(row);
  });
}


async function saveAppointment() {
  const problem = document.getElementById("problem").value.trim();
  const available_date = document.getElementById("availableDate").value.trim();
  const start_time = document.getElementById("timeStart").value.trim();
  const end_time = document.getElementById("timeEnd").value.trim();

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!userId || !selectedDoctorId || !available_date || !problem || !start_time || !end_time) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  // ตรวจสอบว่าเลือกวันที่ในอดีตหรือไม่
  const today = new Date();
  const selectedDate = new Date(available_date);
  today.setHours(0, 0, 0, 0); 
  if (selectedDate < today) {
    alert("ไม่สามารถเลือกวันที่ผ่านมาแล้วได้");
    return;
  }

  const appointmentId = generateUniqueAppointmentId(userId, available_date);

  const appointmentData = {
    Appointment_id: appointmentId,
    user_id: userId,
    user_fname: userFname,
    user_lname: userLname,
    doc_id: selectedDoctorId,
    doc_name: selectedDoctorName,
    time_start: start_time,
    time_end: end_time,
    date: available_date,
    problem,
    status: "รอการยืนยัน",
  };

  try {
    const response = await axios.post("http://localhost:8000/api/employees/appointments", appointmentData);

    if (response.status === 201) {
      alert(response.data.message);
      await populateAppointmentTable(selectedDoctorId, available_date);  
      location.reload();
    } else {
      alert(response.data.message || "เกิดข้อผิดพลาด");
    }
  } catch (error) {
    console.log("Error:", error);

    if (error.response && error.response.status === 400) {
      // console.log("Response Data:", error.response.data); // ตรวจสอบข้อความที่ส่งกลับ
      alert(error.response.data?.message || "เวลานัดหมายซ้ำ กรุณาเลือกเวลาอื่น");
    } else {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert(error.response ? error.response.data.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลการนัดหมาย");
    }
  }
}

async function fetchAppointments(doc_id, selectedDate) {
  try {
    const response = await axios.post("http://localhost:8000/api/employees/getAppointments", {
      doc_id,
      date: selectedDate,
    });
    return response.data.appointments || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

async function populateAppointmentTable(doc_id, selectedDate) {
  const appointmentTable = document.getElementById("appointmentTable");
  appointmentTable.innerHTML = ""; // ล้างข้อมูลในตารางก่อน

  const appointments = await fetchAppointments(doc_id, selectedDate);

  if (appointments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">ไม่มีการนัดหมายในวันที่เลือก</td>`;
    appointmentTable.appendChild(row);
    return;
  }

  // กรองข้อมูลเพิ่มเติมในกรณีที่ backend ส่งข้อมูลสถานะมา
  const validAppointments = appointments.filter(
    (appointment) => appointment.status !== "ยกเลิก"
  );

  if (validAppointments.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">ไม่มีการนัดหมายในวันที่เลือก</td>`;
    appointmentTable.appendChild(row);
    return;
  }

  validAppointments.forEach((appointment) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(appointment.date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</td>
      <td>${appointment.time_start.slice(0, 5)}</td>
      <td>${appointment.time_end.slice(0, 5)}</td>
    `;
    appointmentTable.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("doctor").addEventListener("change", async () => {
    const selectedDoctorId = document.getElementById("doctor").value;
    const availableDateInput = document.getElementById("availableDate");

    // รีเซ็ตค่าของ input[type="date"]
    availableDateInput.value = "";

    // ล้างตาราง
    document.getElementById("availabilityTable").innerHTML = "";
    document.getElementById("appointmentTable").innerHTML = "";

    if (selectedDoctorId) {
      await populateAvailabilityTable(selectedDoctorId);
    }
  });

  document.getElementById("availableDate").addEventListener("change", async () => {
    const selectedDoctorId = document.getElementById("doctor").value;
    const selectedDate = document.getElementById("availableDate").value;

    if (selectedDoctorId && selectedDate) {
      await populateAppointmentTable(selectedDoctorId, selectedDate);
    }
  });
});





// ฟังก์ชันสร้าง appointment_id ไม่ซ้ำ
function generateUniqueAppointmentId(userId, date) {
  const cleanUserId = userId.replace(/-/g, '');
  const shortUserId = cleanUserId.slice(-4);
  const formattedDate = date.replace(/-/g, '').slice(2, 8);
  const baseId = `${shortUserId}${formattedDate}`;
  const shuffledId = baseId
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return `APPT-${shuffledId.toUpperCase()}`;
}

// เรียกข้อมูลเริ่มต้น
(async function initialize() {
  await fetchUserDetails();
  await fetchAppointment();
})();



let managerData = [];
let filteredManagerData = [];

async function fetchManager(page = 1) {
  currentPage = page;
  try {
      document.getElementById("managerinTable").innerHTML = `<tr><td colspan="5">กำลังโหลดข้อมูล...</td></tr>`;

      const response = await axios.post("http://localhost:8000/api/manager/managerResult");
      const { manager } = response.data;

      if (!manager || manager.length === 0) {
          document.getElementById("managerinTable").innerHTML = `<tr><td colspan="5">ไม่พบข้อมูลผู้บริหาร</td></tr>`;
          document.getElementById("paginationControls").innerHTML = "";
          return;
      }

      managerData = [...manager];
      filteredManagerData = [...managerData];

      renderManagerTable();
      renderPaginationControls();
  } catch (error) {
      console.error("Error fetching manager data:", error);
      document.getElementById("managerinTable").innerHTML = `<tr><td colspan="5">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
      document.getElementById("paginationControls").innerHTML = "";
  }
}

function renderManagerTable() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredManagerData.slice(startIndex, endIndex);

  const rows = pageData.map((man, index) => `
      <tr data-id="${man.man_id}">
        <td>${startIndex + index + 1} </td>
        <td>${man.man_id || "ไม่ระบุ"}</td>
        <td>${man.man_fname || "ไม่ระบุ"}</td>
        <td>${man.man_lname || "ไม่ระบุ"}</td>
        <td>
          <div class="dropdown-doctor">
              <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
              <div class="dropdown-content">
                  <a href="#" class="editBtn" data-id="${man.man_id}" data-fname="${man.man_fname}" data-lname="${man.man_lname}">
                      <i class="fa-solid fa-pen-to-square"></i> <span>แก้ไขข้อมูล</span>
                  </a>
                  <a href="#" class="delete-trigger" data-id="${man.man_id}">
                      <i class="fa-solid fa-trash"></i> <span>ลบ</span>
                  </a>
              </div>
          </div>
        </td>
      </tr>
  `).join("");

  document.getElementById("managerinTable").innerHTML = rows || `<tr><td colspan="5">ไม่มีข้อมูล</td></tr>`;
  
  attachDropdownManager();
  attachEditAndDeleteEvents();
}
function attachDropdownManager() {
  document.querySelectorAll(".actionBtn").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // ป้องกันการปิด dropdown ทันทีที่กด
      const dropdown = button.closest(".dropdown-doctor");
      const dropdownContent = dropdown.querySelector(".dropdown-content");

      // ปิด dropdown อื่นๆ ก่อน
      document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove("show");
          openDropdown.querySelector(".dropdown-content").style.display = "none";
        }
      });

      // เปิด/ปิด dropdown
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
        dropdownContent.style.display = "none";
      } else {
        dropdown.classList.add("show");
        dropdownContent.style.display = "block";
      }
    });
  });

  // ✅ ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
      openDropdown.classList.remove("show");
      openDropdown.querySelector(".dropdown-content").style.display = "none";
    });
  });
}
// ✅ ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
  const paginationContainer = document.getElementById("paginationControls");

  if (!paginationContainer) {
      console.warn("⚠️ ไม่พบ paginationControls ใน DOM");
      return;
  }

  const totalPages = Math.ceil(filteredManagerData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
      controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

// ✅ ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderManagerTable();
  renderPaginationControls();
}

// ✅ ฟังก์ชันแนบ Event ให้ปุ่มแก้ไขและลบ
function attachEditAndDeleteEvents() {
  document.querySelectorAll(".editBtn").forEach(button => {
      button.addEventListener("click", (e) => {
          e.preventDefault();
          const manId = button.getAttribute("data-id");
          const manFname = button.getAttribute("data-fname");
          const manLname = button.getAttribute("data-lname");

          const formHtml = `
              <div class="popup-container">
                <div class="popup-content">
                  <div>
                    <span class="close" id="cancelEdit">&times;</span>
                  </div>
                  <label for="editFname">ชื่อ:</label>
                  <input type="text" id="editFname" value="${manFname}" required />
                  <label for="editLname">นามสกุล:</label>
                  <input type="text" id="editLname" value="${manLname}" required />
                  <button id="saveEdit">บันทึก</button>
                </div>
              </div>
          `;

          document.body.insertAdjacentHTML("beforeend", formHtml);
          
          document.getElementById("cancelEdit").addEventListener("click", () => {
              document.querySelector(".popup-container").remove();
          });

          document.getElementById("saveEdit").addEventListener("click", async () => {
              try {
                  await axios.post("http://localhost:8000/api/manager/managerUpdate", {
                      man_id: manId,
                      man_fname: document.getElementById("editFname").value,
                      man_lname: document.getElementById("editLname").value,
                  });

                  alert("ข้อมูลผู้บริหารได้รับการอัปเดตเรียบร้อยแล้ว");
                  fetchManager();
                  document.querySelector(".popup-container").remove();
              } catch (err) {
                  console.error("Error updating manager:", err);
                  alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
              }
          });
      });
  });

  document.querySelectorAll(".delete-trigger").forEach(button => {
      button.addEventListener("click", async (e) => {
          e.preventDefault();
          const manId = button.getAttribute("data-id");

          if (confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
              try {
                  await axios.post("http://localhost:8000/api/manager/managerDelete", {
                      man_id: manId,
                  });

                  alert("ลบข้อมูลสำเร็จ");
                  fetchManager();
              } catch (err) {
                  console.error("Error deleting manager:", err);
                  alert("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
          }
      });
  });
}

function filterManager() {
  const nameFilter = document.getElementById('searchmanager').value.trim().toLowerCase();
  const idFilter = document.getElementById('searchmanager').value.trim().toLowerCase();

  filteredManagerData = managerData.filter(man => {
      const name = (man.man_fname + " " + man.man_lname).trim().toLowerCase();
      const ID = (man.man_id || "").trim().toLowerCase();

      return (
          (!nameFilter || name.includes(nameFilter)) ||
          (!idFilter || ID.includes(idFilter))
      );
  });

  currentPage = 1;
  renderManagerTable();
  renderPaginationControls();
}

function uploadImage() {
  // const fileInput = document.getElementById("imageInput");
  // const formData = new FormData();
  // formData.append("image", fileInput.files[0]);

  // try {
  //     const response = await axios.post("http://localhost:8000/api/upload/upload-image", formData, {
  //         headers: { "Content-Type": "multipart/form-data" }
  //     });

  //     const imageUrl = response.data.imageUrl;
  //     sessionStorage.setItem("uploadedImage", imageUrl); 
  //     document.getElementById("previewImage").src = imageUrl;
  //     document.getElementById("previewImage").style.display = "block";
  //     document.getElementById("deleteButton").style.display = "block";

  //     alert("อัปโหลดรูปภาพสำเร็จ!");
  // } catch (error) {
  //     console.error("เกิดข้อผิดพลาด:", error);
  //     alert("อัปโหลดรูปภาพล้มเหลว!");
  // }
}



  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "admin_main.html") {
      fetchAdminInfo();
    } 
    if (currentPage === "manage_doctor.html") {
        fetchAdminInfo();
        fetchDoctors();
        sessionStorage.removeItem("user_id");
      }
    if (currentPage === "manage_employee.html") {
        fetchEmployee()
        fetchAdminInfo();
        sessionStorage.removeItem("user_id");
      }
    //   if (currentPage === "manage_user.html") {
    //     fetchUserlist()
    //     sessionStorage.removeItem("user_id");
    //   }
    //   if (currentPage === "mange_user_data.html") {
    //     fetchUserDataAndDisplay()
    //     // fetchAppointmentsAndUpdateUI()
    //     fetchUserDetails()
    //     fetchAppointment()
    //   }
      if (currentPage === "manage_man.html") {
        fetchManager()
        fetchAdminInfo();
        sessionStorage.removeItem("user_id");
      }
      if (currentPage === "patientslist.html") {
        sessionStorage.removeItem("user_id");
      }
  });