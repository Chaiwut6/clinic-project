const baseURL = "http://localhost:8000";
async function fetchUserDataAndDisplay() {
    const encrypUser = sessionStorage.getItem("user_id");
    try {
      const user_id = encrypUser ? atob(encrypUser) : null;
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
      document.getElementById('title').innerHTML = user[0].title;
      document.getElementById('user-fname').innerHTML = user[0].user_fname;
      document.getElementById('user-lname').innerHTML = user[0].user_lname;
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
          filteredAppointments
          .sort((a, b) => new Date(b.date) - new Date(a.date)) 
          .forEach(appointment => {
            const appointmentDate = new Date(appointment.date);
            const formattedDate = appointmentDate.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }); // ✅ แปลงวันที่ให้แสดงในรูปแบบไทย
        
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
  
      filterAppointmentsByMonth();
     
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
  }
  async function saveSymptoms() {
    const encrypUser = sessionStorage.getItem("user_id");
    const userId = encrypUser ? atob(encrypUser) : null;

    const encrypAppointment = sessionStorage.getItem("appointment_id");
    const appointmentId = encrypAppointment ? atob(encrypAppointment) : null;
    
    if (!userId || !appointmentId) {
        alert("ไม่พบข้อมูลผู้ใช้หรือรหัสการนัดหมาย");
        return;
    }

    // ✅ ดึงค่าที่เลือกจาก Checkbox
    const selectedSymptoms = [...document.querySelectorAll("input[name='symptoms']:checked")]
        .map(input => input.value);

   
    const additionalSymptom = document.getElementById("additional-symptom").value.trim();

    if (selectedSymptoms.length === 0 && !additionalSymptom) {
        alert("กรุณาเลือกหรือกรอกอาการ");
        return;
    }

    const requestBody = {
        user_id: userId,
        appointment_id: appointmentId,
        symptoms: selectedSymptoms,
        ...(additionalSymptom && { additionalSymptom }) // ✅ ส่งไปเฉพาะถ้ามีข้อมูล
    };

    try {
        const response = await axios.post("http://localhost:8000/api/doctors/saveSymptoms", requestBody);

        if (response.status === 200) {
            alert("บันทึกอาการสำเร็จ");
            document.querySelectorAll("input[name='symptoms']").forEach(input => input.checked = false);
            document.getElementById("additional-symptom").value = "";
        }
    } catch (error) {
        console.error("Error saving symptoms:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกอาการ");
    }
}



  document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "doctormange_data.html") {
        fetchUserDataAndDisplay()
    }
  });