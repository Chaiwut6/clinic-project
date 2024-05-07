document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll('.button');
    const choiceContainers = document.querySelectorAll('.choice-container');
    const progressBar = document.querySelector('.progress');
    const tabsContainer = document.querySelector('.tabs');
    const tabs = document.querySelectorAll('.tab');

    let currentIndex = 0;
    let totalTabsWidth = 0;
    const desiredTabWidth = 150;

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const currentQuestion = document.querySelector('.question' + (currentIndex + 1));
            const nextQuestion = document.querySelector('.question' + (currentIndex + 2));

            const selectedChoice = currentQuestion.querySelector('.choice-container.selected');

            if (selectedChoice) {
                if (nextQuestion) {
                    currentQuestion.style.display = 'none';
                    nextQuestion.style.display = 'flex';

                    const totalQuestions = document.querySelectorAll('.question').length;
                    const completedQuestions = document.querySelectorAll('.question:not([style="display: none;"])').length;
                    const progressPercent = (completedQuestions / totalQuestions) * 100;
                    progressBar.style.width = progressPercent + '%';

                    currentIndex++;
                } else {
                    window.location.href='user_main.html';
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

            tabs.forEach(tab => {
                tab.classList.remove('active');
            });

            if (tabs[currentIndex]) {
                tabs[currentIndex].classList.add('active');
            }
        });
    });

    window.addEventListener('resize', function() {
        loadTabs();
    });
    
    function loadTabs() {
        const tabs = document.querySelectorAll('.tab');
        const containerWidth = document.querySelector('.tabs').offsetWidth;
        const totalTabsWidth = Array.from(tabs).reduce((acc, tab) => acc + tab.offsetWidth, 0);
    
        if (totalTabsWidth > containerWidth) {
            let accumulatedWidth = 0;
            let loadedTabs = 0;
    
            tabs.forEach(tab => {
                accumulatedWidth += tab.offsetWidth;
                if (accumulatedWidth <= containerWidth) {
                    tab.style.visibility = 'visible'; // แสดงแท็บที่พอดีในขนาดของคอนเทนเนอร์
                    loadedTabs++;
                } else {
                    tab.style.visibility = 'hidden'; 
                }
            });
    
            if (loadedTabs < tabs.length) {
                setTimeout(loadTabs, 500); 
            }
        } else {
            tabs.forEach(tab => tab.style.visibility = 'visible'); // 
        }
    }

    tabs.forEach(tab => {
        tab.style.minWidth = desiredTabWidth + 'px'; // กำหนดความกว้างขั้นต่ำของแท็บ
        totalTabsWidth += desiredTabWidth;
    });

    const containerWidth = tabsContainer.offsetWidth;

    if (totalTabsWidth > containerWidth) {
        const numTabsToShow = Math.floor(containerWidth / desiredTabWidth);
        const numTabsToHide = tabs.length - numTabsToShow;

        for (let i = tabs.length - 1; i >= numTabsToHide; i--) {
            tabs[i].style.display = 'none';
        }
    }
    
});
