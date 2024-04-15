let passwordField = document.getElementById("password");
let passwordError = document.getElementById("error-msg");
let passwordConfirmField = document.getElementById("passwordConf");
let form = document.getElementById("form-register");

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (passwordField.value !== passwordConfirmField.value) {
        passwordError.style.display = "block";
         
    } else {
        passwordError.style.display = "none";
        form.submit();
    }
});


