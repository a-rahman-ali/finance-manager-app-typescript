import { IUser } from "../models/IUser";

const apiUrl: string = "http://localhost:3000";

async function login(event: Event): Promise<void> {
  event.preventDefault();

  const email: string = (document.querySelector('input[type="email"]') as HTMLInputElement).value;
  const password: string = (document.querySelector('input[type="password"]') as HTMLInputElement).value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const response = await fetch(
    `${apiUrl}/usersLogin?email=${email}&password=${password}`
  );
  // Pending: Adjust the type interface for users
  const users: IUser[] = await response.json();

  if (users.length > 0) {
    const username: string = users[0].username;
    console.log("User logged in:", username);
    localStorage.setItem("username", username);
    console.log("Login successful!");
    location.href = "dashboard.html";
  } else {
    console.log("Invalid credentials");
    alert("Invalid credentials, please try again.");
  }
}

function logout(): void {
  localStorage.removeItem("username");
  localStorage.clear();
  location.href = "index.html";
}
