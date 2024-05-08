document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll('.button');
    const choiceContainers = document.querySelectorAll('.choice-container');
    const progressBar = document.querySelector('.progress');
    const totalScoreDisplay = document.getElementById('totalScoreDisplay'); 

    let currentIndex = 0;
    let totalScore = 0; 

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
    
                    currentIndex++;
                } else {
                    // window.location.href='user_main.html';
                    totalScoreDisplay.textContent = "คะแนนรวม: " + totalScore; // แสดงคะแนนรวม
                }
                loadTabs(); 
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
