document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll('.button');
    const choiceContainers = document.querySelectorAll('.choice-container');
    const progressBar = document.querySelector('.progress');
    const totalScoreDisplay = document.getElementById('totalScoreDisplay'); 
    const currentDateDisplay = document.getElementById('currentDateDisplay'); // เพิ่มตัวแปรสำหรับแสดงวันที่
    
    let currentIndex = 0;
    let totalScore = 0; 
    let currentDate = new Date(); // เพิ่มตัวแปรสำหรับเก็บวันที่และเวลาปัจจุบัน
    
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const currentQuestion = document.querySelector('.question' + (currentIndex + 1));
            const nextQuestion = document.querySelector('.question' + (currentIndex + 2));
    
            const selectedChoice = currentQuestion.querySelector('.choice-container.selected .choice-text');
    
            if (selectedChoice) {
                totalScore += Number(selectedChoice.dataset.number);
    
                if (nextQuestion) {
                    currentQuestion.style.display = 'none';
                    nextQuestion.style.display = 'flex';
    
                    const totalQuestions = document.querySelectorAll('.question').length;
                    const completedQuestions = document.querySelectorAll('.question:not([style="display: none;"])').length;
                    const progressPercent = (completedQuestions / totalQuestions) * 100;
                    progressBar.style.width = progressPercent + '%';
    
                    currentIndex++; // เพิ่มค่า currentIndex ทุกครั้งที่คลิกปุ่ม "ต่อไป"
                } else {
                    let result = ""; // เตรียมตัวแปรสำหรับเก็บข้อความผลลัพธ์
                    // ตรวจสอบระดับคะแนนและกำหนดข้อความผลลัพธ์ตามเงื่อนไข
                    if (totalScore >= 7 && totalScore <= 12) {
                        result = "ระดับน้อย";
                    } else if (totalScore >= 13 && totalScore <= 18) {
                        result = "ระดับปานกลาง";
                    } else {
                        result = "ระดับรุนแรง";
                    }
                    // แสดงคะแนนรวมและผลลัพธ์
                    totalScoreDisplay.textContent = "คะแนนรวม: " + totalScore + ", ระดับความรุนแรง: " + result + ", วันที่ทำ: " + currentDate.toLocaleDateString() + ", เวลา: " + currentDate.toLocaleTimeString();
                    // window.location.href='user_main.html';
                }
            } else {
                alert("โปรดเลือกคำตอบก่อนดำเนินการต่อ");
            }
        });
    });
    
    choiceContainers.forEach(container => {
        container.addEventListener('click', () => {
            const choices = container.parentElement.querySelectorAll('.choice-container');
            choices.forEach(choice => {
                choice.classList.remove('selected');
            });
            container.classList.add('selected');
        });
    });

});
