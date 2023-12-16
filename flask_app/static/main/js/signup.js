// Listen for user submitting sign up info
var su_password_textbox = document.getElementById('su-password'); 
su_password_textbox.addEventListener('keydown', (e) => { // <- 'enter' after typing password
    if (e.keyCode === 13) {
        makeCredentials();
    }
});
var su_submit_checkbox = document.getElementById('su-submit');
su_submit_checkbox.addEventListener('click', (e) => { // <- click submit btn
    makeCredentials();
});

// Listen for user clicking login button
var li_button = document.getElementById('li-button');
li_button.addEventListener('click', (e) => {
    // Take user to sign up page
    window.location.href = '/login';
});

// Make new user account
let su_fail_text = document.getElementById('signup-fail-text');
const makeCredentials = function() {
    // package data in a JSON object
    var data_d = {'email': document.getElementById('su-email').value, 
               'password': document.getElementById('su-password').value};

    // SEND DATA TO SERVER VIA jQuery.ajax({})
    jQuery.ajax({
        url: "/processsignup",
        data: data_d,
        type: "POST",
        success:function(returned_data){
            console.log(returned_data)
            // returned_data = JSON.parse(returned_data);
            if (returned_data['success'] === 1) { // Successfully made account
                // Go to game
                window.location.href = '/home';
            } else {                              // User already owns account
                // Update fail text
                su_fail_text.innerHTML = "Email/Password already in use, please use login page.";
                su_fail_text.style.visibility = 'visible';
                li_button.style.visibility = 'visible';
            }
        }
    });
};