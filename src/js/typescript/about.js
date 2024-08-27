"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function bodyLoad() {
    displayUserDetails();
}
function displayUserDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        let username = localStorage.getItem("username");
        const response = yield fetch(`http://localhost:3000/expenses?username=${username}`);
        const data = yield response.json();
        const emailResponse = yield fetch(`http://localhost:3000/usersLogin?username=${username}`);
        const emailData = yield emailResponse.json();
        console.log(emailData[0].email);
        if (data && data.length > 0) {
            document.getElementById('username').textContent = `Welcome! ${username}`;
            document.getElementById('user-username').textContent = username.toUpperCase();
            document.getElementById('user-email').textContent = emailData[0].email;
            document.getElementById('user-budget').textContent = data[0]['totalBudget'].toFixed(2);
        }
        else {
            document.querySelector('.user-card').innerHTML = '<p>No user logged in</p>';
        }
    });
}
