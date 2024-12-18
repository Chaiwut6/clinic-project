//เพิ่มแพทย์
document.addEventListener("DOMContentLoaded", () => {
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const addDoctorModal = document.getElementById('addDoctorModal');
    const closeBtn = document.querySelector('#addDoctorModal .close');

    // Open the modal when "เพิ่มแพทย์" button is clicked
    addDoctorBtn.addEventListener('click', () => {
        addDoctorModal.style.display = 'block'; // Show the modal
    });

    // Close the modal when "X" button is clicked
    closeBtn.addEventListener('click', () => {
        addDoctorModal.style.display = 'none'; // Hide the modal
    });

    // Close the modal if the user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === addDoctorModal) {
            addDoctorModal.style.display = 'none'; // Hide the modal
        }
    });
});

//dropdown
document.addEventListener('DOMContentLoaded', () => {
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
        dropdownContent.style.left = rect.left < 0 ? '2px' : dropdownContent.style.left;
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
  });

//ลบข้อมูล
document.addEventListener("DOMContentLoaded", function () {
  // Open Popup เมื่อคลิกปุ่ม delete-trigger
  document.querySelectorAll(".delete-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
          e.preventDefault(); // ป้องกันการกระทำของลิงก์
          document.querySelector(".delete-popup").style.display = "flex";
      });
  });

  // Close Popup เมื่อคลิกปุ่ม close-delete-btn
  document.querySelectorAll(".close-delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
          document.querySelector(".delete-popup").style.display = "none";
      });
  });
});


//edit 
document.addEventListener('DOMContentLoaded', () => {
  const editBtns = document.querySelectorAll('.editBtn'); // เลือกทุกปุ่มที่มี class "editDoctorBtn"
  const editModal = document.getElementById('editModal');
  const closeBtn = document.querySelector('#editModal .close');

  // เปิด modal เมื่อคลิกที่ปุ่มแก้ไข
  editBtns.forEach(button => {
    button.addEventListener('click', () => {
      editModal.style.display = 'block'; // แสดง modal
    });
  });

  // ปิด modal เมื่อคลิกที่ปุ่ม "X"
  closeBtn.addEventListener('click', () => {
    editModal.style.display = 'none'; // ซ่อน modal
  });

  // ปิด modal เมื่อคลิกภายนอก modal
  window.addEventListener('click', (event) => {
    if (event.target === editModal) {
      editModal.style.display = 'none'; // ซ่อน modal
    }
  });
});

//ค้นหาผู้ป่วย
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const tableRows = document.querySelectorAll("#patientTable tr");
  const dateFilter = document.getElementById("dateFilter");

  // ฟังก์ชันสำหรับการค้นหา
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    tableRows.forEach((row) => {
      const rowText = row.innerText.toLowerCase();
      if (rowText.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  

  // ฟังก์ชันสำหรับการกรองตามวันที่
  dateFilter.addEventListener("change", (e) => {
    const selectedDate = new Date(e.target.value);
    tableRows.forEach((row) => {
      const dateCell = row.querySelector(".date-cell");
      if (dateCell) {
        const rowDate = new Date(dateCell.innerText);
        if (rowDate.toDateString() === selectedDate.toDateString()) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    });
  });
});

function exportToExcel() {
  // ดึงตารางข้อมูล
  const table = document.getElementById("patientTable");
  
  // แปลงตารางเป็นไฟล์ Excel
  const workbook = XLSX.utils.table_to_book(table, { sheet: "Appointments" });
  
  // บันทึกไฟล์ Excel
  XLSX.writeFile(workbook, "DoctorAppointments.xlsx");
}
//ค้นหาaddmin
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const tableRows = document.querySelectorAll("#addminTable tr");

  // ฟังก์ชันสำหรับการค้นหา
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    tableRows.forEach((row) => {
      const rowText = row.innerText.toLowerCase();
      if (rowText.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  

  // ฟังก์ชันสำหรับการกรองตามวันที่

});

//ค้นหาdoctor
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const tableRows = document.querySelectorAll("#doctorinTable tr");

  // ฟังก์ชันสำหรับการค้นหา
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    tableRows.forEach((row) => {
      const rowText = row.innerText.toLowerCase();
      if (rowText.includes(query)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  

  // ฟังก์ชันสำหรับการกรองตามวันที่
});

function filterPatients() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchName').value.toLowerCase();
  const facultyFilter = document.getElementById('searchFaculty').value;
  const yearFilter = document.getElementById('searchYear').value;
  const table = document.getElementById('patientTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const name = cells[1].textContent.toLowerCase();
      const faculty = cells[3].textContent;
      const year = cells[0].textContent; // Adjust if you store year in a different column

      if (
        (name.includes(nameFilter) || !nameFilter) &&
        (faculty === facultyFilter || !facultyFilter) &&
        (year.includes(yearFilter) || !yearFilter)
      ) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  }
}

function goToAppointmentPage(patientId) {
  alert('ไปยังหน้าลงวันนัดสำหรับผู้ป่วย ID: ' + patientId);
  // Add navigation logic here
}





  

