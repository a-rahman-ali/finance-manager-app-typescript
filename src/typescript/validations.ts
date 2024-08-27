function validateEmail(): void {
    let email: HTMLInputElement | null = document.getElementById('email') as HTMLInputElement;
    let emailMsg: HTMLElement | null = document.getElementById('emailmsg');

    let emailRegex: RegExp = /^[a-zA-Z\d.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,8}$/;

    if (email.value === "") {
        emailMsg!.innerHTML = "email field is required";
        emailMsg!.style.color = "red";
    } else if (!email.value.match(emailRegex)) {
        emailMsg!.innerHTML = "Enter valid email";
    } else {
        emailMsg!.innerHTML = "";
    }
}

function validatePassword(): void {
    let pwd: HTMLInputElement | null = document.getElementById('password') as HTMLInputElement;
    let pwdMsg: HTMLElement | null = document.getElementById('pwdmsg');

    if (pwd.value === "") {
        pwdMsg!.innerHTML = "password field is required";
        pwdMsg!.style.color = "red";
    } else if (pwd.value.length < 8) {
        pwdMsg!.innerHTML = "password must be at least 8 characters";
        pwdMsg!.style.color = "red";
    } else {
        pwdMsg!.innerHTML = "";
    }
}

function validateUsername(): void {
    let username: HTMLInputElement | null = document.getElementById('username') as HTMLInputElement;
    let usernameMsg: HTMLElement | null = document.getElementById('usernamemsg');

    if (username.value === "") {
        usernameMsg!.innerHTML = "username field is required";
        usernameMsg!.style.color = "red";
    } else if (username.value.length < 4) {
        usernameMsg!.innerHTML = "username must be at least 4 characters";
        usernameMsg!.style.color = "red";
    } else {
        usernameMsg!.innerHTML = "";
    }
}
