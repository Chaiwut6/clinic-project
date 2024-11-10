
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
  // ตรวจสอบว่า URL ของหน้าปัจจุบันเป็น user_main.html หรือไม่
  if (window.location.pathname.includes("user_main.html")) {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/userinfo', { withCredentials: true });

        // ตรวจสอบว่า response.data มีข้อมูล
        if (response.data && response.data.user && response.data.Assess) {
          const userInfo = response.data.user;
          const userAssess = response.data.Assess;

          console.log('User Info:', userInfo);
          console.log('User Assessment:', userAssess);

          // ใช้ querySelectorAll สำหรับ class
          const idElements = document.querySelectorAll('.id');
          const fnameElements = document.querySelectorAll('.fname');
          const lnameElements = document.querySelectorAll('.lname');
          const nicknameElements = document.querySelectorAll('.nickname');
          const yearElements = document.querySelectorAll('.year');
          const phoneElements = document.querySelectorAll('.phone');
          const facultyElements = document.querySelectorAll('.faculty');
          const resultElements = document.querySelectorAll('.result');
          const totalScoreElements = document.querySelectorAll('.total_score');
          const dateElements = document.querySelectorAll('.date');

          // แสดงข้อมูลใน HTML สำหรับแต่ละ class
          idElements.forEach(element => element.textContent = userInfo.user_id);
          fnameElements.forEach(element => element.textContent = userInfo.user_fname);
          lnameElements.forEach(element => element.textContent = userInfo.user_lname);
          nicknameElements.forEach(element => element.textContent = userInfo.nickname);
          yearElements.forEach(element => element.textContent = userInfo.year);
          phoneElements.forEach(element => element.textContent = userInfo.phone);
          facultyElements.forEach(element => element.textContent = userInfo.faculty);
          resultElements.forEach(element => element.textContent = userAssess.result);
          totalScoreElements.forEach(element => element.textContent = userAssess.total_score);
          dateElements.forEach(element => element.textContent = userAssess.date);
        } else {
          console.error('Invalid data format received from API');
          // หากข้อมูลไม่ถูกต้องหรือไม่ได้รับข้อมูลที่จำเป็น สามารถทำการรีไดเร็กต์
          window.location.href = '../view/index.html';
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // หากเกิดข้อผิดพลาดในการดึงข้อมูล เช่น ไม่มีการยืนยันตัวตน
        window.location.href = '../view/index.html';  // เปลี่ยนเส้นทางไปที่หน้าเข้าสู่ระบบ
      }
    };

    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเสร็จ
    fetchUserInfo();
  }
});



const Logout= async () => {
  try {
      // เรียก API logout ไปที่เซิร์ฟเวอร์
      await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });

      // แจ้งผู้ใช้ว่าออกจากระบบแล้ว
      // alert('You have been logged out successfully.');
      console.log('You have been logged out successfully.');

      // เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
      // window.location.href = '../view';
  } catch (error) {
      console.error('Logout failed:', error);
      // alert('Logout failed. Please try again.');
  }
}










