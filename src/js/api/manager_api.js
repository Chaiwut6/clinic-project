document.addEventListener("DOMContentLoaded", () => {
    const fetchManagerInfo = async () => {
        try {
            const response = await axios.post("http://localhost:8000/api/manager/managerinfo", {}, {
                withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
            });

            if (response.data && response.data.manager) {
                const managerInfo = response.data.manager;
                // console.log("Manager Info:", managerInfo);
                const encrypManager = btoa(managerInfo.man_id)
                sessionStorage.setItem('managerID', encrypManager || '');

                // แสดงข้อมูลบนหน้า
                updatePageData(managerInfo);
            } else {
                console.error('Invalid data format received from API');
            }
        } catch (error) {
            console.error('Error fetching manager info:', error);
        }
    };

    const updatePageData = (managerInfo) => {
        const updateElements = (selector, value) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => el.textContent = value || 'N/A');
            }
        };

        if (managerInfo) {
            updateElements('.manager_id', managerInfo.man_id);
            updateElements('.man_fname', managerInfo.man_fname);
            updateElements('.man_lname', managerInfo.man_lname);
        } else {
            console.warn("Manager info is missing");
        }
    };

    // เรียก fetchManagerInfo เมื่อโหลดหน้าเสร็จ
    if (window.location.pathname !== '/view/index.html') {
        fetchManagerInfo();
    }
});

const Logout = async () => {
    try {
      // เรียก API logout ไปที่เซิร์ฟเวอร์
      const response = await axios.post('http://localhost:8000/api/users/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('managerID');
      if (response.data.message === 'ออกจากระบบสำเร็จ') {
        console.log('คุณออกจากระบบเรียบร้อยแล้ว');
  
        // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
        window.location.href = '/view/index.html'; // 
        // หรือหน้าอื่นที่คุณต้องการ
      } else {
        console.error('การออกจากระบบล้มเหลว');
      }
    } catch (error) {
      console.error('Logout failed:', error);
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
        const response = await axios.post('http://localhost:8000/api/manager/change-password', {
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