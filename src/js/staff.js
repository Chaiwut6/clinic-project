//เพิ่มแพทย์
document.addEventListener("DOMContentLoaded", () => {
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const addDoctorModal = document.getElementById('addDoctorModal');
    const closeBtn = document.querySelector('#addDoctorModal .close');

    // Open the modal when "เพิ่มแพทย์" button is clicked
    if (addDoctorBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
      addDoctorBtn.addEventListener('click', () => {
          const addDoctorModal = document.getElementById('addDoctorModal');
          addDoctorModal.style.display = 'block';
      });
  }

    // Close the modal when "X" button is clicked
    if (closeBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
      closeBtn.addEventListener('click', () => {
        addDoctorModal.style.display = 'none'; // Hide the modal
    });
  }

    // Close the modal if the user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === addDoctorModal) {
            addDoctorModal.style.display = 'none'; // Hide the modal
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const addAddminBtn = document.getElementById('addAddminBtn');
  const addAddminModal = document.getElementById('addEmployeeModal');
  const closeBtn = document.querySelector('#addEmployeeModal .close');

  if (addAddminBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
    addAddminBtn.addEventListener('click', () => {
      addAddminModal.style.display = 'block'; // เปิด modal
    });
  }

  // Close the modal when "X" button is clicked
  if (closeBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
    closeBtn.addEventListener('click', () => {
      addAddminModal.style.display = 'none'; // ปิด modal
    });
  }

  // Close the modal if the user clicks outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === addAddminModal) {
      addAddminModal.style.display = 'none'; // ซ่อน modal เมื่อคลิกนอก modal
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const addMangerBtn = document.getElementById('addMangerBtn');
  const addMangerModal = document.getElementById('addMangerModal');
  const closeBtn = document.querySelector('#addMangerModal .close');

  if (addMangerBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
    addMangerBtn.addEventListener('click', () => {
      addMangerModal.style.display = 'block'; // เปิด modal
    });
  }

  // Close the modal when "X" button is clicked
  if (closeBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
    closeBtn.addEventListener('click', () => {
      addMangerModal.style.display = 'none'; // ปิด modal
    });
  }

  // Close the modal if the user clicks outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === addMangerModal) {
      addMangerModal.style.display = 'none'; // ซ่อน modal เมื่อคลิกนอก modal
    }
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
  if (closeBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริง
    closeBtn.addEventListener('click', () => {
      editModal.style.display = 'none'; // ซ่อน modal
    });
}

  // ปิด modal เมื่อคลิกภายนอก modal
  window.addEventListener('click', (event) => {
    if (event.target === editModal) {
      editModal.style.display = 'none'; // ซ่อน modal
    }
  });
});

//ค้นหาผู้ป่วย
document.addEventListener("DOMContentLoaded", () => {
  const searchInputs = document.querySelectorAll(".searchpatiet");
  const tableRows = document.querySelectorAll(".patientTable tr");
  const dateFilter = document.querySelector(".dateFilter");

  if (searchInputs.length > 0 && tableRows.length > 0) { // ตรวจสอบว่ามี input สำหรับค้นหาหรือแถวในตาราง
    // ฟังก์ชันสำหรับการค้นหา
    searchInputs.forEach(searchInput => {
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
    });
  }

  if (dateFilter) { // ตรวจสอบว่ามี dateFilter หรือไม่
    // ฟังก์ชันสำหรับการกรองตามวันที่
    dateFilter.addEventListener("change", (e) => {
      const selectedDate = new Date(e.target.value); // รับค่าจาก dateFilter
      tableRows.forEach((row) => {
        const dateCell = row.querySelector(".date-cell"); // ค้นหา date-cell ในแต่ละแถว
        if (dateCell) {
          // แปลงวันที่ในเซลล์เป็นวันที่ที่สามารถใช้งานได้
          const rowDate = new Date(dateCell.innerText.trim());
          if (rowDate.toDateString() === selectedDate.toDateString()) { // เปรียบเทียบวันที่
            row.style.display = ""; // แสดงแถว
          } else {
            row.style.display = "none"; // ซ่อนแถว
          }
        }
      });
    });
  }
});


// เปิด Modal สำหรับแก้ไขวันนัด
function editAppointment(date) {
  document.getElementById('editModal').style.display = 'block';
  document.getElementById('edit-form').onsubmit = function (e) {
    e.preventDefault();
    const newDate = document.getElementById('new-date').value;
    if (newDate) {
      alert(`วันนัด ${date} ถูกเปลี่ยนเป็น ${newDate}`);
      closeModal();
    }
  };
}

// ยกเลิกวันนัด
function cancelAppointment(date) {
  const confirmation = confirm(`คุณต้องการยกเลิกวันนัด ${date} ใช่หรือไม่?`);
  if (confirmation) {
    alert(`วันนัด ${date} ถูกยกเลิกเรียบร้อยแล้ว`);
  }
}

// ปิด Modal
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}


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
  const searchInput = document.querySelectorAll(".searchaddmin");
  const tableRows = document.querySelectorAll("#addminTable tr");

  // ฟังก์ชันสำหรับการค้นหา
  searchInput.forEach(searchInput => {
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
  });

  

  // ฟังก์ชันสำหรับการกรองตามวันที่

});

//ค้นหาdoctor
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelectorAll(".searchdoctor");
  const tableRows = document.querySelectorAll("#doctorinTable tr");
  

  // ฟังก์ชันสำหรับการค้นหา
  searchInput.forEach(searchInput => {
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
  });

});

function filterPatients() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchName').value.toLowerCase();
  const facultyFilter = document.getElementById('searchFaculty').value;
  // const yearFilter = document.getElementById('searchYear').value;
  const table = document.getElementById('UserTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const ID = cells[0].textContent.toLowerCase();
      const name = cells[1].textContent.toLowerCase();
      const faculty = cells[3].textContent;
      // const year = cells[0].textContent; 

      if (
        (ID.includes(nameFilter) || !nameFilter) &&
        (faculty === facultyFilter || !facultyFilter) 
        // (year.includes(yearFilter) || !yearFilter)
      )  {
        rows[i].style.display = '';
      } else if (
        (name.includes(nameFilter) || !nameFilter) &&
        (faculty === facultyFilter || !facultyFilter) 
        // (year.includes(yearFilter) || !yearFilter)
      )  {
        rows[i].style.display = '';
      }
      else {
        rows[i].style.display = 'none';
      }
    }
  }
}

function filterReceivecare() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchName').value.toLowerCase();
  const doctorFilter = document.getElementById('doctorSelect').value;
  // const dateFilter = document.getElementById('dateFilter').value;
  // const yearFilter = document.getElementById('searchYear').value;
  const table = document.getElementById('patientTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const name = cells[1].textContent.toLowerCase();
      const doctor = cells[7].textContent;
      // const date = cells[6].textContent;
      // const year = cells[0].textContent; 

      if (
        (name.includes(nameFilter) || !nameFilter) &&
        (doctor === doctorFilter || !doctorFilter) 
        // (date === dateFilter || !dateFilter)
        // (year.includes(yearFilter) || !yearFilter)
      ) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  }
}

function filterDoctor() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchdoctor').value.toLowerCase();
  const idFilter = document.getElementById('searchdoctor').value.toLowerCase();
  const table = document.getElementById('doctorinTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const name = cells[1].textContent.toLowerCase();
      const ID = cells[0].textContent.toLowerCase();
    

      if (
        (name.includes(nameFilter) || !nameFilter) ||
        (ID === idFilter || !idFilter)
        // (year.includes(yearFilter) || !yearFilter)
      ) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  }
}

function filterAddmin() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchaddmin').value.toLowerCase();
  const idFilter = document.getElementById('searchaddmin').value.toLowerCase();
  const table = document.getElementById('addminTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const name = (cells[1].textContent + " " + cells[2].textContent).toLowerCase();
      const ID = cells[0].textContent.toLowerCase();
    

      if (
        (name.includes(nameFilter) || !nameFilter) ||
        (ID === idFilter || !idFilter)
        // (date === dateFilter || !dateFilter)
        // (year.includes(yearFilter) || !yearFilter)
      ) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  }
}

function filterManager() {
  // Function to filter patients based on input and dropdowns
  const nameFilter = document.getElementById('searchmanager').value.toLowerCase();
  const idFilter = document.getElementById('searchmanager').value.toLowerCase();
  const table = document.getElementById('managerinTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
      const name = (cells[1].textContent + " " + cells[2].textContent).toLowerCase();
      const ID = cells[0].textContent.toLowerCase();
    

      if (
        (name.includes(nameFilter) || !nameFilter) ||
        (ID === idFilter || !idFilter)
        // (date === dateFilter || !dateFilter)
        // (year.includes(yearFilter) || !yearFilter)
      ) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  }
}

const goToAppointmentPage = (userId) => {
  sessionStorage.setItem('user_id', userId);
  window.location.href = 'mange_user_data.html';
};








  

