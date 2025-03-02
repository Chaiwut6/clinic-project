const baseURL = "http://localhost:8000";
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
    const title = document.querySelector('#title').value;
    const stu_fname = document.querySelector('#stu_fname').value;
    const stu_lname = document.querySelector('#stu_lname').value;
    const nickname = document.querySelector('#nickname').value;
    const phone = document.querySelector('#phone').value;
    const faculty = document.querySelector('#faculty').value;
    const stu_id = document.querySelector('#stu_id').value;
    const profileImage = document.querySelector('#profileImage').files[0];

    const currentYear = new Date().getFullYear() + 543; 
    const admissionYear = parseInt(stu_id.substring(2, 4)); 
    const admissionFullYear = admissionYear + 2500; 
    let studyYear = currentYear - admissionFullYear;
    
    const maxYear = faculty === "สถาปัตยกรรมศาสตร์" ? 5 : 4;
    
    studyYear = Math.min(Math.max(1, studyYear), maxYear);
    
    const year = `ปี ${studyYear}`;

    // console.log(`ปีปัจจุบัน: ${currentYear}, ปีที่เข้า: ${admissionFullYear}, ชั้นปี: ${year}`);

    // Check if all required fields are filled
    if (!title || !stu_fname || !stu_lname || !nickname || !phone || !faculty || !year || !stu_id || !password || !confirm_password) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    // Validate phone number: must be exactly 10 digits and numbers only
    if (!/^\d{10}$/.test(phone)) {
      alert('กรุณากรอกเบอร์โทรที่ถูกต้อง (10 ตัวและเป็นเลขเท่านั้น)');
      document.querySelector('#phone').focus();
      return;
    }

    if (!/^\d{12}-\d{1}$/.test(stu_id)) {
      alert('กรุณากรอกรหัสประจำตัวให้ถูกต้อง เช่น 116510001001-2');
      document.querySelector('#stu_id').focus();
      return;
    }

    // Check if policy is accepted
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


    // Check if stu_id already exists
    const checkUserApiUrl = 'http://localhost:8000/api/students/checkuser';
    const checkResponse = await axios.post(checkUserApiUrl, { stu_id });

    if (!checkResponse.data.success) {
      alert('รหัสนักศึกษานี้มีการลงทะเบียนแล้ว');
      window.location.href = '/view/index.html';
      return;
    }

    let profileImageUrl = "";

    if (profileImage) {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("stu_id", stu_id); //  ใส่ stu_id
 
    
      try {
        const uploadResponse = await axios.post("http://localhost:8000/api/students/upload-profile", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
    
        if (uploadResponse.data.success) {
          profileImageUrl = uploadResponse.data.imageUrl;
        } else {
          alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    }


    // Define the API URL for registration
    const registerApiUrl = 'http://localhost:8000/api/students/register-user';

    // Call the API to register the user
    const response = await axios.post(registerApiUrl, {
      title,
      stu_fname,
      stu_lname,
      nickname,
      phone,
      faculty,
      year,
      stu_id,
      password,
      profile_image: profileImageUrl
    });

    // console.log('API Response:', response.data);

    // Check if the registration was successful
    if (response.data.message === 'User registered successfully') {
      alert('ลงทะเบียนสำเร็จ');

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

// const updateStudyYearAutomatically = async () => {

//   try {
//     const response = await axios.post("http://localhost:8000/api/students/getAllUsers");

//     if (!response.data.success) {
//       console.error(" ไม่สามารถดึงข้อมูลผู้ใช้ได้");
//       return;
//     }

//     const users = response.data.users;
//     const currentYear = new Date().getFullYear() + 543; // แปลงเป็น พ.ศ.
//     let updatedUsers = [];

//     users.forEach(user => {
//       const admissionYear = parseInt(user.stu_id.substring(2, 4));
//       const admissionFullYear = admissionYear + 2500; // แปลงเป็น พ.ศ.
//       const studyYear = Math.max(1, currentYear - admissionFullYear);
//       const newYear = `ปี ${studyYear}`;

//       if (user.year !== newYear) {
//         updatedUsers.push({ stu_id: user.stu_id, year: newYear });
//       }
//     });

//     if (updatedUsers.length > 0) {
//       await axios.post("http://localhost:8000/api/users/updateStudyYear", {
//         users: updatedUsers
//       });
//     } 

//   } catch (error) {
//     console.error(" เกิดข้อผิดพลาดในการอัปเดตชั้นปี:", error);
//   }
// };


const login = async () => {
  const login_id = document.querySelector('input[name=stu_id]').value;
  const password = document.querySelector('input[name=password]').value;


  try {
    if (!login_id) {
      alert('กรุณากรอก ID ผู้ใช้');
      return;
    }

    if (!password) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (login_id) {
      const response_user = await axios.post('http://localhost:8000/api/students/login', {
        login_id,
        password
      }, {
        withCredentials: true
      });

      const responseData = response_user.data;

      // ไม่มีการเก็บ token ใน localStorage
      const userInfo = responseData.user;
      const userAssess = responseData.Assess;


      if (responseData.roles === 'student') {
        const encrypUser = btoa(login_id);
        sessionStorage.setItem('stu_id', encrypUser);
        window.location.href = '/view/users/user_info.html';
      } else if (responseData.roles === 'doctor') {
        window.location.href = '../view/doctor/doc_main.html';
      } else if (responseData.roles === 'employee') {
        window.location.href = '/view/staff/dashboard.html';
      } else if (responseData.roles === 'manager') {
        window.location.href = '../view/manager/man_main.html';
      } else if (responseData.roles === 'admin') {
        window.location.href = '../view/admin/admin_main.html';
      }
    } else {
      alert('กรุณากรอก ID ผู้ใช้');
    }
  } catch (error) {
    console.error('Error:', error);

    if (error.response && error.response.data && error.response.data.message) {
      alert(`เข้าสู่ระบบล้มเหลว: ${error.response.data.message}`);
    } else {
      alert('เกิดข้อผิดพลาด ไม่สามารถเข้าสู่ระบบได้');
    }
    // เปลี่ยนเส้นทางกลับไปหน้า Login
    window.location.href = '/view/index.html';
  }
};


document.addEventListener("DOMContentLoaded", () => {
  const fetchUserInfo = async () => {
    try {
      // ใช้ POST แทน GET ในการดึงข้อมูล
      const response = await axios.post('http://localhost:8000/api/students/userinfo', {}, {
        withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
      });

      if (response.data && response.data.user && response.data.Assess) {
        const userInfo = response.data.user;
        const userAssess = response.data.Assess;

        //  เรียงลำดับวันและเดือน ก่อนแสดงผล
        const sortedAssessments = sortAssessmentsByDate(userAssess);

        populateAssessments(sortedAssessments);
        updatePageData(userInfo, sortedAssessments);

      } else {
        console.error(' Invalid data format received from API');
      }
    } catch (error) {
      console.error(' Error fetching user info:', error);
    }
  };

  //  ฟังก์ชันเรียงลำดับวันที่จากใหม่ไปเก่า
  const sortAssessmentsByDate = (assessments) => {
    return assessments.sort((a, b) => new Date(b.date) - new Date(a.date)); // ✅ เรียงจากวันที่ใหม่ไปเก่า
  };

  //  ฟังก์ชันแสดงผลข้อมูลการประเมิน
  const populateAssessments = (assessments) => {
    const tableBody = document.getElementById("assessmentTableBody");
    if (!tableBody) {
      return;
    }

    //  เคลียร์ข้อมูลเก่า
    tableBody.innerHTML = '';

    assessments.forEach((assessment) => {
      const row = document.createElement("tr");
      const date = formatDateThai(assessment.date);
      const totalScore = assessment.total_score !== undefined ? assessment.total_score : 'N/A';
      const result = assessment.result || 'N/A';

      row.innerHTML = `
          <td class="date">${date}</td>
          <td class="total_score">${totalScore}</td>
          <td class="result">${result}</td>
      `;

      //  เพิ่มแถวในตาราง
      tableBody.appendChild(row);
    });
  };

  //  ฟังก์ชันอัปเดตข้อมูลผู้ใช้บนหน้าเว็บ
  const updatePageData = (userInfo, userAssess) => {
    const updateElements = (selector, value) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => el.textContent = value || 'N/A');
      }
    };

    //  อัปเดตข้อมูลผู้ใช้
    if (userInfo) {
      updateElements('.id', userInfo.stu_id);
      updateElements('.fname', userInfo.stu_fname);
      updateElements('.lname', userInfo.stu_lname);
      updateElements('.nickname', userInfo.nickname);
      updateElements('.year', userInfo.year);
      updateElements('.phone', userInfo.phone);
      updateElements('.faculty', userInfo.faculty);
    } else {
      console.warn(" User info is missing");
    }
  };

  //  ฟังก์ชันแปลงวันที่เป็นภาษาไทย
  const formatDateThai = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  //  เรียก fetchUserInfo เมื่อโหลดหน้าเสร็จ
  if (window.location.pathname !== '/view/index.html') {
    fetchUserInfo();
  }
});


const Logout = async () => {
  try {
    // เรียก API logout ไปที่เซิร์ฟเวอร์
    const response = await axios.post('http://localhost:8000/api/students/logout', {}, { withCredentials: true });

    // ตรวจสอบผลลัพธ์จากการออกจากระบบ
    if (response.data.message === 'ออกจากระบบสำเร็จ') {
      console.log('คุณออกจากระบบเรียบร้อยแล้ว');

      // ลบข้อมูลจาก sessionStorage
      sessionStorage.removeItem('stu_id');
      sessionStorage.removeItem('stu_fname');
      sessionStorage.removeItem('stu_lname');

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
      const response = await axios.post('http://localhost:8000/api/students/change-password', {
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

  //  ฟังก์ชันดึงข้อมูลผู้ใช้จาก API
  const fetchUserInfo = async () => {
      try {
          const response = await axios.post('http://localhost:8000/api/students/userinfo', {}, {
              withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
          });

          if (response.data && response.data.user) {
              const userInfo = response.data.user; 
            
              populateForm(userInfo);

              //  อัปเดตรูปโปรไฟล์ถ้ามี
              if (userInfo.profile_image) {
                  updateProfileImage(userInfo.profile_image);
              }
          } else {
              console.error('ข้อมูลที่ได้รับไม่ถูกต้องจาก API');
          }
      } catch (error) {
          console.error('Error fetching user info:', error);
      }
  };

  //  ฟังก์ชันเติมข้อมูลในฟอร์ม
  const populateForm = (userInfo) => {
      document.getElementById("first-name").value = userInfo.stu_fname || '';
      document.getElementById("last-name").value = userInfo.stu_lname || '';
      document.getElementById("nickname").value = userInfo.nickname || '';
      document.getElementById("faculty").value = userInfo.faculty || '';
      document.getElementById("phone").value = userInfo.phone || '';
  };

  //  ฟังก์ชันอัปเดตรูปโปรไฟล์
  const updateProfileImage = (imagePath) => {
      const profileImg = document.getElementById("user-profile");
      profileImg.src = `http://localhost:8000${imagePath}`;
  };

  //  ฟังก์ชันอัปเดตข้อมูลผู้ใช้
  if (form) {
      form.addEventListener("submit", async (event) => {
          event.preventDefault(); // ป้องกันการโหลดหน้าใหม่

          const encrypUser = sessionStorage.getItem("stu_id");
          const userId = encrypUser ? atob(encrypUser) : null;

          if (!userId) {
              alert("ไม่พบ stu_id กรุณาลองเข้าสู่ระบบใหม่");
              return;
          }

          const updatedData = {
              stu_id: userId, 
              stu_fname: document.getElementById("first-name").value,
              stu_lname: document.getElementById("last-name").value,
              nickname: document.getElementById("nickname").value,
              faculty: document.getElementById("faculty").value,
              phone: document.getElementById("phone").value,
          };

          try {
              const response = await axios.post('http://localhost:8000/api/students/updateuser', updatedData, {
                  withCredentials: true
              });

              if (response.data.success) {
                  alert("ข้อมูลได้รับการอัปเดตเรียบร้อยแล้ว!");
                  fetchUserInfo();
                  location.reload();
              } else {
                  console.error(" Update failed:", response.data.message);
                  alert("ไม่สามารถอัปเดตข้อมูลได้: " + (response.data.message || "ไม่ทราบสาเหตุ"));
              }
          } catch (error) {
              console.error(" Error updating user info:", error);
              alert(' เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message || 'Unknown error'));
          }
      });
  }
  if (window.location.pathname.endsWith('profile.html')) {
      fetchUserInfo();
  }
});

async function uploadProfileImage() {
  const fileInput = document.getElementById("profile-image");
  const encrypUser = sessionStorage.getItem("stu_id");
  const userId = encrypUser ? atob(encrypUser) : null;

  if (!userId) {
      alert("ไม่พบ stu_id กรุณาลองเข้าสู่ระบบใหม่");
      return;
  }

  // console.log("User ID:", userId);

  const formData = new FormData();
  formData.append("stu_id", userId);

  //  ถ้าผู้ใช้ **อัปโหลดรูปใหม่** ให้แนบไฟล์ไปด้วย
  if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      formData.append("profileImage", file);
  } else {
      console.log("ไม่มีไฟล์ใหม่ ใช้รูปเดิม");
  }

  try {
      const response = await axios.post("http://localhost:8000/api/students/upload-profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
      });

      // console.log("Upload Response:", response.data);

      if (response.data.success) {
          alert("อัปโหลดรูปโปรไฟล์สำเร็จ");

          //  ถ้ามีรูปใหม่ ให้เปลี่ยนภาพ
          if (response.data.imageUrl) {
              const profileImg = document.getElementById("user-profile");
              profileImg.src = `http://localhost:8000${response.data.imageUrl}`;
              profileImg.onload = () => URL.revokeObjectURL(profileImg.src);
          }
      } else {
          alert("เกิดข้อผิดพลาดในการอัปโหลด");
      }
  } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
  }
}

const fetchUserProfile = async () => {
  try {
      const response = await axios.post('http://localhost:8000/api/students/userinfo', {}, {
          withCredentials: true 
      });

      if (response.data && response.data.user) {
          const userInfo = response.data.user; 
          // console.log("UserProfile:", userInfo);

          const profileImage = document.getElementById("user-profile");
          // console.log(profileImage);
          
          if (userInfo.profile_image) {
            profileImage.src = `${baseURL}${userInfo.profile_image}`;
        } else {
            profileImage.src = `${baseURL}/uploads/profiles/default.png`;
        }

      } else {
          console.error('Invalid data format received from API');
      }
  } catch (error) {
      console.error('Error fetching user info:', error);
  }
};

//  โหลดข้อมูลเมื่อหน้า `profile.html` โหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("profile.html")) {
    fetchUserProfile();
  }
});













