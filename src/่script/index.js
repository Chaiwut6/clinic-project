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

const login = () => {
    const user_id = document.querySelector('input[name=user_id]').value
    const password = document.querySelector('input[name=password]').value
    console.log(user_id,password)
}            