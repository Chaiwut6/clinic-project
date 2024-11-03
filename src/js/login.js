
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
        alert('Login success');
        window.location.href = '../view/doctor/doc_main.html';
      } else if (responseData.roles === 'employee') {
        alert('Login success');
        window.location.href = '../view/staff/employee_main.html';
      } else if (responseData.roles === 'manager') {
        alert('Login success');
        window.location.href = '../view/manager/man_main.html';
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Login fail');
    window.location.href = '../view/index.html';
  }
};

const fetchUserInfo = async () => {
  try {
      const response = await axios.get('http://localhost:8000/api/userinfo', { withCredentials: true });
      console.log('Response Data:', response.data);

      const userInfo = response.data.user;
      const userAssess = response.data.Assess;

      console.log('User Info:', userInfo);
      console.log('User Assessment:', userAssess);
      
      // แสดงข้อมูลใน HTML
      document.getElementById('userName').textContent = userInfo.name;
      document.getElementById('userEmail').textContent = userInfo.email;
      document.getElementById('userAssess').textContent = userAssess.score;

  } catch (error) {
      console.error('Error fetching user info:', error);
      alert('Session expired. Please log in again.');
      // window.location.href = '../view/index.html';
  }
};









