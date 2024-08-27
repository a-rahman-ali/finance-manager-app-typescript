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
Object.defineProperty(exports, "__esModule", { value: true });
const apiUrl = "http://localhost:3000";
function login(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        const response = yield fetch(`${apiUrl}/usersLogin?email=${email}&password=${password}`);
        // Pending: Adjust the type interface for users
        const users = yield response.json();
        if (users.length > 0) {
            const username = users[0].username;
            console.log("User logged in:", username);
            localStorage.setItem("username", username);
            console.log("Login successful!");
            location.href = "dashboard.html";
        }
        else {
            console.log("Invalid credentials");
            alert("Invalid credentials, please try again.");
        }
    });
}
function logout() {
    localStorage.removeItem("username");
    localStorage.clear();
    location.href = "index.html";
}
