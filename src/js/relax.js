document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn button');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const currentContainer = document.querySelector('.container.active');
            if (currentContainer) {
                currentContainer.classList.remove('active');
                const nextContainer = currentContainer.nextElementSibling;
                if (nextContainer && nextContainer.classList.contains('container')) {
                    nextContainer.classList.add('active');
                } else {
                    window.location.href = '/view/users/user_main.html'; 
                }
            }
        });
    });
});