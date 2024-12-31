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
        return`
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
        <td>ไม่มีการนัด</td>
        <td>ไม่มีการนัด</td>
        <td>
          <button class="action-btn" onclick="goToAppointmentPage('101')">จัดการข้อมูล</button>
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
  });
  
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

 