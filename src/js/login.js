
var inputs = document.querySelectorAll('input');
        inputs.forEach(function(input) {
            input.addEventListener('invalid', function(event) {
                event.target.setCustomValidity('กรุณากรอกข้อมูล');
            });
    
            input.addEventListener('input', function(event) {
                event.target.setCustomValidity('');
            });
        });

        function registerToggle(){
            var container = document.querySelector('.container');
            container.classList.toggle('active');
            var popup = document.querySelector('.register-form');
            popup.classList.toggle('active');
        }
        function loginToggle(){
            var container = document.querySelector('.container');
            container.classList.toggle('active');
            var popup = document.querySelector('.login-form');
            popup.classList.toggle('active');
        }
        function policyToggle(){
            var container = document.querySelector('.container');
            container.classList.toggle('active');
            var popup = document.querySelector('.policy-form');
            popup.classList.toggle('active');
        }

        const register = async () => {
          try {
            const password = document.querySelector('#password').value;
            const confirm_password = document.querySelector('#confirm_password').value;
        
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
              window.location.href = '../view/users/user_testmain.html';
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
                login_id, password});
              const responseData = response_user.data; 
              console.log(responseData.roles); 
              if (responseData.roles === 'user') {
                localStorage.setItem('token', responseData.token);
                alert('Login success');
                window.location.href = '../view/users/user_main.html';
              }else if (responseData.roles === 'doctor'){
                localStorage.setItem('token', responseData.token);
                alert('Login success');
                window.location.href = '../view/doctor/doc_main.html';
              }else if (responseData.roles === 'employee'){
                localStorage.setItem('token', responseData.token);
                alert('Login success');
                window.location.href = '../view/staff/employee_main.html';
              }else if (responseData.roles === 'manager'){
                localStorage.setItem('token', responseData.token);
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
        


        
        
         
          

