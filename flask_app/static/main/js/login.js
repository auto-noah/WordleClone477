// Listen for user submitting login info  
var login_email_textbox = document.getElementById('li-email'); 
login_email_textbox.addEventListener('keydown', (e) => {    // <- 'enter' after typing email
    if (e.keyCode === 13) {
        checkCredentials();
    }
});
var login_password_textbox = document.getElementById('li-password'); 
login_password_textbox.addEventListener('keydown', (e) => { // <- 'enter' after typing password
    if (e.keyCode === 13) {
        checkCredentials();
    }
});
var login_submit_checkbox = document.getElementById('li-submit');
login_submit_checkbox.addEventListener('click', (e) => {    // <- click submit btn
    checkCredentials();
});

// Check user's submission
let count = 0;
let li_fail_text = document.getElementById('login-fail-text');
const checkCredentials = function() {
    // package data in a JSON object
    var data_d = {'email': document.getElementById('li-email').value, 
               'password': document.getElementById('li-password').value};

    // SEND DATA TO SERVER VIA jQuery.ajax({})
    jQuery.ajax({
        url: "/processlogin",
        data: data_d,
        type: "POST",
        success:function(returned_data){
            returned_data = JSON.parse(returned_data);
            if (returned_data['success'] === 1) {
                window.location.href = "/home";
            } else {
                // Update fail text
                count += 1;
                li_fail_text.innerHTML = "Authentication failure: " + count;

                if (count === 1) { // First time failing -> make fail text visible
                    li_fail_text.style.visibility = 'visible';
                }
            }
        }
    });
};

// Listen for user clicking sign up button
var su_button = document.getElementById('su-button');
su_button.addEventListener('click', (e) => {
    // Take user to sign up page
    window.location.href = '/signup';
});