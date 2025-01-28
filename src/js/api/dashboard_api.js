async function fetchDoctorCount() {
    try {
      const response = await axios.post("http://localhost:8000/api/doctors/doctorCount");
      if (response.status === 200) {
        const doctorCount = response.data.doctorCount;
  
        // อัปเดตจำนวนแพทย์ใน Dashboard
        document.getElementById("doctorCount").textContent = doctorCount;
      } else {
        console.error("Error retrieving doctor count:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching doctor count:", error);
    }
  }
  async function fetchUserCount() {
    try {
      const response = await axios.post("http://localhost:8000/api/users/userCount");
  
      if (response.data.success) {
        document.getElementById("userCount").textContent = response.data.userCount;
      } else {
        console.error("Failed to fetch user count");
      }
  
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  }

  async function fetchAppointmentCount() {
    try {
      const response = await axios.post("http://localhost:8000/api/employees/appointmentCount");
  
      if (response.data.success) {
        document.getElementById("appointmentCount").textContent = response.data.appointmentCount;
      } else {
        console.error("Failed to fetch appointment count");
      }
  
    } catch (error) {
      console.error("Error fetching appointment count:", error);
    }
  }
  async function fetchConfirmedAppointmentCount() {
    try {
      const response = await axios.post("http://localhost:8000/api/employees/confirmedAppointmentCount");
  
      if (response.data.success) {
        document.getElementById("confirmedAppointmentCount").textContent = response.data.confirmedAppointmentCount;
      } else {
        console.error("Failed to fetch confirmed appointment count");
      }
  
    } catch (error) {
      console.error("Error fetching confirmed appointment count:", error);
    }
  }
  async function fetchClosedCasesCount() {
    try {
      const response = await axios.post("http://localhost:8000/api/employees/closedCasesCount");
  
      if (response.data.success) {
        document.getElementById("closedCasesCount").textContent = response.data.closedCasesCount;
      } else {
        console.error("Failed to fetch closed cases count");
      }
  
    } catch (error) {
      console.error("Error fetching closed cases count:", error);
    }
  }

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // 
    if (currentPage === "dashboard.html") {
        fetchDoctorCount();
        fetchUserCount()
        fetchAppointmentCount()
        fetchConfirmedAppointmentCount()
        fetchClosedCasesCount()
    }
  });