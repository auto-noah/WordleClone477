// Listen for logout button click
const logout_btn = document.getElementById('logout-btn');
logout_btn.addEventListener('click', (e) => {
    // Change to home page
    window.location.href = '/logout';
});