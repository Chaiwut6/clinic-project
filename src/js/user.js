       document.addEventListener("DOMContentLoaded", function() {
            const urlParams = new URLSearchParams(window.location.search);
            const user_id = urlParams.get('user_id');
 

            const buttons = document.querySelectorAll('.button');
            const choiceContainers = document.querySelectorAll('.choice-container');
            const progressBar = document.querySelector('.progress');
            const totalScoreDisplay = document.getElementById('totalScoreDisplay'); 
            const currentDateDisplay = document.getElementById('currentDateDisplay');

            let currentIndex = 0;
            let totalScore = 0;
            const currentDate = new Date();

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
                            const completedQuestions = document.querySelectorAll('.question:not([style="display: none;"])').length;
                            const progressPercent = (completedQuestions / totalQuestions) * 100;
                            progressBar.style.width = progressPercent + '%';

                            currentIndex++; // Increment currentIndex after each button click
                        } else {
                            let result = ""; // Prepare variable for result text

                            if (totalScore <= 12) {
                                result = "ระดับน้อย";
                                await saveResult(user_id, totalScore, result, currentDate);
                                window.location.href = 'evaluation results/user_low.html';
                            } else if (totalScore >= 13 && totalScore <= 18) {
                                result = "ระดับปานกลาง";
                                await saveResult(user_id, totalScore, result, currentDate);
                                window.location.href = 'user_consult.html';
                            } else if (totalScore > 19) {
                                result = "ระดับรุนแรง";
                                await saveResult(user_id, totalScore, result, currentDate);
                                window.location.href = 'user_consult.html';
                            }

                            console.log("Result:", result); // Debug log
                            // Optionally display the score and result
                            // totalScoreDisplay.textContent = `คะแนนรวม: ${totalScore}, ระดับความรุนแรง: ${result}, วันที่ทำ: ${currentDate.toLocaleDateString()}, เวลา: ${currentDate.toLocaleTimeString()}`;
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

            async function saveResult(user_id, totalScore, result) {
                try {
                    const response = await axios.post('http://localhost:8000/api/save-result', {
                        user_id: user_id,
                        totalScore: totalScore,
                        result: result,
                    });
                    console.log('Success:', response.data);
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });