
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
    const password = document.querySelector('#password').value;
    const confirm_password = document.querySelector('#confirm_password').value;
    const policyCheckbox = document.querySelector('#policy_checkbox');

    if (!policyCheckbox.checked) {
      alert('กรุณายอมรับนโยบายความเป็นส่วนตัว');
      return;
    }

    if (password !== confirm_password) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      document.querySelector('#password').value = '';
      document.querySelector('#confirm_password').value = '';
      return;
    }

    if (!password || password.length === 0) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    const user_fname = document.querySelector('#user_fname').value;
    const user_lname = document.querySelector('#user_lname').value;
    const nickname = document.querySelector('#nickname').value;
    const phone = document.querySelector('#phone').value;
    const faculty = document.querySelector('#faculty').value;
    const year = document.querySelector('#year').value;
    const user_id = document.querySelector('#user_id').value;

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
    if (response.data.message === 'insert OK') {
      alert('ลงทะเบียนสำเร็จ');
      sessionStorage.setItem('user_id', user_id);
      sessionStorage.setItem('user_fname', user_fname);
      sessionStorage.setItem('user_lname', user_lname);
      window.location.href = `../view/users/user_testmain.html`;

    } else {
      alert('มีข้อผิดพลาดในการลงทะเบียน');
      window.location.href = '../view/index.html';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('มีข้อผิดพลาดในการลงทะเบียน');
    window.location.href = '../view/index.html';
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
    window.location.href = '../view/index.html';
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/userinfo', { withCredentials: true });

      if (response.data && response.data.user && response.data.Assess) {
        const userInfo = response.data.user;
        const userAssess = response.data.Assess;
        console.log(userInfo);
        console.log(userAssess);
        // แสดงข้อมูลบนหน้า
        updatePageData(userInfo, userAssess);
      } else {
        console.error('Invalid data format received from API');
        window.location.href = '../view/index.html';
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      window.location.href = '../view/index.html';
    }
  };

  const updatePageData = (userInfo, userAssess) => {
    const updateElements = (selector, value) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => el.textContent = value || 'N/A');
      }
    };

    updateElements('.id', userInfo.user_id);
    updateElements('.fname', userInfo.user_fname);
    updateElements('.lname', userInfo.user_lname);
    updateElements('.nickname', userInfo.nickname);
    updateElements('.year', userInfo.year);
    updateElements('.phone', userInfo.phone);
    updateElements('.faculty', userInfo.faculty);
    updateElements('.result', userAssess.result);
    updateElements('.total_score', userAssess.total_score);
    updateElements('.date', userAssess.date);
  };

  // เรียกใช้ fetchUserInfo เมื่อหน้าโหลดเสร็จ
  if (window.location.pathname !== '/view/index.html'){
    fetchUserInfo();
  }

});


const Logout= async () => {
  try {
      // เรียก API logout ไปที่เซิร์ฟเวอร์
      await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });

      // แจ้งผู้ใช้ว่าออกจากระบบแล้ว
      // alert('You have been logged out successfully.');
      console.log('คุณออกจากระบบเรียบร้อยแล้ว');

      // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
      // window.location.href = '../view';
  } catch (error) {
      console.error('Logout failed:', error);
      // alert('Logout failed. Please try again.');
  }
}

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

  // ฟังก์ชันดึงข้อมูลเก่า
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/userinfo', { withCredentials: true });
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
          window.location.reload()
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










