const fetchDoctorInfo = async () => {
  try {
    // ใช้ POST แทน GET ในการดึงข้อมูล employee
    const response = await axios.post(`http://localhost:8000/api/doctors/doctorinfo`, {}, {
      withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
    });

    if (response.data && response.data.doctor) {
      const doctorInfo = response.data.doctor;
      console.log("doctorInfo:", doctorInfo);
      sessionStorage.setItem('doctorID', doctorInfo.doc_id || '');


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

// const changePassword = async () => {
//   document.getElementById('change-password-form').addEventListener('submit', async (event) => {
//     event.preventDefault();
//     const currentPassword = document.getElementById('current-password').value;
//     const newPassword = document.getElementById('new-password').value;
//     const confirmPassword = document.getElementById('confirm-password').value;

//     if (newPassword !== confirmPassword) {
//       alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:8000/api/doctors/change-password', {
//         oldPassword: currentPassword,
//         newPassword: newPassword,
//         confirmPassword: confirmPassword
//       }, {
//         withCredentials: true
//       });

//       if (response.status === 200) {
//         alert("อัปเดตรหัสผ่านเรียบร้อยแล้ว");
//         window.location.reload()
//         // window.location.href = 'profile.html'; 
//       } else {
//         alert(response.data.message || "An error occurred");
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert("ไม่สามารถอัปเดตรหัสผ่าน โปรดลองอีกครั้งในภายหลัง");
//     }
//   });
// };

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
    const today = new Date().toISOString().split('T')[0];  // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD

    if (date < today) {
      alert("ไม่สามารถเลือกวันที่หลังจากวันปัจจุบันได้");
      return;
    }

    const Availability_id = generateAvailabilityId(date, time_start, time_end);

    const response = await axios.post("http://localhost:8000/api/doctors/saveAvailability", {
      Availability_id,
      date,
      time_start,
      time_end,
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



async function fetchAvailabilityList() {
  try {
    const response = await axios.post("http://localhost:8000/api/doctors/getAvailability", {}, {
      withCredentials: true
    });

    console.log(response); // ดูผลลัพธ์ของ API เพื่อช่วยในการดีบั๊ก

    // ตรวจสอบว่า response.data มี availability หรือไม่
    const availability = response.data?.availability;

    // ถ้าไม่มีข้อมูลหรือ availability เป็น array ว่าง
    if (!availability || availability.length === 0) {
      // แสดงข้อความเมื่อไม่มีข้อมูล
      document.getElementById("availabilityTable").innerHTML =
        `<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>`;
      return;
    }

    // แปลงข้อมูลและสร้างแถวตาราง
    const rows = availability.map((item) => {
      const date = new Date(item.date);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      return `  
        <tr data-id="${item.Availability_id}">
          <td>${formattedDate}</td>
          <td>${item.time_start}</td>
          <td>${item.time_end}</td>
          <td>
            <button class="delete-button" onclick="deleteAvailability(event)">ลบ</button>
          </td>
        </tr>
      `;
    });

    // แสดงผลลัพธ์ในตาราง
    document.getElementById("availabilityTable").innerHTML = rows.join("");
  } catch (error) {
    console.error("Error fetching availability list:", error);
    document.getElementById("availabilityTable").innerHTML =
    `<tr><td colspan="4">ยังไม่มีข้อมูล</td></tr>`;
  }
}


async function deleteAvailability(event) {
  try {
    // เข้าถึง data-id จาก DOM
    const row = event.target.closest('tr'); // หาค่าของ tr ที่ปุ่มลบอยู่
    const Availability_id = row.getAttribute('data-id'); // ดึงค่า data-id

    const response = await axios.delete(`http://localhost:8000/api/doctors/deleteAvailability`, {
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

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // 
  if (currentPage === "doc_main.html") {
    fetchDoctorInfo();
  }
  if (currentPage === "doctor_availability.html") {
    fetchDoctorInfo();
    fetchAvailabilityList();
  }

});