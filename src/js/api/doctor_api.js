const fetchDoctorInfo = async () => {
  try {
    // ใช้ POST แทน GET ในการดึงข้อมูล employee
    const response = await axios.post(`https://clinic-project-w900.onrender.com/api/doctors/doctorinfo`, {}, {
      withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
    });

    if (response.data && response.data.doctor) {
      const doctorInfo = response.data.doctor;
      // console.log("doctorInfo:", doctorInfo);
      // sessionStorage.setItem('doctorID', doctorInfo.doc_id || '');


      // แสดงข้อมูลบนหน้า
      updatePageData(doctorInfo);

    } else {
      console.error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Error fetching doctor info:', error);
  }
};

const updatePageData = (doctorInfo) => {
  const updateElements = (selector, value) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(el => el.textContent = value || 'N/A');
    }
  };

  if (doctorInfo) {
    updateElements('.doctor_id', doctorInfo.doc_id);
    updateElements('.doc_name', doctorInfo.doc_name);
  } else {
    console.warn("doctor info is missing");
  }
};

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
      const response = await axios.post('https://clinic-project-w900.onrender.com/api/doctors/change-password', {
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


function generateAvailabilityId(time_start, time_end, date) {
  // กำหนดรูปแบบเวลาและวันที่
  const formattedTimeStart = time_start.replace(/:/g, '');  
  const formattedTimeEnd = time_end.replace(/:/g, ''); 
  const formattedDate = date.replace(/-/g, '').slice(2);  

  const elements = [formattedDate, formattedTimeStart, formattedTimeEnd];

  const shuffled = elements
    .sort(() => Math.random() - 0.5)  
    .join(''); 

  return `Avail-${shuffled}`;
}

async function saveAvailability() {
  try {
    const date = document.getElementById("availableDate").value;
    const time_start = document.getElementById("timeStart").value;
    const time_end = document.getElementById("timeEnd").value;

    if (!date || !time_start || !time_end) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ตรวจสอบวันที่ที่เลือกว่าหลังจากวันปัจจุบันหรือไม่
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      alert("ไม่สามารถเลือกวันที่ผ่านมาแล้วได้");
      return;
    }

    const Availability_id = generateAvailabilityId(date, time_start, time_end);

    // ดึง doc_id จาก sessionStorage หรือ token
    // const doc_id = sessionStorage.getItem("doctorID") || null;
    // if (!doc_id) {
    //   alert("เกิดข้อผิดพลาด: ไม่พบรหัสแพทย์");
    //   return;
    // }

    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/saveAvailability", {
      Availability_id,
      date,
      time_start,
      time_end
    },{
      withCredentials: true
    });

    if (response.data && response.data.success) {
      alert("บันทึกวันว่างสำเร็จ");
      fetchAvailabilityList();
    } else {
      console.error("บันทึกไม่สำเร็จ", response.data);
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}


let currentPage = 1;
const itemsPerPage = 12;
let availabilityData = []; // เก็บข้อมูลทั้งหมด

async function fetchAvailabilityList() {
  try {
    const response = await axios.post("https://clinic-project-w900.onrender.com/api/doctors/getAvailabilitydoctor", {}, {
      withCredentials: true
    });

    availabilityData = response.data?.availability || [];

    // เรียงวันที่จากน้อยไปมาก (Ascending Order)
    availabilityData.sort((a, b) => new Date(a.available_date) - new Date(b.available_date));

    if (availabilityData.length === 0) {
      document.getElementById("availabilityTable").innerHTML =
        `<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>`;
      document.getElementById("paginationControls").innerHTML = ""; // ลบปุ่มเปลี่ยนหน้า
      return;
    }

    // โหลดหน้าตารางเริ่มต้น และสร้างปุ่มเปลี่ยนหน้า
    renderTable();
    renderPaginationControls();
  } catch (error) {
    console.error("Error fetching availability list:", error);
    document.getElementById("availabilityTable").innerHTML =
      `<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>`;
    document.getElementById("paginationControls").innerHTML = ""; 
  }
}

function renderTable() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = availabilityData.slice(startIndex, endIndex); // เลือกเฉพาะข้อมูลหน้าปัจจุบัน

  const rows = pageData.map((item) => {
    const formattedDate = new Date(item.available_date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedStartTime = item.start_time.slice(0, 5);
    const formattedEndTime = item.end_time.slice(0, 5);

    return `
      <tr data-id="${item.Availability_id}">
        <td>${formattedDate}</td>
        <td>${formattedStartTime}</td>
        <td>${formattedEndTime}</td>
        <td>
          <button class="delete-button" onclick="deleteAvailability(event)">ลบ</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("availabilityTable").innerHTML = rows.join("");
}

// ฟังก์ชันสร้างปุ่มเปลี่ยนหน้า
function renderPaginationControls() {
  const totalPages = Math.ceil(availabilityData.length / itemsPerPage);
  let controlsHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    controlsHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  document.getElementById("paginationControls").innerHTML = controlsHTML;
}

// ฟังก์ชันเปลี่ยนหน้า
function changePage(page) {
  currentPage = page;
  renderTable();
  renderPaginationControls();
}


async function deleteAvailability(event) {
  try {
    // เข้าถึง data-id จาก DOM
    const row = event.target.closest('tr'); // หาค่าของ tr ที่ปุ่มลบอยู่
    const Availability_id = row.getAttribute('data-id'); // ดึงค่า data-id

    const response = await axios.delete(`https://clinic-project-w900.onrender.com/api/doctors/deleteAvailability`, {
      data: { Availability_id }  // ส่ง Availability_id ใน request body
    });

    if (response.data.success) {
      alert("ลบข้อมูลสำเร็จ");
      fetchAvailabilityList(); // โหลดรายการวันว่างใหม่
    } else {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  } catch (error) {
    console.error("Error deleting availability:", error);
    alert("เกิดข้อผิดพลาดในการลบข้อมูล");
  }
}
const Logout = async () => {
  try {
    // เรียก API logout ไปที่เซิร์ฟเวอร์
    const response = await axios.post('https://clinic-project-w900.onrender.com/api/students/logout', {}, { withCredentials: true });
    sessionStorage.removeItem('doctorID');
    if (response.data.message === 'ออกจากระบบสำเร็จ') {
      console.log('คุณออกจากระบบเรียบร้อยแล้ว');

      // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
      window.location.href = '/'; // 
      // หรือหน้าอื่นที่คุณต้องการ
    } else {
      console.error('การออกจากระบบล้มเหลว');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "doc_main.html") {
    fetchDoctorInfo();
  }
  if (currentPage === "doctor_availability.html") {
    fetchDoctorInfo();
    fetchAvailabilityList();
  }
  if (currentPage === "doctormange_data.html") {
    fetchDoctorInfo();
  }

});