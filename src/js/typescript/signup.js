"use strict";
// const apiUrl: string = "http://localhost:3000";
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
function signup(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const usernameInput = document.querySelector("#username");
        const emailInput = document.querySelector("#email");
        const passwordInput = document.querySelector("#password");
        if (!usernameInput || !emailInput || !passwordInput) {
            alert("Please fill in all fields.");
            return;
        }
        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            const checkResponse = yield fetch(`${apiUrl}/usersLogin?email=${email}`);
            const existingUsers = yield checkResponse.json();
            const userexists = document.getElementById("existsmessage");
            if (existingUsers.length > 0) {
                userexists.style.display = "flex";
                userexists.style.flexDirection = "row";
                userexists.style.justifyContent = "center";
                setTimeout(() => {
                    if (userexists) {
                        userexists.style.display = "none";
                    }
                }, 2000);
                return;
            }
        }
        catch (error) {
            console.error("Error checking existing users:", error);
            alert("An error occurred. Please try again.");
            return;
        }
        let newUserId = 1;
        try {
            const allUsersResponse = yield fetch(`${apiUrl}/usersLogin`);
            const allUsers = yield allUsersResponse.json();
            if (allUsers.length > 0) {
                newUserId = allUsers.length + 1;
            }
        }
        catch (error) {
            console.error("Error fetching all users:", error);
            alert("An error occurred. Please try again.");
            return;
        }
        const newUser = { id: newUserId, username, email, password };
        try {
            const response = yield fetch(`${apiUrl}/usersLogin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                console.log("Signup response:", yield response.json());
                console.log("Signup successful! Creating default expenses...");
                const defaultExpenses = {
                    username: username,
                    totalBudget: 0,
                    categories: {
                        Groceries: [],
                        Entertainment: [],
                        Utilities: [],
                        Others: []
                    }
                };
                const expensesResponse = yield fetch(`${apiUrl}/expenses`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(defaultExpenses),
                });
                if (expensesResponse.ok) {
                    console.log("Default expenses created:", yield expensesResponse.json());
                    location.href = "../public/index.html";
                }
                else {
                    console.error("Failed to create default expenses:", expensesResponse.statusText);
                    alert("Signup failed. Please try again.");
                }
            }
            else {
                console.error("Signup failed:", response.statusText);
                alert("Signup failed. Please try again.");
            }
        }
        catch (error) {
            console.error("Error during signup:", error);
            alert("An error occurred. Please try again.");
        }
    });
}
