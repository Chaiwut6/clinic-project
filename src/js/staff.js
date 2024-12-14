document.addEventListener('DOMContentLoaded', () => {
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
  

