document.addEventListener("DOMContentLoaded", function() {
    const user_id = sessionStorage.getItem('user_id');
    const user_fname = sessionStorage.getItem('user_fname');
    const user_lname = sessionStorage.getItem('user_lname');

    const buttons = document.querySelectorAll('.button');
    const choiceContainers = document.querySelectorAll('.choice-container');
    const progressBar = document.querySelector('.progress');
    const totalScoreDisplay = document.getElementById('totalScoreDisplay'); 
    const currentDateDisplay = document.getElementById('currentDateDisplay');

    let currentIndex = 0;
    let totalScore = 0;
    const currentDate = new Date();

    // Update current date display if needed
    if (currentDateDisplay) {
        currentDateDisplay.textContent = `Date: ${currentDate.toLocaleDateString()}, Time: ${currentDate.toLocaleTimeString()}`;
    }

    buttons.forEach((button, index) => {
        button.addEventListener('click', async () => {
            const currentQuestion = document.querySelector('.question' + (currentIndex + 1));
            const nextQuestion = document.querySelector('.question' + (currentIndex + 2));
            const selectedChoice = currentQuestion.querySelector('.choice-container.selected .choice-text');

            if (selectedChoice) {
                const choiceValue = Number(selectedChoice.dataset.number);
                totalScore += choiceValue;
                console.log("Selected choice value:", choiceValue); // Debug log
                console.log("Total score:", totalScore); // Debug log

                if (nextQuestion) {
                    currentQuestion.style.display = 'none';
                    nextQuestion.style.display = 'flex';

                    const totalQuestions = document.querySelectorAll('.question').length;
                    const completedQuestions = currentIndex + 1;
                    const progressPercent = (completedQuestions / totalQuestions) * 100;
                    progressBar.style.width = progressPercent + '%';

                    currentIndex++; // Increment currentIndex after each button click
                } else {
                    let result = ""; // Prepare variable for result text

                    if (totalScore <= 12) {
                        result = "ระดับน้อย";
                        await saveResult(user_id, totalScore, result,user_fname,user_lname);
                        window.location.href = 'evaluation results/user_low.html';
                    } else if (totalScore >= 13 && totalScore <= 18) {
                        result = "ระดับปานกลาง";
                        await saveResult(user_id, totalScore, result,user_fname,user_lname);
                        window.location.href = 'user_consult.html';
                    } else if (totalScore > 18) {
                        result = "ระดับรุนแรง";
                        await saveResult(user_id, totalScore, result,user_fname,user_lname);
                        window.location.href = 'user_consult.html';
                    }

                    console.log("Result:", result); // Debug log
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

    async function saveResult(user_id,totalScore,result,user_fname,user_lname) {
        try {
            const response = await axios.post('http://localhost:8000/api/save-result', {
                user_id: user_id,
                totalScore: totalScore,
                result: result,
                user_fname:user_fname,
                user_lname:user_lname,
            });
            console.log('Success:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
