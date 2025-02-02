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
  
      filterAppointmentsByMonth();
     
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "doctormange_data.html") {
        fetchUserDataAndDisplay()
    }
  });