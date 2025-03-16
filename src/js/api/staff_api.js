const baseURL = "https://clinic-project-w900.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const addUserBtn = document.getElementById('addUserBtn');
  const addUserModal = document.getElementById('addUserModal');
  const closeBtn = document.querySelector('#addUserModal .close');

  // เปิด Modal
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      addUserModal.style.display = 'block';
    });
  }

  // ปิด Modal เมื่อกดปุ่ม X
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      addUserModal.style.display = 'none';
    });
  }

  // ปิด Modal ถ้าคลิกนอกกล่อง
  window.addEventListener('click', (event) => {
    if (event.target === addUserModal) {
      addUserModal.style.display = 'none';
    }
  });

  // ฟอร์มเพิ่มผู้ใช้งาน
  const form = document.getElementById("addUserForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // รับค่าจากฟอร์ม
    const stu_id = document.getElementById("userID").value
    const title = document.getElementById("title").value;
    const stu_fname = document.getElementById("stu_fname").value
    const stu_lname = document.getElementById("stu_lname").value
    const nickname = document.getElementById("nickname").value
    const phone = document.getElementById("phone").value
    const faculty = document.getElementById("faculty").value;
    const password = generatePassword();
    // pass 6 ตัวท้ายของ userID
    let profileImageUrl = "";
    const currentYear = new Date().getFullYear() + 543;
    const admissionYear = parseInt(stu_id.substring(2, 4));
    const admissionFullYear = admissionYear + 2500;
    let studyYear = currentYear - admissionFullYear;

    const maxYear = faculty === "สถาปัตยกรรมศาสตร์" ? 5 : 4;

    studyYear = Math.min(Math.max(1, studyYear), maxYear);

    const year = `ปี ${studyYear}`;

    if (!stu_id || !title || !stu_fname || !stu_lname || !nickname || !phone || !faculty) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }


    if (!/^\d{10}$/.test(phone)) {
      alert("กรุณากรอกเบอร์โทรที่ถูกต้อง (10 ตัวและเป็นเลขเท่านั้น)");
      document.getElementById("phone").focus();
      return;
    }
    
    if (!/^\d{12}-\d{1}$/.test(stu_id)) {
      alert('กรุณากรอกรหัสประจำตัวให้ถูกต้อง เช่น 116510001001-2');
      document.querySelector('#stu_id').focus();
      return;
    }
    

    try {

    const checkUserApiUrl = 'https://clinic-project-w900.onrender.com/api/students/checkuser';
    const checkResponse = await axios.post(checkUserApiUrl, { stu_id });

    if (!checkResponse.data.success) {
      alert('รหัสนักศึกษานี้มีการลงทะเบียนแล้ว');
    }

      const response = await axios.post("https://clinic-project-w900.onrender.com/api/students/register-user", {
        title: title,
        stu_id: stu_id,
        stu_fname: stu_fname,
        stu_lname: stu_lname,
        nickname: nickname,
        phone: phone,
        year,
        faculty: faculty,
        password: password,
        profile_image: profileImageUrl
      });

      if (response.data && response.data.message === "User registered successfully") {
        alert(`เพิ่มข้อมูลนักศึกษาสำเร็จ`);
        document.getElementById("addUserModal").style.display = "none";
        form.reset();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      // alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  });
});

function generatePassword() {
  const userID = document.getElementById("userID").value;
  const cleanUserID = userID.replace(/-/g, "");
  if (cleanUserID.length >= 6) {
    return cleanUserID.slice(-6);
  }
  return "";
}



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
    if (!doctorID || !doctorName || !phoneNumber || !password || !confirmPassword) {
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
      const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/register-doctor", {
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

//เพิ่มaddmin
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
      const response = await axios.post('https://clinic-project-w900.onrender.com/api/employees/register-employee', {
        employee_id: employeeID,
        password: emp_password,
        emp_fname: emp_fname,
        emp_lname: emp_lname
      });

      // เปลี่ยนข้อความในการตรวจสอบให้ตรงกับข้อความที่ API ส่งกลับ
      if (response.data && response.data.message === "Employee registered successfully") {
        alert("เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ");
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
      const response = await axios.post('https://clinic-project-w900.onrender.com/api/manager/register-manger', {
        man_id: mangerID,
        password: man_password,
        man_fname: man_fname,
        man_lname: man_lname
      });

      // เปลี่ยนข้อความในการตรวจสอบให้ตรงกับข้อความที่ API ส่งกลับ
      if (response.data && response.data.message === "Manager registered successfully") {
        alert("เพิ่มข้อมูลผู้บริหารสำเร็จ");
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
    const response = await axios.post('https://clinic-project-w900.onrender.com/api/students/logout', {}, { withCredentials: true });
    sessionStorage.removeItem('employeeID');
    sessionStorage.removeItem('stu_id');
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

const fetchEmployeeInfo = async () => {
  try {
    // ใช้ POST แทน GET ในการดึงข้อมูล employee
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/employeeinfo", {}, {
      withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
    });


    if (response.data && response.data.employee) {
      const employeeInfo = response.data.employee;
      const encrypEmployee = btoa(employeeInfo.employee_id)
      sessionStorage.setItem('employeeID', encrypEmployee || '');


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

  if (employeeInfo) {
    updateElements('.employee_id', employeeInfo.employee_id);
    updateElements('.emp_fname', employeeInfo.emp_fname);
    updateElements('.emp_lname', employeeInfo.emp_lname);
  } else {
    console.warn("Employee info is missing");
  }
};

const fetchAdminInfo = async () => {
  try {
    // ใช้ POST แทน GET ในการดึงข้อมูล employee
    const response = await axios.post(`https://clinic-project-w900.onrender.com/api/admin/admininfo`, {}, {
      withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
    });
    // console.log(response);

    if (response.data && response.data.admin) {
      const adminInfo = response.data.admin;
      // console.log("adminInfo:", adminInfo);

      // แสดงข้อมูลบนหน้า
      updateAdminData(adminInfo);

    } else {
      console.error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Error fetching admin info:', error);
  }
};
const updateAdminData = (adminInfo) => {
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
  const form = document.getElementById("profileAdmin"); 

  const fetchAdminInfo = async () => {
      try {
          const response = await axios.post('https://clinic-project-w900.onrender.com/api/admin/admininfo', {}, {
              withCredentials: true 
          });
          console.log(response);

          if (response.data && response.data.admin) {
              const AdminInfo = response.data.admin; 
              populateForm(AdminInfo);

          } else {
              console.error('ข้อมูลที่ได้รับไม่ถูกต้องจาก API');
          }
      } catch (error) {
          console.error('Error fetching admin info:', error);
      }
  };

  const populateForm = (AdminInfo) => {
      document.getElementById("first-name").value = AdminInfo.adm_fname || '';
      document.getElementById("last-name").value = AdminInfo.adm_lname || '';
  };

  if (form) {
      form.addEventListener("submit", async (event) => {
          event.preventDefault();
      
          const updatedData = {
              adm_fname: document.getElementById("first-name").value,
              adm_lname: document.getElementById("last-name").value, // ✅ แก้จาก adm_fname เป็น adm_lname
          };

          try {
              const response = await axios.post('https://clinic-project-w900.onrender.com/api/admin/updateadmin', updatedData, {
                  withCredentials: true
              });

              if (response.data.success) {
                  alert("ข้อมูลได้รับการอัปเดตเรียบร้อยแล้ว!");
                  fetchAdminInfo();
              } else {
                  console.error(" Update failed:", response.data.message);
                  alert("ไม่สามารถอัปเดตข้อมูลได้: " + (response.data.message || "ไม่ทราบสาเหตุ"));
              }
          } catch (error) {
              console.error(" Error updating user info:", error);
              alert(' เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message || 'Unknown error'));
          }
      });
  }

  if (window.location.pathname.endsWith('profile_admin.html')) {
    fetchAdminInfo();
  }
});

let currentDoctorPage = 1;
let doctorData = [];
let filteredDoctorData = [];

async function fetchDoctors() {
  try {
    // แสดงข้อความโหลด
    document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="5">กำลังโหลดข้อมูล...</td></tr>`;

    // ดึงข้อมูลแพทย์จาก API
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/doctorResult");
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

//  ฟังก์ชันกรองข้อมูลแพทย์
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

//  ฟังก์ชันเรนเดอร์ตารางแพทย์
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

//  ฟังก์ชันจัดการ Dropdown
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

//  ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderDoctorPaginationControls() {
  const paginationContainer = document.getElementById("doctorPaginationControls");

  if (!paginationContainer) {
    console.warn(" ไม่พบ doctorPaginationControls ใน DOM");
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
        <input type="text" id="editName" value="${docName}" required 
        pattern="^[a-zA-Zก-ฮะ-์]+$"
        title="กรุณากรอกตัวอักษรเท่านั้น"
        oninput="this.value = this.value.replace(/[^a-zA-Zก-ฮะ-์]/g, '')"/>

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
      await axios.post("https://clinic-project-w900.onrender.com/api/doctors/doctorUpdate", {
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
    await axios.post("https://clinic-project-w900.onrender.com/api/doctors/doctorDelete", { doc_id: docId });
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
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/get-availability", { doc_id: doctorID });
    availabilityData = response.data.availability || [];
    // เรียงวันจากน้อยไปมาก
    availabilityData.sort((a, b) => new Date(a.available_date) - new Date(b.available_date));

    currentPage = 1; // รีเซ็ตหน้าปัจจุบัน
    updateAvailabilityTable(doctorID);
  } catch (error) {
    console.error("Error fetching availability:", error);
    document.getElementById("availabilityTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}

// อัปเดตตารางเมื่อเลือกเดือน
function updateAvailabilityTable(doctorID) {
  const selectedMonth = document.getElementById("monthFilter").value;

  // กรองข้อมูลตามเดือนที่เลือก
  filteredData = selectedMonth
    ? availabilityData.filter(item => new Date(item.available_date).getMonth() + 1 == selectedMonth)
    : [...availabilityData]; // ถ้าไม่เลือกเดือนให้แสดงทั้งหมด

  renderAvailabilityTable(doctorID);
  // renderPaginationControls();
}

function renderAvailabilityTable(doctorID) {
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
  attachDeleteAvailabilityListeners(doctorID);
}

//  สร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  document.getElementById("paginationControls").innerHTML = totalPages > 1 ? controlsHTML : "";
}

//  ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderAvailabilityTable();
  renderPaginationControls();
}

//  ผูก Event Listener ให้ปุ่มลบ
// function attachDeleteAvailabilityListeners() {
//   document.querySelectorAll(".delete-availability").forEach(button => {
//     button.addEventListener("click", async (event) => {
//       const availabilityId = event.target.dataset.id;
//       if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
//         try {
//           await axios.post("http://localhost:8000/api/doctors/delete-availability", { Availability_id: availabilityId });
//           alert("ลบรายการสำเร็จ");
//           fetchAvailability(sessionStorage.getItem("selectedDoctorID")); 
//         } catch (error) {
//           console.error("Error deleting availability:", error);
//           alert("เกิดข้อผิดพลาดในการลบข้อมูล");
//         }
//       }
//     });
//   });
// }

function attachDeleteAvailabilityListeners(doctorID) {
  document.querySelectorAll(".delete-availability").forEach((button) => {
    button.addEventListener("click", async (event) => {
      console.log(doctorID);
      const availabilityId = event.target.dataset.id;
      if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
        try {
          await axios.post("https://clinic-project-w900.onrender.com/api/doctors/delete-availability", { Availability_id: availabilityId });
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
      const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/add-availability", {
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
let currentemployeePage = 1;
let adminData = [];
let filteredAdminData = [];

async function fetchEmployee() {
  try {
    document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/employeeResult");
    const { employee } = response.data;

    if (!employee || employee.length === 0) {
      document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลเจ้าหน้าที่</td></tr>`;
      document.getElementById("paginationControls").innerHTML = "";
      return;
    }


    adminData = [...employee];
    filteredAdminData = [...adminData];

    renderAdminTable();
    renderEmployeeControls();

  } catch (error) {
    console.error("Error fetching employee data:", error);
    document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    document.getElementById("paginationControls").innerHTML = "";
  }
}


function renderAdminTable() {
  const startIndex = (currentemployeePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredAdminData.slice(startIndex, endIndex);

  const rows = pageData.map((emp, index) => {
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
  attachEditAndDeleteEmployee();
}

function attachEditAndDeleteEmployee() {
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
                  <input type="text" id="editFname" value="${empFname}" placeholder="ชื่อเจ้าหน้าที่..." required
                  pattern="^[a-zA-Zก-ฮะ-์]+$"
                  title="กรุณากรอกตัวอักษรเท่านั้น"
                  oninput="this.value = this.value.replace(/[^a-zA-Zก-ฮะ-์]/g, '')" />
                  <label for="editLname">นามสกุล:</label>
                  <input type="text" id="editLname" value="${empLname}" placeholder="นามสกุล..." required 
                  pattern="^[a-zA-Zก-ฮะ-์]+$"
                  title="กรุณากรอกตัวอักษรเท่านั้น"
                  oninput="this.value = this.value.replace(/[^a-zA-Zก-ฮะ-์]/g, '')" />
                  <button id="saveEditempoloyee">บันทึก</button>
                </div>
              </div>
          `;

      document.body.insertAdjacentHTML("beforeend", formHtml);

      document.getElementById("cancelEdit").addEventListener("click", () => {
        document.querySelector(".popup-container").remove();
      });

      document.getElementById("saveEditempoloyee").addEventListener("click", async () => {
        try {
          await axios.post("https://clinic-project-w900.onrender.com/api/employees/employeeUpdate", {
            employee_id: empId,
            emp_fname: document.getElementById("editFname").value,
            emp_lname: document.getElementById("editLname").value,
          });

          alert("ข้อมูลเจ้าหน้าที่ได้รับการอัปเดตเรียบร้อยแล้ว");
          fetchEmployee();
          document.querySelector(".popup-container").remove();
        } catch (err) {
          console.error("Error updating employee:", err);
          alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
        }
      });
    });
  });

  //  ปุ่มลบ
  document.querySelectorAll(".delete-trigger").forEach(button => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const empId = button.getAttribute("data-id");

      if (confirm("คุณต้องการลบข้อมูลเจ้าหน้าที่นี้หรือไม่?")) {
        try {
          await axios.post("https://clinic-project-w900.onrender.com/api/employees/employeeDelete", {
            employee_id: empId,
          });

          alert("ลบข้อมูลเจ้าหน้าที่สำเร็จ");
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

  //  ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
      openDropdown.classList.remove("show");
      openDropdown.querySelector(".dropdown-content").style.display = "none";
    });
  });
}


function renderEmployeeControls() {
  const paginationContainer = document.getElementById("PaginationEmployeeControls");

  if (!paginationContainer) {
    console.warn(" ไม่พบ PaginationControls ใน DOM");
    return;
  }

  const totalPages = Math.ceil(filteredAdminData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentemployeePage ? 'active' : ''}" onclick="changeEmployeePage(${i})">${i}</button>`;
  }

  paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}


//  ฟังก์ชันเปลี่ยนหน้า
function changeEmployeePage(page) {
  currentemployeePage = page;
  renderAdminTable();
  renderEmployeeControls();
}

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
  renderEmployeeControls();
}


let currentUserPage = 1;
const itemsPerPage = 12;
let userData = []; // เก็บข้อมูลทั้งหมด
let filteredData = []; // เก็บข้อมูลที่ถูกกรอง

async function fetchUserlist() {
  try {
    document.getElementById("UserTable").innerHTML = `<tr><td colspan="8">กำลังโหลดข้อมูล...</td></tr>`;

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/userList");
    userData = response.data?.students || [];
    filteredData = [...userData]; // สำเนาข้อมูลเพื่อใช้ในการกรอง

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

  //  กรองข้อมูลจาก userData
  filteredData = userData.filter(user => {
    const ID = (user.stu_id || "").toLowerCase();
    const name = `${user.title} ${user.stu_fname} ${user.stu_lname} ${user.nickname}`.toLowerCase();
    const faculty = user.faculty?.trim() || "";

    return (
      (ID.includes(nameFilter) || name.includes(nameFilter) || !nameFilter) &&
      (faculty === facultyFilter || !facultyFilter)
    );
  });

  currentUserPage = 1;
  renderUserTable();
  renderUserPaginationControls();
}

//  ฟังก์ชันแบ่งหน้า
function renderUserTable() {
  const startIndex = (currentUserPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const rows = pageData.map((user, index) => {
    const displayIndex = startIndex + index + 1; 

    return `
      <tr data-id="${user.stu_id}">
        <td>${displayIndex}</td>  
        <td>${user.stu_id || "ไม่ระบุ"}</td>
        <td>${user.title} ${user.stu_fname} ${user.stu_lname || "ไม่ระบุ"}</td>
        <td>${user.nickname || "ไม่ระบุ"}</td>
        <td>${user.faculty || "ไม่ระบุ"}</td>
        <td>${user.phone || "ไม่ระบุ"}</td>
        <td>${user.latest_case_status || "ไม่มีข้อมูล"}</td>  
        <td>
          <div class="dropdown-user">
            <button class="action-btn">
              <i class="fa-solid fa-grip-lines"></i>
            </button>
            <div class="dropdown-content-user">
              <a href="#" onclick="goToAppointmentPage('${user.stu_id}')">จัดการข้อมูล</a>
              <a href="#" class="reset-password-btn" onclick="resetUserPassword('${user.stu_id}')">รีเซ็ตรหัสผ่าน</a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("UserTable").innerHTML = rows || `<tr><td colspan="8">ไม่พบข้อมูล</td></tr>`;

  //  เรียกใช้การแนบ Event Listener ทุกครั้งหลัง Render
  attachDropdownUser();
}


function attachDropdownUser() {
  document.querySelectorAll(".action-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); 
      const dropdown = button.closest(".dropdown-user");
      const dropdownContent = dropdown.querySelector(".dropdown-content-user");

      //  ปิด Dropdown อื่นๆ ก่อนเปิดอันที่ต้องการ
      document.querySelectorAll(".dropdown-content-user.show").forEach(openDropdown => {
        if (openDropdown !== dropdownContent) {
          openDropdown.classList.remove("show");
          openDropdown.classList.remove("above");
        }
      });

      //  เปิด/ปิด Dropdown
      dropdownContent.classList.toggle("show");

      const rect = dropdownContent.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      //  ตรวจสอบว่าชนขอบล่างของจอหรือไม่ ถ้าใช่ ให้เปิดขึ้นด้านบน
      if (rect.bottom > windowHeight) {
        dropdownContent.classList.add("above");
      } else {
        dropdownContent.classList.remove("above");
      }
    });
  });

  //  ปิด Dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content-user.show").forEach(dropdown => {
      dropdown.classList.remove("show");
      dropdown.classList.remove("above");
    });
  });
}

async function resetUserPassword(stu_id) {
  if (confirm("คุณต้องการรีเซ็ตรหัสผ่านสำหรับผู้ใช้นี้หรือไม่?")) {
      try {
          const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/reset-password", {
            stu_id: stu_id
          });

          if (response.status === 200) {
            alert(`รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่คือ 6 ตัวท้ายของ รหัสประจำตัว`);
        } else {
            alert("ไม่สามารถรีเซ็ตรหัสผ่านได้");
        }
      } catch (error) {
          console.error("Error:", error);
          alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
  }
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
    const encrypUser = sessionStorage.getItem("stu_id");
    const stu_id = encrypUser ? atob(encrypUser) : null;
    if (!stu_id) {
      throw new Error('User ID is not available in session storage');
    }

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/userdetails", { userId: stu_id });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Error fetching user data');
    }

    const data = response.data;
    const user = data.user;
    const imageUrl = data.user;
    // console.log(imageUrl);
    // Check if user data is valid
    if (!user || !Array.isArray(user) || user.length === 0) {
      console.error('User data is missing or invalid');
      alert('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    // Populate user data on the page
    document.getElementById('userid').innerHTML = user[0].stu_id;
    document.getElementById('user-fname').innerHTML = user[0].stu_fname;
    document.getElementById('title').innerHTML = user[0].title;
    document.getElementById('user-lname').innerHTML = user[0].stu_lname;
    document.getElementById('user-phone').innerHTML = user[0].phone;
    document.getElementById('user-faculty').innerHTML = user[0].faculty;
    document.getElementById('user-year').innerHTML = user[0].year;

    const profileImage = document.getElementById("user-profile");

    if (user[0].profile_image) {
      profileImage.src = `${baseURL}${user[0].profile_image}`;
    } else {
      profileImage.src = `${baseURL}/uploads/profiles/default.png`;
    }

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

          //  ตรวจสอบระดับผลการประเมินและกำหนดสี
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
          .sort((a, b) => new Date(b.date) - new Date(a.date)) //  เรียงจากวันล่าสุด -> วันเก่า
          .forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
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
        const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/Statusappointments", {
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
        const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/Statusappointments", {
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

    // document.getElementById("close-case-btn").addEventListener("click", async () => {
    //   const userId = document.getElementById("userid").textContent;

    //   if (!userId) {
    //       alert("ไม่พบรหัสผู้ใช้งาน");
    //       return;
    //   }

    //   if (!confirm("คุณต้องการปิดเคสนี้หรือไม่?")) {
    //       return; // หากผู้ใช้ยกเลิกการยืนยัน
    //   }

    //   try {
    //       const response = await axios.post("http://localhost:8000/api/employees/closeCase", {
    //           stu_id: userId,
    //       });

    //       if (response.status === 200) {
    //           alert("ปิดเคสสำเร็จ");
    //           fetchUserDetails(userId); 
    //       } else {
    //           alert(response.data.message || "ไม่สามารถปิดเคสได้");
    //       }
    //   } catch (error) {
    //       console.error("Error closing case:", error);
    //       alert("เกิดข้อผิดพลาดในการปิดเคส");
    //   }
    // });

  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

async function loadCaseStatus() {
  const caseStatusSelect = document.getElementById("caseStatus");
  const selectedCaseStatus = document.getElementById("selectedCaseStatus");
  const saveCaseStatusBtn = document.getElementById("saveCaseStatus");

  const encrypUser = sessionStorage.getItem("stu_id");
  const userId = encrypUser ? atob(encrypUser) : null;

  if (!userId) {
    selectedCaseStatus.innerText = "ไม่พบรหัสผู้ใช้";
    return;
  }

  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/showcasesStatus", {
      stu_id: userId,
    });
    // console.log(response.data);
    if (response.data.success && response.data.status) {
      selectedCaseStatus.innerText = response.data.status;
      caseStatusSelect.value = response.data.status; // 
    } else {
      selectedCaseStatus.innerText = "ไม่พบข้อมูลสถานะ";
    }
  } catch (error) {
    console.error("Error fetching case status:", error);
    selectedCaseStatus.innerText = "เกิดข้อผิดพลาด";
  }

  caseStatusSelect.addEventListener("change", () => {
    selectedCaseStatus.innerText = caseStatusSelect.options[caseStatusSelect.selectedIndex].text;
  });

  //  บันทึกสถานะใหม่
  saveCaseStatusBtn.addEventListener("click", async () => {
    const selectedStatus = caseStatusSelect.value;

    try {
      const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/casesStatus", {
        stu_id: userId,
        status: selectedStatus
      });

      if (response.data.success) {
        selectedCaseStatus.innerText = selectedStatus; // อัปเดต UI
        alert("บันทึกสถานะสำเร็จ");
      } else {
        alert("บันทึกสถานะไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating case status:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกสถานะ");
    }
  });
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
      const response = await axios.post('https://clinic-project-w900.onrender.com/api/employees/change-password', {
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
const encrypUser = sessionStorage.getItem("stu_id");
const userId = encrypUser ? atob(encrypUser) : null;
let userFname = '';
let userLname = '';

// ดึงข้อมูลผู้ใช้
async function fetchUserDetails() {
  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/userdetails", { userId: userId });
    const user = response.data.user;
    if (user && user.length > 0) {
      userFname = user[0].stu_fname;
      userLname = user[0].stu_lname;
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
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/doctorResult");
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

  // for (let month = 1; month <= 12; month++) {
  //   const option = document.createElement("option");
  //   option.value = `${currentYear}-${month.toString().padStart(2, "0")}`;
  //   option.textContent = new Date(currentYear, month - 1).toLocaleString("th-TH", {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  //   monthSelect.appendChild(option);
  // }

  monthSelect.addEventListener("change", () => {
    const selectedMonth = monthSelect.value;
    filterAvailabilityByMonth(availability, selectedMonth);
  });
}

let availability = [];

async function fetchAvailabilityList(docId) {
  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/getAvailabilitytime", {
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

  if (!Array.isArray(availability) || availability.length === 0) {
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
  const timeSlot = document.getElementById("timeSlot").value;
  const [start_time, end_time] = timeSlot.split("-");

  if (!userId || !selectedDoctorId || !available_date || !problem || !start_time || !end_time) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  const today = new Date();
  const selectedDate = new Date(available_date);
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    alert("ไม่สามารถเลือกวันที่ผ่านมาแล้วได้");
    return;
  }

  try {
    const checkResponse = await axios.post("https://clinic-project-w900.onrender.com/api/employees/appointments-count", {
      doc_id: selectedDoctorId,
      date: available_date
    });

    if (checkResponse.data.totalAppointments >= 12) {
      alert("หมอมีการนัดหมายเต็มแล้วสำหรับวันนี้ กรุณาเลือกวันอื่น");
      return;
    }

    const appointmentId = generateUniqueAppointmentId(userId, available_date);

    const appointmentData = {
      Appointment_id: appointmentId,
      stu_id: userId,
      stu_fname: userFname,
      stu_lname: userLname,
      doc_id: selectedDoctorId,
      doc_name: selectedDoctorName,
      time_start: start_time,
      time_end: end_time,
      date: available_date,
      problem,
      status: "รอการยืนยัน",
    };

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/appointments", appointmentData);

    if (response.status === 201) {
      alert(response.data.message);
      await populateAppointmentTable(selectedDoctorId, available_date);
      location.reload();
    } else {
      alert(response.data.message || "เกิดข้อผิดพลาด");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(error.response ? error.response.data.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลการนัดหมาย");
  }
}



async function fetchAppointments(doc_id, selectedDate) {
  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/employees/getAppointments", {
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

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/manager/managerResult");
    const { manager } = response.data;

    if (!manager || manager.length === 0) {
      document.getElementById("managerinTable").innerHTML = `<tr><td colspan="5">ไม่พบข้อมูลผู้บริหาร</td></tr>`;
      document.getElementById("paginationControls").innerHTML = "";
      return;
    }

    managerData = [...manager];
    filteredManagerData = [...managerData];

    renderManagerTable();
    renderManagerControls();
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

  //  ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-doctor.show").forEach(openDropdown => {
      openDropdown.classList.remove("show");
      openDropdown.querySelector(".dropdown-content").style.display = "none";
    });
  });
}
//  ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderManagerControls() {
  const paginationContainer = document.getElementById("paginationControls");

  if (!paginationContainer) {
    console.warn(" ไม่พบ paginationControls ใน DOM");
    return;
  }

  const totalPages = Math.ceil(filteredManagerData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  paginationContainer.innerHTML = totalPages > 1 ? controlsHTML : "";
}

//  ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderManagerTable();
  renderManagerControls();
}

//  ฟังก์ชันแนบ Event ให้ปุ่มแก้ไขและลบ
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
                  <input type="text" id="editFname" value="${manFname}" required
                  pattern="^[a-zA-Zก-ฮะ-์]+$"
                  title="กรุณากรอกตัวอักษรเท่านั้น"
                  oninput="this.value = this.value.replace(/[^a-zA-Zก-ฮะ-์]/g, '')"  />
                  <label for="editLname">นามสกุล:</label>
                  <input type="text" id="editLname" value="${manLname}" required
                  pattern="^[a-zA-Zก-ฮะ-์]+$"
                  title="กรุณากรอกตัวอักษรเท่านั้น"
                  oninput="this.value = this.value.replace(/[^a-zA-Zก-ฮะ-์]/g, '')" />
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
          await axios.post("https://clinic-project-w900.onrender.com/api/manager/managerUpdate", {
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
          await axios.post("https://clinic-project-w900.onrender.com/api/manager/managerDelete", {
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
  renderManagerControls();
}

const updateStudyYearAutomatically = async () => {
  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/students/getAllUsers");

    if (!response.data.success) {
      console.error(" ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      return;
    }

    const students = response.data.students;
    const currentYear = new Date().getFullYear() + 543; // แปลงเป็น พ.ศ.
    let updatedUsers = [];

    students.forEach(user => {
      const admissionYear = parseInt(user.stu_id.substring(2, 4));
      const admissionFullYear = admissionYear + 2500; // แปลงเป็น พ.ศ.
      const studyYear = Math.max(1, currentYear - admissionFullYear);
      const newYear = `ปี ${studyYear}`;

      if (user.year !== newYear) {
        updatedUsers.push({ stu_id: user.stu_id, year: newYear });
      }
    });

    if (updatedUsers.length > 0) {
      await axios.post("https://clinic-project-w900.onrender.com/api/students/updateStudyYear", {
        students: updatedUsers
      });
    }

  } catch (error) {
    console.error(" เกิดข้อผิดพลาดในการอัปเดตชั้นปี:", error);
  }
};
// เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // แค่ชื่อไฟล์ เช่น "manage_doctor.html"

  function fetchInfoByRole(role) {
    if (role === "admin") {
      fetchAdminInfo();
    } else {
      fetchEmployeeInfo();
    }
  }

  switch (currentPage) {
    case "manage_doctor.html":
      fetchInfoByRole("admin");
      fetchDoctors();
      sessionStorage.removeItem("stu_id");
      break;

    case "dashboard.html":
      fetchInfoByRole("employee");
      sessionStorage.removeItem("stu_id");
      break;

    case "manage_employee.html":
      fetchInfoByRole("admin");
      fetchEmployee();
      sessionStorage.removeItem("stu_id");
      break;

    case "manage_user.html":
      fetchInfoByRole("employee");
      fetchUserlist();
      setInterval(updateStudyYearAutomatically, 1000 * 60 * 60 * 24);
      sessionStorage.removeItem("stu_id");
      break;

    case "mange_user_data.html":
      fetchInfoByRole("employee");
      fetchUserDataAndDisplay();
      fetchUserDetails();
      fetchAppointment();
      loadCaseStatus()
      break;

    case "manage_man.html":
      fetchInfoByRole("admin");
      fetchManager();
      sessionStorage.removeItem("stu_id");
      break;

    case "webstting.html":
      fetchInfoByRole("admin");
      sessionStorage.removeItem("stu_id");
      break;

    case "profile_admin.html":
      fetchInfoByRole("admin");
      break;

    case "patientslist.html":
      if (window.location.pathname.includes("/admin/")) {
        fetchInfoByRole("admin");
        sessionStorage.removeItem("stu_id");
      } else {
        fetchInfoByRole("employee");
        sessionStorage.removeItem("stu_id");
      }
      break;

    default:
      console.warn(" หน้านี้ไม่ต้องใช้ฟังก์ชัน fetch");
  }
});

