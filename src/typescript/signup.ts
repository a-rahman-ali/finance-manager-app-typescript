// const apiUrl: string = "http://localhost:3000";

import { IUser } from "../models/IUser";

async function signup(event: Event): Promise<void> {
    event.preventDefault();

    const usernameInput: HTMLInputElement | null = document.querySelector("#username");
    const emailInput: HTMLInputElement | null = document.querySelector("#email");
    const passwordInput: HTMLInputElement | null = document.querySelector("#password");

    if (!usernameInput || !emailInput || !passwordInput) {
        alert("Please fill in all fields.");
        return;
    }

    const username: string = usernameInput.value;
    const email: string = emailInput.value;
    const password: string = passwordInput.value;

    try {
        const checkResponse = await fetch(`${apiUrl}/usersLogin?email=${email}`);
        const existingUsers: IUser[] = await checkResponse.json();
        const userexists: HTMLElement | null = document.getElementById("existsmessage");

        if (existingUsers.length > 0) {
            userexists!.style.display = "flex";
            userexists!.style.flexDirection = "row";
            userexists!.style.justifyContent = "center";
            setTimeout(() => {
                if (userexists) {
                    userexists.style.display = "none";
                }
            }, 2000);
            return;
        }
    } catch (error) {
        console.error("Error checking existing users:", error);
        alert("An error occurred. Please try again.");
        return;
    }

    let newUserId: number = 1;
    try {
        const allUsersResponse = await fetch(`${apiUrl}/usersLogin`);
        const allUsers: IUser[] = await allUsersResponse.json();

        if (allUsers.length > 0) {
            newUserId = allUsers.length + 1;
        }
    } catch (error) {
        console.error("Error fetching all users:", error);
        alert("An error occurred. Please try again.");
        return;
    }

    const newUser = { id: newUserId, username, email, password };

    try {
        const response = await fetch(`${apiUrl}/usersLogin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        });

        if (response.ok) {
            console.log("Signup response:", await response.json());
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

            const expensesResponse = await fetch(`${apiUrl}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(defaultExpenses),
            });

            if (expensesResponse.ok) {
                console.log("Default expenses created:", await expensesResponse.json());
                location.href = "../public/index.html";
            } else {
                console.error("Failed to create default expenses:", expensesResponse.statusText);
                alert("Signup failed. Please try again.");
            }
        } else {
            console.error("Signup failed:", response.statusText);
            alert("Signup failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again.");
    }
}
