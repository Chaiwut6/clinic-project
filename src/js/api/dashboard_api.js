
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
      const response = await axios.post("http://localhost:8000/api/students/userCount");
  
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
        const pendingAppointments = data.appointments.map(a => a.pending || 0);
        const followUpCases = data.appointments.map(a => a.followUp || 0);
        const closedCaseStatus = data.appointments.map(a => a.closedCaseStatus || 0);

        const chartContainer = document.querySelector(".chart-container");

        // ✅ ลบกราฟเก่า
        const existingChart = Chart.getChart("appointmentsOverviewChart");
        if (existingChart) existingChart.destroy();

        // ✅ ไม่มีข้อมูลให้แสดง `"ไม่มีข้อมูล"`
        if (labels.length === 0 || totalAppointments.every(val => val === 0)) {
            chartContainer.innerHTML = `<p class="text-center text-muted">ไม่มีข้อมูล</p>`;
            return;
        } else {
            if (!document.getElementById("appointmentsOverviewChart")) {
                chartContainer.innerHTML = `<canvas id="appointmentsOverviewChart"></canvas>`;
            }
        }

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
                { label: "ติดตามอาการ", data: followUpCases, bgColor: "#32CD32", borderColor: "#32CD32" },
                { label: "ปิดเคส", data: closedCaseStatus, bgColor: "#8B0000", borderColor: "#8B0000" }
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
      const selectedSymptom = document.getElementById("symptomFilterUsers").value;
      const selectedFaculty = document.getElementById("facultyFilterUsers").value;

      // ✅ ส่งค่าปี, อาการ และ คณะ ไปยัง API
      const response = await axios.post("http://localhost:8000/api/employees/appointmentsByFaculty", {
          year: selectedYear,
          symptom: selectedSymptom || null,  // ถ้าไม่เลือกอาการ ให้ส่งค่า null ไป
          faculty: selectedFaculty || null  // ถ้าไม่เลือกคณะ ให้ส่งค่า null ไป
      });

      const data = response.data;
      if (!data.success) throw new Error("Error fetching appointment data");

      const labels = data.appointments.map(a => a.faculty) || [];
      const totalAppointments = data.appointments.map(a => a.total) || [];
      const totalAll = data.totalConfirmedAppointments || 0;
    //   console.log(totalAll);
      // ✅ ดึง <select> อาการที่มีอยู่
      const symptomFilter = document.getElementById("symptomFilterUsers");
      const existingSymptoms = new Set(Array.from(symptomFilter.options).map(opt => opt.value));

      // ✅ ตรวจจับอาการใหม่ที่ไม่อยู่ใน `<select>` แล้วเพิ่มเข้าไป
      data.appointments.forEach(appointment => {
          Object.keys(appointment.symptoms).forEach(symptom => {
              if (!existingSymptoms.has(symptom)) {
                  // ✅ เพิ่มอาการใหม่เข้าไปใน dropdown
                  const newOption = document.createElement("option");
                  newOption.value = symptom;
                  newOption.textContent = `${symptom}`;
                  symptomFilter.appendChild(newOption);
                  existingSymptoms.add(symptom); // ✅ ป้องกันการเพิ่มซ้ำ
              }
          });
      });

      // ✅ ลบกราฟเก่าเพื่อป้องกันการซ้อนทับ
      const existingChart = Chart.getChart("appointmentsBreakdownChart");
      if (existingChart) existingChart.destroy();

      // ✅ ถ้าไม่มีข้อมูลให้แสดงข้อความแทนกราฟ
      if (totalAll === 0) {
          document.getElementById("appointmentsBreakdownChart").style.display = "none";
          document.getElementById("totalAppointmentsCount").innerText = "ไม่มีข้อมูล";
          return;
      } else {
          document.getElementById("appointmentsBreakdownChart").style.display = "block";
      }

      // ✅ กำหนดสีให้แต่ละคณะ
      const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FFCD56', '#C9CBCF', '#A3E4D7', '#F1948A',
          '#8E44AD', '#1ABC9C', '#D35400', '#E67E22', '#C0392B'
      ];

      const ctx = document.getElementById('appointmentsBreakdownChart').getContext('2d');
      new Chart(ctx, {
          type: 'pie', // ✅ ใช้ Pie Chart
          data: {
              labels: labels,
              datasets: [{
                  label: selectedSymptom 
                        ? `จำนวนผู้ป่วยที่มีอาการ ${selectedSymptom} ในแต่ละคณะ` 
                        : "จำนวนผู้ป่วยทั้งหมดในแต่ละคณะ",
                  data: totalAppointments,
                  backgroundColor: colors.slice(0, labels.length),
                  hoverOffset: 10
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: {
                      display: true,
                      position: 'right'
                  },
                  tooltip: {
                      callbacks: {
                          label: function(tooltipItem) {
                              let faculty = labels[tooltipItem.dataIndex];
                              let count = totalAppointments[tooltipItem.dataIndex];
                              return `${faculty}: ${count} คน`;
                          }
                      }
                  }
              }
          }
      });

      // ✅ อัปเดตจำนวนรวมของผู้ใช้บริการ
      document.getElementById('totalAppointmentsCount').innerText = selectedSymptom
          ? `รวมจำนวนผู้ป่วยที่มีอาการ ${selectedSymptom}: ${totalAll} คน`
          : `รวมจำนวนผู้ป่วยทั้งหมด: ${totalAll} คน`;

  } catch (error) {
      console.error("Error loading appointment breakdown chart:", error);
  }
}



async function exportToExcel() {
  try {
      // ✅ ดึงค่าปีที่เลือก และแปลงเป็น พ.ศ.
      const selectedYear = parseInt(document.getElementById("yearFilterUsers").value) || new Date().getFullYear();
      const thaiYear = selectedYear + 543; // แปลงเป็นปี พ.ศ.

      const response = await axios.post("http://localhost:8000/api/employees/appointmentsByFaculty", {
          year: selectedYear
      });

      const data = response.data;

      if (!data.success || !data.appointments || data.appointments.length === 0) {
          alert("ไม่มีข้อมูลสำหรับปีที่เลือก");
          return;
      }

      let symptomCounts = {};

      data.appointments.forEach(appointment => {
          Object.entries(appointment.symptoms).forEach(([symptom, count]) => {
              symptomCounts[symptom] = (symptomCounts[symptom] || 0) + count;
          });
      });

      // ✅ จัดรูปแบบข้อมูลให้เหมือนในภาพ
      const sheetData = [
          ["", `ประเภทโรค ปี ${thaiYear}`, ""],  // เปลี่ยนปีให้เป็น พ.ศ.
          ["ลำดับที่", "ประเภทของโรค", "จำนวน"]   // หัวตาราง
      ];

      let totalPatients = 0;
      let index = 1;

      Object.entries(symptomCounts).forEach(([symptom, count]) => {
          sheetData.push([index++, symptom, count]);
          totalPatients += count;
      });

      // ✅ เพิ่มแถวสรุปผลรวม
      sheetData.push(["", "รวมจำนวน", totalPatients]);

      // ✅ สร้างไฟล์ Excel และตั้งค่าการจัดรูปแบบ
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // ✅ เพิ่ม sheet ลง workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Disease Report");

      // ✅ บันทึกไฟล์ Excel พร้อมปี พ.ศ.
      const fileName = `จำนวนผู้ป่วยที่ระบุอาการ_${thaiYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);

  } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
  }
}

async function exportAppointmentsOverview() {
    try {
        const selectedYear = document.getElementById("yearFilterAppointments").value || new Date().getFullYear();
        const selectedMonth = document.getElementById("monthFilterAppointments").value || "";
  
        const thaiYear = parseInt(selectedYear) + 543; // แปลง ค.ศ. เป็น พ.ศ.
  
        // ✅ ฟังก์ชันแปลงเดือนเป็นภาษาไทย
        function convertMonthToThai(month) {
            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];
            return thaiMonths[parseInt(month) - 1] || "";
        }
  
        // ✅ ตั้งชื่อไฟล์ให้เหมาะสม
        let fileMonthName = selectedMonth ? `_${convertMonthToThai(selectedMonth)}` : "";
        let fileName = `ภาพรวมการนัดหมาย${fileMonthName}_${thaiYear}.xlsx`;
  
        // ✅ ดึงข้อมูลจาก API
        const response = await axios.post("http://localhost:8000/api/employees/appointmentsOverview", {
            year: selectedYear,
            month: selectedMonth
        });
  
        const data = response.data;
        // console.log(data);
  
        if (!data.success || !data.appointments || data.appointments.length === 0) {
            alert("ไม่มีข้อมูลสำหรับช่วงเวลาที่เลือก");
            return;
        }
  
        // ✅ จัดรูปแบบข้อมูล
        const sheetData = [
            ["", `ภาพรวมการนัดหมาย ปี ${thaiYear}`, ""],  // เปลี่ยนปีให้เป็น พ.ศ.
            ["เดือน", "นัดหมายทั้งหมด", "ยืนยันแล้ว", "ยกเลิก", "ปิดเคส", "รอการยืนยัน"] // หัวตาราง
        ];
  
        let totalAppointments = 0;
        let totalConfirmed = 0;
        let totalCancelled = 0;
        let totalClosedCases = 0;
        let totalPending = 0;
  
        data.appointments.forEach(appointment => {
            let thaiMonth = convertMonthToThai(appointment.month.split("-")[1]); // ✅ ใช้เดือนภาษาไทย
            let monthDisplay = selectedMonth ? thaiMonth : `${thaiMonth} ${thaiYear}`; 
  
            sheetData.push([
                monthDisplay, 
                Number(appointment.total), 
                Number(appointment.confirmed), 
                Number(appointment.cancelled), 
                Number(appointment.closedCaseStatus), 
                Number(appointment.pending)
            ]);
  
            // ✅ รวมค่าทั้งหมด
            totalAppointments += Number(appointment.total);
            totalConfirmed += Number(appointment.confirmed);
            totalCancelled += Number(appointment.cancelled);
            totalClosedCases += Number(appointment.closedCaseStatus);
            totalPending += Number(appointment.pending);
        });
  
        // ✅ เพิ่มแถวสรุปผลรวม
        sheetData.push([
            "รวม", 
            totalAppointments, 
            totalConfirmed, 
            totalCancelled, 
            totalClosedCases, 
            totalPending
        ]);
  
        // ✅ สร้างไฟล์ Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
        // ✅ เพิ่มสไตล์ให้หัวตารางและแถวรวม
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!worksheet[cell_ref]) continue;
  
                worksheet[cell_ref].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                };
  
                if (R === 1 || R === 2) {
                    worksheet[cell_ref].s.fill = { fgColor: { rgb: "FFCC99" } };
                }
  
                if (R === range.e.r) { // ✅ แถวรวม
                    worksheet[cell_ref].s.font = { bold: true };
                }
            }
        }
  
        XLSX.utils.book_append_sheet(workbook, worksheet, "ภาพรวมการนัดหมาย");
  
        XLSX.writeFile(workbook, fileName);
  
    } catch (error) {
        console.error("Error exporting Excel:", error);
        alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
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
    } if (currentPage === "admin_main.html") {


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
