
var inputs = document.querySelectorAll('input');
inputs.forEach(function (input) {
  input.addEventListener('invalid', function (event) {
    event.target.setCustomValidity('กรุณากรอกข้อมูล');
  });

  input.addEventListener('input', function (event) {
    event.target.setCustomValidity('');
  });
});

function registerToggle() {
  var container = document.querySelector('.container');
  container.classList.toggle('active');
  var popup = document.querySelector('.register-form');
  popup.classList.toggle('active');
}
function loginToggle() {
  var container = document.querySelector('.container');
  container.classList.toggle('active');
  var popup = document.querySelector('.login-form');
  popup.classList.toggle('active');
}
function policyToggle() {
  var container = document.querySelector('.container');
  container.classList.toggle('active');
  var popup = document.querySelector('.policy-form');
  popup.classList.toggle('active');
}
function toggleLink() {
  const checkbox = document.getElementById('checkbox');
  const policyLink = document.getElementById('policy-link');
  if (checkbox.checked) {
    policyLink.style.pointerEvents = 'auto';
  } else {
    policyLink.style.pointerEvents = 'none';
  }
}

const register = async () => {
  try {
    // Collect form data
    const password = document.querySelector('#password').value;
    const confirm_password = document.querySelector('#confirm_password').value;
    const policyCheckbox = document.querySelector('#policy_checkbox');

    // Validate the terms of service checkbox
    if (!policyCheckbox.checked) {
      alert('กรุณายอมรับนโยบายความเป็นส่วนตัว');
      return;
    }

    // Validate passwords match
    if (password !== confirm_password) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      document.querySelector('#password').value = '';
      document.querySelector('#confirm_password').value = '';
      return;
    }

    // Check if password is provided
    if (!password || password.length === 0) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    // Collect other form data
    const user_fname = document.querySelector('#user_fname').value;
    const user_lname = document.querySelector('#user_lname').value;
    const nickname = document.querySelector('#nickname').value;
    const phone = document.querySelector('#phone').value;
    const faculty = document.querySelector('#faculty').value;
    const year = document.querySelector('#year').value;
    const user_id = document.querySelector('#user_id').value;

    // Call the API to register the user
    const response = await axios.post('http://localhost:8000/api/register-user', {
      user_fname,
      user_lname,
      nickname,
      phone,
      faculty,
      year,
      user_id,
      password
    });

    // Check if the registration was successful
    if (response.data.message === 'User registered successfully') {
      alert('ลงทะเบียนสำเร็จ');

      // Store user data in sessionStorage (optional)
      sessionStorage.setItem('user_id', user_id);
      sessionStorage.setItem('user_fname', user_fname);
      sessionStorage.setItem('user_lname', user_lname);

      // Store the token in cookies
      const token = response.data.token;
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1); // Token expiration time (1 hour)

      document.cookie = `token=${token};expires=${expirationDate.toUTCString()};path=/;secure;SameSite=Strict`;

      // Redirect to the main test page
      window.location.href = `../view/users/user_testmain.html`;
    } else {
      // Handle the case where registration was unsuccessful
      alert('มีข้อผิดพลาดในการลงทะเบียน');
      window.location.href = '/view/index.html';
    }
  } catch (error) {
    // Handle any other errors (e.g., network issues, server issues)
    console.error('Error:', error);
    alert('มีข้อผิดพลาดในการลงทะเบียน');
    window.location.href = '/view/index.html';
  }
};



const login = async () => {
  const login_id = document.querySelector('input[name=user_id]').value;
  const password = document.querySelector('input[name=password]').value;
  try {
    if (login_id) {
      const response_user = await axios.post('http://localhost:8000/api/login', {
        login_id, password
      }, {
        withCredentials: true // รวมคุกกี้ไปในคำร้องขอ
      });

      const responseData = response_user.data;
      console.log(responseData);

      // ไม่มีการเก็บ token ใน localStorage
      const userInfo = responseData.user;
      const userAssess = responseData.Assess; 
      console.log(userAssess);
      console.log(userInfo);

      // เปลี่ยนเส้นทางตามบทบาทผู้ใช้
      if (responseData.roles === 'user') {
        window.location.href = '../view/users/user_main.html';
      } else if (responseData.roles === 'doctor') {
        // alert('Login success');
        window.location.href = '../view/doctor/doc_main.html';
      } else if (responseData.roles === 'employee') {
        // alert('Login success');
        window.location.href = '../view/staff/employee_main.html';
      } else if (responseData.roles === 'manager') {
        // alert('Login success');
        window.location.href = '../view/manager/man_main.html';
      }
    }
  } catch (error) {
    console.error('Error:', error);
    // alert('Login fail');
    window.location.href = '/view/index.html';
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const fetchUserInfo = async () => {
    try {
      // ใช้ POST แทน GET ในการดึงข้อมูล
      const response = await axios.post('http://localhost:8000/api/userinfo', {}, {
        withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
      });

      if (response.data && response.data.user && response.data.Assess) {
        const userInfo = response.data.user;
        const userAssess = response.data.Assess;
        console.log("userInfo:", userInfo);
        console.log("userAssess:", userAssess);
        // แสดงข้อมูลบนหน้า
        updatePageData(userInfo, userAssess);
      } else {
        console.error('Invalid data format received from API');
        window.location.href = '/view/index.html'; // ถ้าไม่มีข้อมูลที่ถูกต้อง ให้กลับไปหน้าอื่น
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      window.location.href = '/view/index.html'; // ถ้ามีข้อผิดพลาดในการดึงข้อมูล ให้ไปหน้าอื่น
    }
  };

  const updatePageData = (userInfo, userAssess) => {
    const updateElements = (selector, value) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => el.textContent = value || 'N/A');
      }
    };

    // อัปเดตข้อมูลในหน้า HTML
    updateElements('.id', userInfo.user_id);
    updateElements('.fname', userInfo.user_fname);
    updateElements('.lname', userInfo.user_lname);
    updateElements('.nickname', userInfo.nickname);
    updateElements('.year', userInfo.year);
    updateElements('.phone', userInfo.phone);
    updateElements('.faculty', userInfo.faculty);
    updateElements('.result', userAssess?.result);
    updateElements('.total_score', userAssess?.total_score);

    // แปลงวันที่และอัปเดตในหน้า
    const formattedDate = formatDate(userAssess?.date);
    updateElements('.date', formattedDate);
  };

  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // ตรวจสอบว่า dateString มีข้อมูลหรือไม่
    const date = new Date(dateString); // แปลงเป็น Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน
    const day = String(date.getDate()).padStart(2, '0'); // วัน
    return `${year}-${month}-${day}`; // คืนค่าเป็นรูปแบบ YYYY-MM-DD
  };

  // เรียก fetchUserInfo เมื่อโหลดหน้าเสร็จ
  if (window.location.pathname !== '/view/index.html') {
    fetchUserInfo();
  }
});




const Logout = async () => {
  try {
    // เรียก API logout ไปที่เซิร์ฟเวอร์
    const response = await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });

    // ตรวจสอบผลลัพธ์จากการออกจากระบบ
    if (response.data.message === 'ออกจากระบบสำเร็จ') {
      console.log('คุณออกจากระบบเรียบร้อยแล้ว');

      // ลบข้อมูลจาก sessionStorage
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('user_fname');
      sessionStorage.removeItem('user_lname');
      
      // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
      // window.location.href = '../view/index.html'; // หรือหน้าอื่นที่คุณต้องการ
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
      const response = await axios.post('http://localhost:8000/api/change-password', {
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileForm");

  // ฟังก์ชันดึงข้อมูลเก่า (ใช้ POST แทน GET)
  const fetchUserInfo = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/userinfo', {}, { withCredentials: true });
      if (response.data && response.data.user) {
        const userInfo = response.data.user;
        populateForm(userInfo); // เติมข้อมูลลงในฟอร์ม
      } else {
        console.error("Invalid user data");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // ฟังก์ชันเติมข้อมูลในฟอร์ม
  const populateForm = (userInfo) => {
    document.getElementById("student-id").value = userInfo.user_id || '';
    document.getElementById("first-name").value = userInfo.user_fname || '';
    document.getElementById("last-name").value = userInfo.user_lname || '';
    document.getElementById("nickname").value = userInfo.nickname || '';
    document.getElementById("faculty").value = userInfo.faculty || '';
    document.getElementById("year").value = userInfo.year || '';
    document.getElementById("phone").value = userInfo.phone || '';
  };

  // ฟังก์ชันบันทึกข้อมูลใหม่
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // ป้องกันการโหลดหน้าใหม่
      const updatedData = {
        user_id: document.getElementById("student-id").value,
        user_fname: document.getElementById("first-name").value,
        user_lname: document.getElementById("last-name").value,
        nickname: document.getElementById("nickname").value,
        faculty: document.getElementById("faculty").value,
        year: document.getElementById("year").value,
        phone: document.getElementById("phone").value,
      };

      console.log(updatedData);

      try {
        const response = await axios.post('http://localhost:8000/api/updateuser', updatedData, { withCredentials: true });
        if (response.data.success) {
          alert("ข้อมูลได้รับการอัปเดตเรียบร้อยแล้ว!");
          fetchUserInfo(); 
          window.location.reload();
        } else {
          console.error("Update failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error updating user info:", error);
        alert('Error: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
    });
  }

  // เรียกข้อมูลเก่าเมื่อหน้าโหลดเสร็จ
  if (window.location.pathname.endsWith('profile.html')) {
    fetchUserInfo();
  }
});











