const apiUrl = 'http://localhost:8000'; 

document.addEventListener("DOMContentLoaded", async function () {
    // const stu_id = sessionStorage.getItem('stu_id');
    try {
        // ดึงข้อมูลผู้ใช้จาก API
        const response = await axios.post(`${apiUrl}/api/students/userinfo`, {}, {
            withCredentials: true // ใช้ส่ง cookies (ถ้ามี)
        });

        const stu_id = response.data.user.stu_id;
        const stu_fname = response.data.user.stu_fname;
        const stu_lname = response.data.user.stu_lname;
        const buttons = document.querySelectorAll('.button');
        const choiceContainers = document.querySelectorAll('.choice-container');
        const progressBar = document.querySelector('.progress');
        const totalScoreDisplay = document.getElementById('totalScoreDisplay');
        const currentDateDisplay = document.getElementById('currentDateDisplay');

        let currentIndex = 0;
        let totalScore = 0;
        const currentDate = new Date();
        let isSubmitting = false; // ตัวแปรป้องกันการกดปุ่มซ้ำ

        // แสดงวันที่และเวลาในปัจจุบัน
        if (currentDateDisplay) {
            currentDateDisplay.textContent = `Date: ${currentDate.toLocaleDateString()}, Time: ${currentDate.toLocaleTimeString()}`;
        }

        buttons.forEach((button, index) => {
            button.addEventListener('click', async () => {
                if (isSubmitting) return; // ป้องกันการกดปุ่มซ้ำ
                isSubmitting = true;

                const currentQuestion = document.querySelector('.question' + (currentIndex + 1));
                const nextQuestion = document.querySelector('.question' + (currentIndex + 2));
                const selectedChoice = currentQuestion.querySelector('.choice-container.selected .choice-text');

                if (selectedChoice) {
                    const choiceValue = Number(selectedChoice.dataset.number);
                    totalScore += choiceValue;

                    if (nextQuestion) {
                        // ซ่อนคำถามปัจจุบันและแสดงคำถามถัดไป
                        currentQuestion.style.display = 'none';
                        nextQuestion.style.display = 'flex';

                        // อัปเดต Progress Bar
                        const totalQuestions = document.querySelectorAll('.question').length;
                        const completedQuestions = currentIndex + 1;
                        const progressPercent = (completedQuestions / totalQuestions) * 100;
                        progressBar.style.width = progressPercent + '%';

                        currentIndex++; // เพิ่มดัชนีคำถาม
                        isSubmitting = false; // ปลดล็อคปุ่ม
                    } else {
                        // คำนวณผลลัพธ์สุดท้ายและบันทึก
                        let result = "";

                        if (totalScore <= 12) {
                            result = "ระดับน้อย";
                            const success = await saveResult(stu_id, totalScore, result, stu_fname, stu_lname);
                            if (success) window.location.href = 'evaluation results/user_low.html';
                        } else if (totalScore >= 13 && totalScore <= 18) {
                            result = "ระดับปานกลาง";
                            const success = await saveResult(stu_id, totalScore, result, stu_fname, stu_lname);
                            if (success) window.location.href = 'user_consult.html';
                        } else if (totalScore > 18) {
                            result = "ระดับรุนแรง";
                            const success = await saveResult(stu_id, totalScore, result, stu_fname, stu_lname);
                            if (success) window.location.href = 'user_consult.html';
                        }

                        isSubmitting = false; // ปลดล็อคปุ่ม
                    }
                } else {
                    alert("โปรดเลือกคำตอบก่อนดำเนินการต่อ");
                    isSubmitting = false; // ปลดล็อคปุ่ม
                }
            });
        });

        choiceContainers.forEach(container => {
            container.addEventListener('click', () => {
                const choices = container.parentElement.querySelectorAll('.choice-container');
                choices.forEach(choice => choice.classList.remove('selected'));
                container.classList.add('selected');
            });
        });

        async function saveResult(stu_id, totalScore, result, stu_fname, stu_lname) {
            const timestamp = Date.now().toString(); // เวลาปัจจุบันในรูปแบบ timestamp
            const reversedTimestamp = timestamp.split("").reverse().join(""); // สลับตัวเลข
            const resultId = `R${stu_id.slice(-2)}${reversedTimestamp.slice(0, 7)}`; // ใช้ 2 ตัวท้ายของ stu_id และ 7 ตัวแรกของ timestamp ที่สลับ
        
            try {
                const response = await axios.post("http://localhost:8000/api/students/save-result", {
                    result_id: resultId, // ส่ง result_id ไปด้วย
                    stu_id: stu_id,
                    totalScore: totalScore,
                    result: result,
                    stu_fname: stu_fname,
                    stu_lname: stu_lname,
                });
                // console.log('Success:', response.data);
                return true; // ส่งคืนค่า true หากบันทึกสำเร็จ
            } catch (error) {
                console.error('Error:', error);
                alert("การบันทึกข้อมูลล้มเหลว โปรดลองอีกครั้ง");
                return false; // ส่งคืนค่า false หากเกิดข้อผิดพลาด
            }
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
    }
});
