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

  async function loadAppointmentsOverviewChart() {
    try {
        const selectedYear = document.getElementById("yearFilterAppointments").value;
        const selectedMonth = document.getElementById("monthFilterAppointments").value;

        const response = await axios.post("http://localhost:8000/api/employees/appointmentsOverview", {
            year: selectedYear,
            month: selectedMonth
        });

        const data = response.data;
        if (!data.success) {
            throw new Error("Error fetching appointment data");
        }

        const labels = data.appointments.map(a => convertToThaiDate(a.month));
        const totalAppointments = data.appointments.map(a => a.total || 0);
        const confirmedAppointments = data.appointments.map(a => a.confirmed || 0);
        const cancelledAppointments = data.appointments.map(a => a.cancelled || 0);
        const closedCases = data.appointments.map(a => a.closedCases || 0);
        const pendingAppointments = data.appointments.map(a => a.pending || 0);

        const chartContainer = document.querySelector(".chart-container"); // ✅ ค้นหา container ที่เก็บ <canvas>

        // ✅ ลบกราฟเก่าถ้ามี
        const existingChart = Chart.getChart("appointmentsOverviewChart");
        if (existingChart) existingChart.destroy();

        // ✅ ถ้าไม่มีข้อมูล → แสดง `"ไม่มีข้อมูล"` โดยไม่ลบ `<canvas>`
        if (labels.length === 0 || totalAppointments.every(val => val === 0)) {
            chartContainer.innerHTML = `<p class="text-center text-muted">ไม่มีข้อมูล</p>`;
            return;
        } else {
            // ✅ ถ้าถูกลบไปแล้ว → ตรวจสอบและสร้าง `<canvas>` ใหม่
            if (!document.getElementById("appointmentsOverviewChart")) {
                chartContainer.innerHTML = `<canvas id="appointmentsOverviewChart"></canvas>`;
            }
        }

        // ✅ ใช้ `setTimeout()` เพื่อให้ `<canvas>` สร้างเสร็จก่อนใช้ `getContext("2d")`
        setTimeout(() => {
            const canvas = document.getElementById("appointmentsOverviewChart");
            if (!canvas) {
                console.error("❌ Error: Canvas ไม่ถูกสร้างขึ้น");
                return;
            }

            const ctx = canvas.getContext("2d");

            const chartData = [
                { label: "นัดหมายทั้งหมด", data: totalAppointments, bgColor: "#36b9cc", borderColor: "#36b9cc" },
                { label: "รอการยืนยัน", data: pendingAppointments, bgColor: "#87CEFA", borderColor: "#87CEFA" },
                { label: "ยืนยันแล้ว", data: confirmedAppointments, bgColor: "#f6c23e", borderColor: "#f6c23e" },
                { label: "ยกเลิก", data: cancelledAppointments, bgColor: "#FF6384", borderColor: "#FF6384" },
                { label: "ปิดเคส", data: closedCases, bgColor: "#858796", borderColor: "#858796" }
            ];

            const datasets = chartData.map(item => ({
                label: item.label,
                data: item.data,
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
                borderWidth: 1
            }));

            new Chart(ctx, {
                type: "bar",
                data: { labels: labels, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "top",
                            labels: { font: { size: 14 } }
                        },
                        tooltip: {
                            enabled: true,
                            mode: "index",
                            intersect: false
                        }
                    },
                    scales: {
                        x: { ticks: { font: { size: 14 } } },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: "จำนวนการนัดหมาย", font: { size: 14 } },
                            ticks: { font: { size: 14 }, stepSize: 1, precision: 0 }
                        }
                    }
                }
            });
        }, 100); 

    } catch (error) {
        console.error("Error loading appointment overview chart:", error);
    }
}







function populateYearFilter(filterId) {
  const yearSelect = document.getElementById(filterId);
  if (!yearSelect) {
      console.error(`❌ ไม่พบ ID ${filterId}`);
      return;
  }

  yearSelect.innerHTML = ""; // ล้างตัวเลือกเก่าก่อนเพิ่มใหม่
  const currentYear = new Date().getFullYear() + 543; // ใช้ พ.ศ.

  for (let i = currentYear; i >= currentYear - 5; i--) {
      const option = document.createElement("option");
      option.value = i - 543; // เก็บค่าเป็น ค.ศ.
      option.textContent = i; // แสดงเป็น พ.ศ.
      yearSelect.appendChild(option);
  }

  yearSelect.value = currentYear - 543; // ตั้งค่าปีปัจจุบัน
}

function convertToThaiDate(isoString) {
  if (!isoString) return "ไม่ระบุ"; 

  const date = new Date(isoString + "-01"); 
  const monthsThai = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
                      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const month = monthsThai[date.getMonth()];
  const year = date.getFullYear() + 543; 

  return `${month} ${year}`;
}




async function loadAppointmentsBreakdownChart() {
  try {
      const selectedYear = document.getElementById("yearFilterUsers").value;
      const selectedMonth = document.getElementById("monthFilterUsers").value;

      // ส่งค่าปีและเดือนไปยัง API
      const response = await axios.post("http://localhost:8000/api/employees/appointmentsByFaculty", {
          year: selectedYear,
          month: selectedMonth
      });

      const data = response.data;
      if (!data.success) throw new Error("Error fetching appointment data");

      const labels = data.appointments.map(a => a.faculty) || [];
      const totalAppointments = data.appointments.map(a => a.total) || [];
      const totalAll = data.totalConfirmedAppointments || 0;

      // ลบกราฟเก่าเพื่อป้องกันการซ้อนทับ
      const existingChart = Chart.getChart("appointmentsBreakdownChart");
      if (existingChart) existingChart.destroy();

      // ถ้าไม่มีข้อมูลให้แสดงข้อความแทนกราฟ
      if (totalAll === 0) {
          document.getElementById("appointmentsBreakdownChart").style.display = "none";
          document.getElementById("totalAppointmentsCount").innerText = "ไม่มีข้อมูล";
          return;
      } else {
          document.getElementById("appointmentsBreakdownChart").style.display = "block";
      }

      // กำหนดสีให้กับแต่ละคณะ
      const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FFCD56', '#C9CBCF', '#A3E4D7', '#F1948A',
          '#8E44AD', '#1ABC9C'
      ];

      const ctx = document.getElementById('appointmentsBreakdownChart').getContext('2d');
      new Chart(ctx, {
          type: 'pie',
          data: {
              labels: labels,
              datasets: [{
                  label: 'จำนวนการนัดหมายแยกตามคณะ',
                  data: totalAppointments,
                  backgroundColor: colors,
                  hoverOffset: 10
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: {
                      display: true,
                      position: 'right',
                      labels: {
                          font: { size: 14 },
                          padding: 20
                      }
                  },
                  tooltip: {
                      callbacks: {
                          label: function(tooltipItem) {
                              let faculty = labels[tooltipItem.dataIndex];
                              let count = totalAppointments[tooltipItem.dataIndex];
                              return `${faculty}: ${count}`;
                          }
                      }
                  }
              }
          }
      });

      // อัปเดตจำนวนรวมของผู้ใช้บริการ
      document.getElementById('totalAppointmentsCount').innerText = `รวมจำนวนผู้ใช้บริการ: ${totalAll}`;

  } catch (error) {
      console.error("Error loading appointment breakdown chart:", error);
  }
}



// เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
document.addEventListener("DOMContentLoaded", async () => {
  try {
      const currentPage = window.location.pathname.split("/").pop(); 

      if (currentPage === "dashboard.html") {


          await Promise.all([
              fetchDoctorCount(),
              fetchUserCount(),
              fetchAppointmentCount(),
              fetchConfirmedAppointmentCount(),
              fetchClosedCasesCount()
          ]);

        
          loadAppointmentsOverviewChart();
          loadAppointmentsBreakdownChart();

         
          if (document.getElementById("yearFilterAppointments")) {
              populateYearFilter("yearFilterAppointments");
          }
          if (document.getElementById("yearFilterUsers")) {
              populateYearFilter("yearFilterUsers");
          }

          console.log("Dashboard โหลดข้อมูลเสร็จแล้ว!");

      } else {
          console.log("ไม่ใช่หน้า Dashboard, ข้ามการโหลดข้อมูล...");
      }

      if (currentPage === "man_main.html") {


        await Promise.all([
            fetchDoctorCount(),
            fetchUserCount(),
            fetchAppointmentCount(),
            fetchConfirmedAppointmentCount(),
            fetchClosedCasesCount()
        ]);

      
        loadAppointmentsOverviewChart();
        loadAppointmentsBreakdownChart();

       
        if (document.getElementById("yearFilterAppointments")) {
            populateYearFilter("yearFilterAppointments");
        }
        if (document.getElementById("yearFilterUsers")) {
            populateYearFilter("yearFilterUsers");
        }

        console.log("Dashboard โหลดข้อมูลเสร็จแล้ว!");

    } else {
        console.log("ไม่ใช่หน้า Dashboard, ข้ามการโหลดข้อมูล...");
    }
  } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะโหลด Dashboard:", error);
  }
});
