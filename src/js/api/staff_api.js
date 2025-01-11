const apiUrl = 'http://localhost:8000';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addDoctorForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // ป้องกันการ refresh หน้า

    // รับค่าจากฟอร์ม
    const doctorID = document.getElementById("doctorID").value.trim();
    const doctorName = document.getElementById("doctorName").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!doctorID || !doctorName || !phoneNumber) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      // ส่งข้อมูลไปยัง API
      const response = await axios.post('http://localhost:8000/api/doctors/register-doctor', {
        doc_id: doctorID,
        doc_name: doctorName,
        phone: phoneNumber,
      });

      if (response.data && response.data.message === "Doctor registration successful") {
        alert("เพิ่มข้อมูลแพทย์สำเร็จ");
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

document.addEventListener("DOMContentLoaded", () => {
  const fetchEmployeeInfo = async () => {
    try {
      // ใช้ POST แทน GET ในการดึงข้อมูล employee
      const response = await axios.post(`${apiUrl}/api/employees/employeeinfo`, {}, {
        withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
      });

      if (response.data && response.data.employee) {
        const employeeInfo = response.data.employee;
        console.log("employeeInfo:", employeeInfo);
        sessionStorage.setItem('employeeID', employeeInfo.employee_id || '');


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

  // เรียก fetchEmployeeInfo เมื่อโหลดหน้าเสร็จ
  if (window.location.pathname !== '/view/index.html') {
    fetchEmployeeInfo();
  }
});


async function fetchDoctors() {
  try {
    // Show loading message while fetching
    document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;

    // ดึงข้อมูลจาก API
    const response = await axios.post("http://localhost:8000/api/doctors/doctorResult");

    // ตรวจสอบและดึงข้อมูลแพทย์จาก response
    const { doctor } = response.data;

    // ตรวจสอบว่ามีข้อมูลแพทย์หรือไม่
    if (!doctor || doctor.length === 0) {
      document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลแพทย์</td></tr>`;
      return;
    }

    // แปลงข้อมูลเป็น HTML
    const rows = doctor.map((doc) => {
      return `
          <tr data-id="${doc.doc_id}">
            <td>${doc.doc_id || "ไม่ระบุ"}</td>
            <td>${doc.doc_name || "ไม่ระบุ"}</td>
            <td>${doc.phone || "ไม่ระบุ"}</td>
            <td>
              <div class="dropdown-doctor">
                <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
                <div class="dropdown-content">
                  <a href="#">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>ผู้ป่วยที่อยู่ในการดูแล</span>
                  </a>
                  <a href="#" class="editBtn" data-id="${doc.doc_id}" data-name="${doc.doc_name}" data-phone="${doc.phone}">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>แก้ไขข้อมูล</span>
                </a>
                <a href="#" class="delete-trigger" data-id="${doc.doc_id}">
                  <i class="fa-solid fa-trash"></i>
                  <span>ลบ</span>
                </a>
                </div>
              </div>
            </td>
          </tr>
        `;
    });

    // แสดงผลใน <tbody>
    document.getElementById("doctorinTable").innerHTML = rows.join("");

    const editButtons = document.querySelectorAll(".editBtn");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        // ดึงข้อมูลจาก data-* attributes
        const docId = button.getAttribute("data-id");
        const docName = button.getAttribute("data-name");
        const docPhone = button.getAttribute("data-phone");

        // เน้นแถวที่เลือก
        document.querySelectorAll("#doctorinTable tr").forEach((row) => {
          row.classList.remove("highlight");
        });
        const selectedRow = document.querySelector(`#doctorinTable tr[data-id="${docId}"]`);
        selectedRow.classList.add("highlight");

        // สร้าง form สำหรับแก้ไขข้อมูล
        const formHtml = `
          <div class="popup-container">
          <div class="popup-content">
          <div>
          <span class="close" id="cancelEdit">&times;</span>
          </div>
            <label for="editName">ชื่อแพทย์</label>
            <input type="text" id="editName" value="${docName}" placeholder="ชื่อแพทย์..." required />
            <label for="editPhone">เบอร์โทรศัพท์:</label>
            <input type="text" id="editPhone" value="${docPhone}" placeholder="เบอร์โทรศัพท์..." pattern="^\\d{10}$" title="กรุณากรอกตัวเลข 10 หลัก" required />
            <button id="saveEdit">บันทึก</button>
          </div>
        </div>
          `;

        // แทรกฟอร์มไปยังหน้าจอ
        document.body.insertAdjacentHTML("beforeend", formHtml);

        // การจัดการการบันทึกข้อมูล
        document.getElementById("saveEdit").addEventListener("click", async () => {
          const newName = document.getElementById("editName").value;
          const newPhone = document.getElementById("editPhone").value;

          try {
            // ส่งข้อมูลที่แก้ไขไปยัง API
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

        // การจัดการการยกเลิก
        document.getElementById("cancelEdit").addEventListener("click", () => {
          document.querySelector(".popup-container").remove();
          selectedRow.classList.remove("highlight");
        });
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-trigger");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const docId = button.getAttribute("data-id");

        const confirmDelete = confirm("คุณต้องการลบข้อมูลแพทย์นี้หรือไม่?");
        if (confirmDelete) {
          try {
            // ลบข้อมูลแพทย์จาก API
            await axios.post("http://localhost:8000/api/doctors/doctorDelete", { doc_id: docId });
            alert("ลบข้อมูลแพทย์สำเร็จ");
            fetchDoctors();  // รีเฟรชข้อมูล
          } catch (err) {
            console.error("Error deleting doctor data:", err);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
          }
        }
      });
    });


    // Dropdown functionality: Toggle dropdown visibilit
    const dropdownButtons = document.querySelectorAll('.actionBtn');

    dropdownButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // หยุดการ propagate event ไปที่อื่น

        const dropdownContent = button.closest('.dropdown-doctor').querySelector('.dropdown-content');
        const dropdown = dropdownContent.parentElement;

        // ปิด dropdown อื่นๆ ที่เปิดอยู่ก่อนหน้า
        document.querySelectorAll('.dropdown-doctor.show').forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('show');
            otherDropdown.querySelector('.dropdown-content').style.cssText = ''; // ลบการตั้งค่า style ที่ปรับ
          }
        });

        // เปิดหรือลบสถานะการเปิดของ dropdown ปัจจุบัน
        dropdown.classList.toggle('show');

        // ปรับตำแหน่งของ dropdown
        const rect = dropdownContent.getBoundingClientRect();
        dropdownContent.style.left = rect.right > window.innerWidth ? `${window.innerWidth - rect.right}px` : '';
        dropdownContent.style.left = rect.left < 0 ? '1px' : dropdownContent.style.left;
        dropdownContent.style.top = rect.bottom > window.innerHeight ? `${window.innerHeight - rect.bottom}px` : '';
      });
    });

    // ปิด dropdown เมื่อคลิกที่พื้นที่นอก dropdown
    window.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-doctor').forEach((dropdown) => {
        dropdown.classList.remove('show');
        dropdown.querySelector('.dropdown-content').style.cssText = ''; // รีเซ็ตตำแหน่ง
      });
    });

  } catch (error) {
    console.error("Error fetching doctor data:", error);
    document.getElementById("doctorinTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}

async function fetchEmployee() {
  try {
    const employeeID = sessionStorage.getItem('employeeID');

    document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;

    // ดึงข้อมูลจาก API
    const response = await axios.post("http://localhost:8000/api/employees/employeeResult");
    console.log(response);

    // ตรวจสอบและดึงข้อมูลพนักงานจาก response
    const { employee } = response.data;

    // ตรวจสอบว่ามีข้อมูลพนักงานหรือไม่
    if (!employee || employee.length === 0) {
      document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลพนักงาน</td></tr>`;
      return;
    }

    // กรองข้อมูลพนักงานที่ไม่ตรงกับข้อมูลใน sessionStorage
    const filteredEmployee = employee.filter(emp => {
      return emp.employee_id !== employeeID; // กรองโดยใช้ employeeID
    });

    // ตรวจสอบว่าหลังจากกรองข้อมูลแล้วมีพนักงานเหลือหรือไม่
    if (filteredEmployee.length === 0) {
      document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลพนักงานที่สามารถแสดงได้</td></tr>`;
      return;
    }
    // sessionStorage.removeItem('employeeID');
    // แปลงข้อมูลเป็น HTML
    const rows = filteredEmployee.map((emp) => {
      return `
        <tr data-id="${emp.employee_id}">
          <td>${emp.employee_id || "ไม่ระบุ"}</td>
          <td>${emp.emp_fname || "ไม่ระบุ"}</td>
          <td>${emp.emp_lname || "ไม่ระบุ"}</td>
          <td>
            <div class="dropdown-doctor">
                <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
                <div class="dropdown-content">
                    <a href="#" class="editBtn" data-id="${emp.employee_id}" data-fname="${emp.emp_fname}" data-lname="${emp.emp_lname}">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>แก้ไขข้อมูล</span>
                    </a>
                    <a href="#" class="delete-trigger" data-id="${emp.employee_id}">
                        <i class="fa-solid fa-trash"></i>
                        <span>ลบ</span>
                    </a>
                </div>
            </div>
          </td>
        </tr>
      `;
    });

    // แสดงผลใน <tbody>
    document.getElementById("addminTable").innerHTML = rows.join("");
    // Dropdown functionality: Toggle dropdown visibilit
    const dropdownButtons = document.querySelectorAll('.actionBtn');

    dropdownButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // หยุดการ propagate event ไปที่อื่น

        const dropdownContent = button.closest('.dropdown-doctor').querySelector('.dropdown-content');
        const dropdown = dropdownContent.parentElement;

        // ปิด dropdown อื่นๆ ที่เปิดอยู่ก่อนหน้า
        document.querySelectorAll('.dropdown-doctor.show').forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('show');
            otherDropdown.querySelector('.dropdown-content').style.cssText = ''; // ลบการตั้งค่า style ที่ปรับ
          }
        });

        // เปิดหรือลบสถานะการเปิดของ dropdown ปัจจุบัน
        dropdown.classList.toggle('show');

        // ปรับตำแหน่งของ dropdown
        const rect = dropdownContent.getBoundingClientRect();
        dropdownContent.style.left = rect.right > window.innerWidth ? `${window.innerWidth - rect.right}px` : '';
        dropdownContent.style.left = rect.left < 0 ? '1px' : dropdownContent.style.left;
        dropdownContent.style.top = rect.bottom > window.innerHeight ? `${window.innerHeight - rect.bottom}px` : '';
      });
    });

    // ปิด dropdown เมื่อคลิกที่พื้นที่นอก dropdown
    window.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-doctor').forEach((dropdown) => {
        dropdown.classList.remove('show');
        dropdown.querySelector('.dropdown-content').style.cssText = ''; // รีเซ็ตตำแหน่ง
      });
    });

    const editButtons = document.querySelectorAll('.editBtn');
    editButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const empId = button.getAttribute("data-id");
        const empFname = button.getAttribute("data-fname");
        const empLname = button.getAttribute("data-lname");

        // แสดงฟอร์มแก้ไข
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

        // แสดงฟอร์มในหน้า
        document.body.insertAdjacentHTML('beforeend', formHtml);

        // ปิดฟอร์มเมื่อคลิกที่ปุ่ม 'close'
        const cancelEditButton = document.getElementById("cancelEdit");
        cancelEditButton.addEventListener('click', () => {
          document.querySelector('.popup-container').remove(); // ลบฟอร์มออกจากหน้า
        });

        // การบันทึกข้อมูลการแก้ไข
        const saveEditButton = document.getElementById("saveEdit");
        saveEditButton.addEventListener('click', async () => {
          const updatedFname = document.getElementById("editFname").value;
          const updatedLname = document.getElementById("editLname").value;

          try {
            // ส่งคำขออัปเดตข้อมูลพนักงาน
            await axios.post("http://localhost:8000/api/employees/employeeUpdate", {
              employee_id: empId,
              emp_fname: updatedFname,
              emp_lname: updatedLname,
            });

            alert("ข้อมูลพนักงานได้รับการอัปเดตเรียบร้อยแล้ว");
            fetchEmployee(); // รีเฟรชข้อมูลพนักงาน
            document.querySelector('.popup-container').remove(); // ปิดฟอร์ม
          } catch (err) {
            console.error("Error updating employee:", err);
            alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
          }
        });
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-trigger');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const empId = button.getAttribute("data-id");

        if (confirm("คุณต้องการลบข้อมูลพนักงานนี้หรือไม่?")) {
          try {
            // ส่งคำขอลบข้อมูลพนักงาน
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


  } catch (error) {
    console.error("Error fetching employee data:", error);
    document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}

async function fetchUserlist() {
  try {
    // Show loading message while fetching
    document.getElementById("UserTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;
    const response = await axios.post("http://localhost:8000/api/employees/userList");
    console.log(response.data);
    // ตรวจสอบและดึงข้อมูลแพทย์จาก response
    const { user } = response.data;


    // ตรวจสอบว่ามีข้อมูลแพทย์หรือไม่
    if (!user || user.length === 0) {
      document.getElementById("UserTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลผู้ใช้</td></tr>`;
      return;
    }

    // แปลงข้อมูลเป็น HTML
    const rows = user.map((user) => {
      return `
        <tr data-id="${user.user_id}" year="${user.year}">
        <td>${user.user_id || "ไม่ระบุ"}</td>
        <td>${(user.user_fname) + " " + (user.user_lname) || "ไม่ระบุ"}</td>
        <td>${user.nickname || "ไม่ระบุ"}</td>
        <td>${user.faculty || "ไม่ระบุ"}</td>
        <td>${user.phone || "ไม่ระบุ"}</td>
        <td>
        <button class="action-btn" onclick="goToAppointmentPage('${user.user_id}')">จัดการข้อมูล</button>
      </td>
      </tr>
        `;
    });

    // แสดงผลใน <tbody>
    document.getElementById("UserTable").innerHTML = rows.join("");


  } catch (error) {
    console.error("Error fetching user data:", error);
    document.getElementById("UserTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}

async function fetchUserDataAndDisplay() {
  try {
    const user_id = sessionStorage.getItem('user_id');
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
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
          const row = document.createElement('tr');
          row.innerHTML = `<td>${formattedDate}</td><td>${result.result}</td>`;
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
        appointmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
      } else {
        filteredAppointments.forEach(appointment => {
          const appointmentDate = new Date(appointment.date);
          const formattedDate = `${appointmentDate.getDate()}/${appointmentDate.getMonth() + 1}/${appointmentDate.getFullYear()}`;
          const row = document.createElement('tr');
          row.innerHTML = `<td>${formattedDate}</td><td>${appointment.status}</td>`;
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
      appointmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
    } else {
      data.appointments.forEach(appointment => {
        const row1 = document.createElement('tr');
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-GB'); // Change to 'th-TH' for Thai format
        row1.innerHTML = `<td>${formattedDate ? formattedDate : 'ยังไม่มีการนัด'}</td><td>${appointment.status || 'ยังไม่มีการนัด'}</td>`;
        appointmentBody.appendChild(row1);
      });
      const sortedAppointments = data.appointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // เรียงจากวันที่ล่าสุด
      });
      // Show only the most recent appointment in appointment-list
      const firstAppointment = sortedAppointments[0];; 
      const firstAppointmentDate = new Date(firstAppointment.date);
      const formattedFirstDate = firstAppointmentDate.toLocaleDateString('en-GB');

      const row2 = document.createElement('tr');
      row2.innerHTML = `
        <td>${formattedFirstDate ? formattedFirstDate : 'ยังไม่มีการนัด'}</td>
        <td>${firstAppointment.status || 'ยังไม่มีการนัด'}</td>
        <td><button class="cancel-appointment" data-appointment-id="${firstAppointment.Appointment_id}">ยกเลิก</button></td>
      `;
      appointmentList.appendChild(row2);

      const cancelButton = row2.querySelector('.cancel-appointment');
      cancelButton.addEventListener('click', handleCancelAppointment);

      async function handleCancelAppointment(event) {
        const appointmentId = event.target.getAttribute('data-appointment-id');

        try {
          const response = await axios.post("http://localhost:8000/api/employees/appointmentscancel", {
            Appointment_id: appointmentId,
            status: 'ยกเลิก'
          });

          if (response.status === 200) {
            alert('การนัดหมายถูกยกเลิกแล้ว');
            event.target.textContent = 'ยกเลิกแล้ว';
            event.target.disabled = true;
          } else {
            alert(response.data.message || 'ไม่สามารถยกเลิกการนัดหมายได้');
          }
        } catch (error) {
          console.error('Error cancelling appointment:', error);
          alert('เกิดข้อผิดพลาดในการยกเลิกการนัดหมาย');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}









const changePassword = async () => {
  document.getElementById('change-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const login_id = sessionStorage.getItem('employeeID');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/employees/change-password', {
        login_id: login_id,
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
let userId = sessionStorage.getItem('user_id'); // ดึง user_id จาก sessionStorage
let userFname = '';
let userLname = '';

// ดึงข้อมูลผู้ใช้
async function fetchUserDetails() {
  try {
    const response = await axios.post("http://localhost:8000/api/employees/userdetails", { userId: userId });
      const user = response.data.user;
      userFname = user[0].user_fname;
      userLname = user[0].user_lname;
      // console.log("User details fetched successfully:", userFname, userLname);
   
  } catch (error) {
    console.error("Error:", error);
    alert("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
  }
}

// ดึงข้อมูลแพทย์
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
  const doctorSelect = document.getElementById("doctor");

  // เติมตัวเลือกลงใน select
  doctors.forEach(doctor => {
    const option = document.createElement("option");
    option.value = doctor.doc_id; 
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

async function saveAppointment() {
  const problem = document.getElementById("problem").value.trim();
  const date = document.getElementById("date").value;
  const status = "รอการยืนยัน";

  // ตรวจสอบว่า user_id, doc_id, date และ problem ถูกกรอกครบถ้วน
  if (!userId || !selectedDoctorId || !date || !problem) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  const appointmentId = generateUniqueAppointmentId(userId, date);

  const appointmentData = {
    appointment_id: appointmentId,
    user_id: userId,
    user_fname: userFname,
    user_lname: userLname,
    doc_id: selectedDoctorId,
    doc_name: selectedDoctorName,
    date,
    problem,
    status,
  };

  try {
    const response = await axios.post("http://localhost:8000/api/employees/appointments", appointmentData);
    if (response.status >= 200 && response.status < 300) {
      alert("บันทึกข้อมูลการนัดหมายสำเร็จ");
    } else {
      throw new Error("Error saving appointment");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลการนัดหมาย");
  }
}

// ฟังก์ชันสร้าง appointment_id ไม่ซ้ำ
function generateUniqueAppointmentId(userId, date) {
  // ตัดเครื่องหมาย "-" ออกจาก user_id
  const cleanUserId = userId.replace(/-/g, '');
  
  // ดึง 4 ตัวท้ายจาก userId
  const shortUserId = cleanUserId.slice(-4);
  
  // จัดรูปแบบวันที่ให้เป็น YYYYMM
  const formattedDate = date.replace(/-/g, '').slice(2, 8);

  // สร้าง ID เบื้องต้น
  const baseId = `${shortUserId}${formattedDate}`;

  // สลับตัวอักษรใน ID แบบสุ่ม
  const shuffledId = baseId
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  // สร้าง appointment ID แบบสวยงาม
  return `APPT-${shuffledId.toUpperCase()}`;
}



// Event Listener เมื่อกดปุ่มบันทึก
// document.getElementById("save-appointment").addEventListener("click", (e) => {
//   e.preventDefault(); 
//   saveAppointment();
// });

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "manage_doctor.html") {
    fetchDoctors();
  }
  if (currentPage === "manage_admin.html") {
    fetchEmployee()
  }
  if (currentPage === "manage_user.html") {
    fetchUserlist()
  }
  if (currentPage === "mange_user_data.html") {
    fetchUserDataAndDisplay()
    fetchUserDetails()
    fetchAppointment()
  }
});
