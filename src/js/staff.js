document.addEventListener('DOMContentLoaded', () => {
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const addDoctorModal = document.getElementById('addDoctorModal');
    const closeBtn = document.querySelector('#addDoctorModal .close');

    // Open the modal when "เพิ่มแพทย์" button is clicked
    addDoctorBtn.addEventListener('click', () => {
        addDoctorModal.style.display = 'block'; // Show the modal
    });

    // Close the modal when "X" button is clicked
    closeBtn.addEventListener('click', () => {
        addDoctorModal.style.display = 'none'; // Hide the modal
    });

    // Close the modal if the user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === addDoctorModal) {
            addDoctorModal.style.display = 'none'; // Hide the modal
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Get all dropdown buttons
    const dropdownButtons = document.querySelectorAll('.actionBtn');

    dropdownButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent clicks from bubbling up
            const dropdown = button.closest('.dropdown-doctor');
            dropdown.classList.toggle('show'); // Toggle the dropdown menu
        });
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', () => {
        const dropdowns = document.querySelectorAll('.dropdown-doctor');
        dropdowns.forEach((dropdown) => dropdown.classList.remove('show'));
    });
});
