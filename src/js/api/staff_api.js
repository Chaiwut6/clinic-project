document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addDoctorForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // ป้องกันการ refresh หน้า

    // รับค่าจากฟอร์ม
    const doctorName = document.getElementById("doctorName").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    // ตรวจสอบว่าข้อมูลครบถ้วน
    if (!doctorName || !phoneNumber) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
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

document.addEventListener("DOMContentLoaded", () => {
  const fetchEmployeeInfo = async () => {
    try {
      // ใช้ POST แทน GET ในการดึงข้อมูล employee
      const response = await axios.post("http://localhost:8000/api/employees/employeeinfo", {}, {
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
                  <a href="#" class="editBtn" data-id="${doc.doc_id}" data-name="${doc.doc_name}" data-phone="${doc.phone}">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>แก้ไขข้อมูล</span>
                  </a>
                  <a href="#" class="delete-trigger" data-id="${doc.doc_id}">
                    <i class="fa-solid fa-trash"></i>
                    <span>ลบ</span>
                  </a>
                  <a href="#" class="manageAvailability" data-id="${doc.doc_id}" data-name="${doc.doc_name}">
                    <i class="fa-solid fa-calendar"></i>
                    <span>จัดการวันว่าง</span>
                  </a>
                </div>
              </div>
            </td>
          </tr>
        `;
    });
    document.getElementById("doctorinTable").innerHTML = rows.join("");

    // จัดการการแก้ไขข้อมูล
    const editButtons = document.querySelectorAll(".editBtn");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();

        const docId = button.getAttribute("data-id");
        const docName = button.getAttribute("data-name");
        const docPhone = button.getAttribute("data-phone");

        const formHtml = `
          <div class="popup-container">
          <div class="popup-content">
            <div>
              <span class="close" id="cancelEdit">&times;</span>
            </div>
            <label for="editName">ชื่อแพทย์</label>
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
      });
    });

    // จัดการการลบข้อมูล
    const deleteButtons = document.querySelectorAll(".delete-trigger");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const docId = button.getAttribute("data-id");

        if (confirm("คุณต้องการลบข้อมูลแพทย์นี้หรือไม่?")) {
          try {
            await axios.post("http://localhost:8000/api/doctors/doctorDelete", { doc_id: docId });
            alert("ลบข้อมูลแพทย์สำเร็จ");
            fetchDoctors();
          } catch (err) {
            console.error("Error deleting doctor data:", err);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
          }
        }
      });
    });

    // Dropdown functionality
    const dropdownButtons = document.querySelectorAll(".actionBtn");

    dropdownButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const dropdownContent = button.closest(".dropdown-doctor").querySelector(".dropdown-content");
        const dropdown = dropdownContent.parentElement;

        document.querySelectorAll(".dropdown-doctor.show").forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove("show");
            otherDropdown.querySelector(".dropdown-content").style.cssText = "";
          }
        });

        dropdown.classList.toggle("show");

        const rect = dropdownContent.getBoundingClientRect();
        dropdownContent.style.left = rect.right > window.innerWidth ? `${window.innerWidth - rect.right}px` : "";
        dropdownContent.style.top = rect.bottom > window.innerHeight ? `${window.innerHeight - rect.bottom}px` : "";
      });
    });

    window.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-doctor").forEach((dropdown) => {
        dropdown.classList.remove("show");
        dropdown.querySelector(".dropdown-content").style.cssText = "";
      });
    });

    // Add Availability
    document.addEventListener("click", (event) => {
      const manageAvailabilityButton = event.target.closest(".manageAvailability");
      if (manageAvailabilityButton) {
        const doctorID = manageAvailabilityButton.dataset.id;
        const doctorName = manageAvailabilityButton.dataset.name;
        openAvailabilityModal(doctorID, doctorName);
      }
    });

    document.getElementById("addAvailabilityForm").addEventListener("submit", async (event) => {
      event.preventDefault();
    
      const modal = document.getElementById("availabilityModal");
      const doctorID = modal.getAttribute("data-doctor-id");
      const availableDate = document.getElementById("availableDate").value;
      const startTime = document.getElementById("startTime").value;
      const endTime = document.getElementById("endTime").value;
    
      // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!doctorID || !availableDate || !startTime || !endTime) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
    
      // ตรวจสอบว่าเลือกวันที่ในอดีตหรือไม่
      const today = new Date();
      const selectedDate = new Date(availableDate);
      today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็นเที่ยงคืน
      if (selectedDate < today) {
        alert("ไม่สามารถเลือกวันที่ผ่านมาแล้วได้");
        return;
      }
    
      // สร้าง Availability ID
      const Availability_id = generateAvailabilityId(availableDate, startTime, endTime);
    
      try {
        const response = await axios.post("http://localhost:8000/api/doctors/add-availability", {
          Availability_id,
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
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    });
    

    async function fetchAvailability(doctorID) {
      try {
        const response = await axios.post("http://localhost:8000/api/doctors/get-availability", {
          doc_id: doctorID,
        });
        const availability = response.data.availability;
    
        const rows = availability.map((item) => {
          const formattedDate = new Date(item.available_date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const formattedStartTime = item.start_time.slice(0, 5); // HH:mm
          const formattedEndTime = item.end_time.slice(0, 5); // HH:mm
    
          return `
          <tr>
            <td>${formattedDate}</td>
            <td>${formattedStartTime}</td>
            <td>${formattedEndTime}</td>
            <td>
              <button class="delete-availability styled-delete-button" data-id="${item.Availability_id}">
                 ลบ
              </button>
            </td>
          </tr>
        `;
        });

        document.getElementById("availabilityTable").innerHTML = rows.join("");
    
        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll(".delete-availability");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", async (event) => {
            const availabilityId = event.target.dataset.id;
            if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
              try {
                await axios.post("http://localhost:8000/api/doctors/delete-availability", {
                  Availability_id: availabilityId,
                });
                alert("ลบรายการสำเร็จ");
                fetchAvailability(doctorID); // Refresh the table
              } catch (error) {
                console.error("Error deleting availability:", error);
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
            }
          });
        });
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    }
    

    function openAvailabilityModal(doctorID, doctorName) {
      const modal = document.getElementById("availabilityModal");
      document.getElementById("doctorNameTitle").textContent = `${doctorName}`;
      modal.setAttribute("data-doctor-id", doctorID);
      modal.style.display = "block";
      fetchAvailability(doctorID);
    }

    function closeAvailabilityModal() {
      const modal = document.getElementById("availabilityModal");
      modal.style.display = "none";
    }

    function generateAvailabilityId(date, time_start, time_end) {
      const formattedTimeStart = time_start.replace(/:/g, '');
      const formattedTimeEnd = time_end.replace(/:/g, '');
      const formattedDate = date.replace(/-/g, '').slice(2);

      const elements = [formattedDate, formattedTimeStart, formattedTimeEnd];

      const shuffled = elements.sort(() => Math.random() - 0.5).join('');

      return `Avail-${shuffled}`;
    }

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
      document.getElementById("addminTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลเจ้าหน้าที่สามารถแสดงได้</td></tr>`;
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
          const formattedDate = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }); // แปลงวันที่ให้แสดงในรูปแบบภาษาไทย
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
          const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }); // แปลงวันที่ให้แสดงในรูปแบบภาษาไทย
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
      // ไม่มีข้อมูลการนัดหมาย
      appointmentBody.innerHTML = '<tr><td colspan="2">ไม่มีข้อมูล</td></tr>';
      appointmentList.innerHTML = '<tr><td colspan="3">ไม่มีการนัดล่าสุด</td></tr>';
    } else {
      // แสดงประวัติการนัดทั้งหมด
      data.appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${formattedDate || 'ยังไม่มีการนัด'}</td>
          <td>${appointment.status || 'ไม่ระบุสถานะ'}</td>
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
let userId = sessionStorage.getItem('user_id'); // ดึง user_id จาก sessionStorage
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
      alert("ไม่พบข้อมูลแพทย์");
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

  doctorSelect.innerHTML = '<option value="">--เลือกแพทย์--</option>';

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
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลวันเวลาที่ว่างของแพทย์");
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
    cell.textContent = "ไม่มีข้อมูลวันเวลาที่แพทย์ว่าง";
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
      console.log("Response Data:", error.response.data); // ตรวจสอบข้อความที่ส่งกลับ
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




async function fetchManger() {
  try {

    document.getElementById("managerinTable").innerHTML = `<tr><td colspan="4">กำลังโหลดข้อมูล...</td></tr>`;

    // ดึงข้อมูลจาก API
    const response = await axios.post("http://localhost:8000/api/manager/managerResult");
    console.log(response);

    // ตรวจสอบและดึงข้อมูลพนักงานจาก response
    const { manager } = response.data;

    // ตรวจสอบว่ามีข้อมูลพนักงานหรือไม่
    if (!manager || manager.length === 0) {
      document.getElementById("managerinTable").innerHTML = `<tr><td colspan="4">ไม่พบข้อมูลผู้บริหาร</td></tr>`;
      return;
    }

 
    const rows = manager.map((man) => {
      return `
        <tr data-id="${man.man_id}">
          <td>${man.man_id || "ไม่ระบุ"}</td>
          <td>${man.man_fname || "ไม่ระบุ"}</td>
          <td>${man.man_lname || "ไม่ระบุ"}</td>
          <td>
            <div class="dropdown-doctor">
                <button class="actionBtn"><i class="fa-solid fa-grip-lines"></i></button>
                <div class="dropdown-content">
                    <a href="#" class="editBtn" data-id="${man.man_id}" data-fname="${man.man_fname}" data-lname="${man.man_lname}">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>แก้ไขข้อมูล</span>
                    </a>
                    <a href="#" class="delete-trigger" data-id="${man.man_id}">
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
    document.getElementById("managerinTable").innerHTML = rows.join("");
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
        const manId = button.getAttribute("data-id");
        const manFname = button.getAttribute("data-fname");
        const manLname = button.getAttribute("data-lname");

        // แสดงฟอร์มแก้ไข
        const formHtml = `
              <div class="popup-container">
                <div class="popup-content">
                  <div>
                    <span class="close" id="cancelEdit">&times;</span>
                  </div>
                  <label for="editFname">ชื่อ:</label>
                  <input type="text" id="editFname" value="${manFname}" placeholder="ชื่อพนักงาน..." required />
                  <label for="editLname">นามสกุล:</label>
                  <input type="text" id="editLname" value="${manLname}" placeholder="นามสกุล..." required />
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
            await axios.post("http://localhost:8000/api/manager/managerUpdate", {
              man_id: manId,
              man_fname: updatedFname,
              man_lname: updatedLname,
            });

            alert("ข้อมูลพนักงานได้รับการอัปเดตเรียบร้อยแล้ว");
            fetchManger(); 
            document.querySelector('.popup-container').remove();
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
        const manId = button.getAttribute("data-id");

        if (confirm("คุณต้องการลบข้อมูลพนักงานนี้หรือไม่?")) {
          try {
            // ส่งคำขอลบข้อมูลพนักงาน
            await axios.post("http://localhost:8000/api/manager/managerDelete", {
              man_id: manId,
            });

            alert("ลบข้อมูลพนักงานสำเร็จ");
            fetchManger(); // รีเฟรชข้อมูล
          } catch (err) {
            console.error("Error deleting employee:", err);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
          }
        }
      });
    });


  } catch (error) {
    console.error("Error fetching manager data:", error);
    document.getElementById("managerinTable").innerHTML = `<tr><td colspan="4">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
  }
}



// เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "manage_doctor.html") {
    fetchDoctors();
    sessionStorage.removeItem("user_id");
  }
  if (currentPage === "manage_admin.html") {
    fetchEmployee()
    sessionStorage.removeItem("user_id");
  }
  if (currentPage === "manage_user.html") {
    fetchUserlist()
    sessionStorage.removeItem("user_id");
  }
  if (currentPage === "mange_user_data.html") {
    fetchUserDataAndDisplay()
    // fetchAppointmentsAndUpdateUI()
    fetchUserDetails()
    fetchAppointment()
  }
  if (currentPage === "manage_man.html") {
    fetchManger()
    sessionStorage.removeItem("user_id");
  }
  if (currentPage === "patientslist.html") {
    sessionStorage.removeItem("user_id");
  }
});
