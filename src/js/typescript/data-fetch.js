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
const apiUrl = "http://localhost:3000";
window.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const username = localStorage.getItem('username');
        if (!username) {
            alert("User not logged in");
            return;
        }
        document.getElementById("username").innerHTML = `Welcome! ${username}`;
        const budget = yield getBudget(username);
        if (budget) {
            document.getElementById("budget").innerHTML = `₹ ${budget.totalBudget}`;
            updateCategoryAmounts(budget.categories);
        }
        const expenses = yield getExpenses(username);
        fillExpensesTable(username, expenses);
        document.getElementById("add-expense-button").addEventListener("click", function () {
            addExpense(username);
        });
    });
};
function toggleCard() {
    const displayCard = document.getElementById("expense-card");
    displayCard.style.display = (displayCard.style.display == "none") ? "block" : "none";
}
function getExpenses(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const data = yield response.json();
        return data.length ? data[0].categories : {};
    });
}
function getBudget(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const budget = yield response.json();
        return budget.length ? budget[0] : null;
    });
}
function getCategoryAmount(category) {
    let total = 0;
    if (category) {
        for (let i = 0; i < category.length; i++) {
            total += category[i].amount;
        }
    }
    return total.toFixed(2);
}
function fillExpensesTable(username, categories) {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = '';
    let totalAmount = 0;
    for (const category in categories) {
        if (categories.hasOwnProperty(category)) {
            const expenses = categories[category];
            for (const expenseIndex in expenses) {
                if (expenses.hasOwnProperty(expenseIndex)) {
                    const expense = expenses[expenseIndex];
                    const row = document.createElement("tr");
                    row.appendChild(createCell(category));
                    row.appendChild(createCell(expense.description));
                    row.appendChild(createCell(`₹ ${expense.amount.toFixed(2)}`));
                    row.appendChild(createCell(expense.date));
                    row.appendChild(createButtonCell("Edit", "blue", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield editExpense(username, category, expenseIndex);
                        });
                    }));
                    row.appendChild(createButtonCell("Delete", "red", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (confirm("Are you sure you want to delete this expense?")) {
                                yield deleteExpense(username, category, expenseIndex);
                            }
                        });
                    }));
                    tbody.appendChild(row);
                    totalAmount += expense.amount;
                }
            }
        }
    }
    document.getElementById("total-amount").innerHTML = `₹ ${totalAmount.toFixed(2)}`;
}
function createCell(content) {
    const cell = document.createElement("td");
    cell.innerHTML = content;
    return cell;
}
function createButtonCell(text, color, onClick) {
    const cell = document.createElement("td");
    const button = document.createElement("button");
    button.innerHTML = text;
    button.style.color = color;
    if (onClick) {
        button.addEventListener("click", onClick);
    }
    cell.appendChild(button);
    return cell;
}
function creditAmount() {
    return __awaiter(this, void 0, void 0, function* () {
        const creditInput = prompt("Enter the amount to credit:");
        if (!creditInput) {
            console.log("You didn't enter any amount.");
            return;
        }
        const creditAmount = parseFloat(creditInput);
        if (isNaN(creditAmount) || creditAmount < 0) {
            alert("Please enter a valid positive amount.");
            return;
        }
        const username = localStorage.getItem('username');
        const budget = yield getBudget(username);
        if (budget) {
            budget.totalBudget += creditAmount;
            try {
                const response = yield fetch(`${apiUrl}/expenses/${budget.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(budget),
                });
                if (response.ok) {
                    document.getElementById("budget").innerHTML = `₹ ${budget.totalBudget.toFixed(2)}`;
                    console.log("Amount credited successfully!");
                }
                else {
                    alert("Failed to credit amount. Please try again.");
                }
            }
            catch (error) {
                console.error("Error crediting amount:", error);
                alert("An error occurred. Please try again.");
            }
        }
        else {
            alert("Failed to get budget data. Please try again.");
        }
    });
}
function debitAmount() {
    return __awaiter(this, void 0, void 0, function* () {
        const debitInput = prompt("Enter the amount to debit:");
        if (!debitInput) {
            console.log("You didn't enter any amount.");
            return;
        }
        const debitAmount = parseFloat(debitInput);
        if (isNaN(debitAmount) || debitAmount < 0) {
            alert("Please enter a valid positive amount.");
            return;
        }
        const username = localStorage.getItem('username');
        const budget = yield getBudget(username);
        if (budget && budget.totalBudget >= debitAmount) {
            budget.totalBudget -= debitAmount;
            try {
                const response = yield fetch(`${apiUrl}/expenses/${budget.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(budget),
                });
                if (!response.ok) {
                    alert("Failed to update budget. Please try again.");
                }
            }
            catch (error) {
                console.error("Error debiting amount:", error);
                alert("An error occurred. Please try again.");
            }
        }
        else {
            alert("Insufficient funds. Please enter a lower amount.");
        }
    });
}
function addExpense(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const amountInput = document.getElementById("expense-amount");
        const purposeInput = document.getElementById("expense-purpose");
        const dateInput = document.getElementById("expense-date");
        const categoryInput = document.getElementById("expense-category");
        const amount = amountInput.value.trim();
        const purpose = purposeInput.value.trim();
        const date = dateInput.value.trim();
        const category = categoryInput.value.trim();
        if (!amount || !purpose || !date || !category) {
            alert("Please fill in all fields");
            return;
        }
        const newExpense = {
            date: date,
            amount: parseFloat(amount),
            description: purpose
        };
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const data = yield response.json();
        if (data.length === 0) {
            alert("User not found");
            return;
        }
        const userExpenses = data[0];
        if (!userExpenses.categories[category]) {
            userExpenses.categories[category] = [];
        }
        if (userExpenses.totalBudget < newExpense.amount) {
            alert("You don't have enough budget");
            clearCard();
            return;
        }
        userExpenses.categories[category].push(newExpense);
        userExpenses.totalBudget -= newExpense.amount;
        try {
            const updateResponse = yield fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userExpenses)
            });
            if (!updateResponse.ok) {
                alert("Failed to update expenses");
                return;
            }
            updateDisplay(userExpenses);
            clearCard();
        }
        catch (error) {
            console.error("Error adding expense:", error);
            alert("An error occurred. Please try again.");
        }
    });
}
function editExpense(username, category, expenseIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const data = yield response.json();
        if (data.length === 0) {
            alert("User not found");
            return;
        }
        const userExpenses = data[0];
        const expenses = userExpenses.categories[category];
        const expenseToEdit = expenses[expenseIndex];
        const amountInput = document.getElementById("expense-amount");
        const purposeInput = document.getElementById("expense-purpose");
        const dateInput = document.getElementById("expense-date");
        const categoryInput = document.getElementById("expense-category");
        amountInput.value = expenseToEdit.amount;
        purposeInput.value = expenseToEdit.description;
        dateInput.value = expenseToEdit.date;
        categoryInput.value = category;
        document.getElementById("expense-card-title").innerHTML = "Edit Expense";
        const addButton = document.getElementById("add-expense-button");
        addButton.innerHTML = "Update";
        // Remove the previous event listener correctly
        addButton.removeEventListener("click", () => addExpense(username));
        // Add the new event listener
        addButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            yield updateExpense(username, category, expenseIndex);
        }));
        document.getElementById("expense-card").style.display = "block";
    });
}
function updateExpense(username, category, expenseIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const amountInput = document.getElementById("expense-amount");
        const purposeInput = document.getElementById("expense-purpose");
        const dateInput = document.getElementById("expense-date");
        const newCategoryInput = document.getElementById("expense-category");
        const amount = amountInput.value.trim();
        const purpose = purposeInput.value.trim();
        const date = dateInput.value.trim();
        const newCategory = newCategoryInput.value.trim();
        if (!amount || !purpose || !date || !newCategory) {
            alert("Please fill in all fields");
            return;
        }
        const updatedExpense = {
            date: date,
            amount: parseFloat(amount),
            description: purpose
        };
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const data = yield response.json();
        if (data.length === 0) {
            alert("User not found");
            return;
        }
        const userExpenses = data[0];
        const oldCategory = category;
        const expenseToRemove = userExpenses.categories[oldCategory][expenseIndex];
        userExpenses.categories[oldCategory].splice(expenseIndex, 1); // Remove old expense
        if (!userExpenses.categories[newCategory]) {
            userExpenses.categories[newCategory] = [];
        }
        userExpenses.categories[newCategory].push(updatedExpense); // Add updated expense
        try {
            const updateResponse = yield fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userExpenses)
            });
            if (!updateResponse.ok) {
                console.log("Failed to update expenses");
                return;
            }
            console.log("Expense updated successfully!");
            document.getElementById("expense-card").style.display = "none";
            updateDisplay(userExpenses);
            clearCard();
            // Remove the previous event listener correctly
            const addButton = document.getElementById("add-expense-button");
            addButton.removeEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                yield updateExpense(username, category, expenseIndex);
            }));
            // Add the new event listener
            addButton.addEventListener("click", () => {
                addExpense(username);
            });
        }
        catch (error) {
            console.error("Error updating expense:", error);
            alert("An error occurred. Please try again.");
        }
    });
}
function deleteExpense(username, category, expenseIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/expenses?username=${username}`);
        const data = yield response.json();
        if (data.length === 0) {
            alert("User not found");
            return;
        }
        const userExpenses = data[0];
        const deletedExpense = userExpenses.categories[category][expenseIndex];
        userExpenses.categories[category].splice(expenseIndex, 1);
        try {
            const updateResponse = yield fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userExpenses)
            });
            if (!updateResponse.ok) {
                alert("Failed to delete expense");
                return;
            }
            alert("Expense deleted successfully!");
            updateDisplay(userExpenses);
        }
        catch (error) {
            console.error("Error deleting expense:", error);
            alert("An error occurred. Please try again.");
        }
    });
}
function updateDisplay(userExpenses) {
    document.getElementById("budget").innerHTML = `₹ ${userExpenses.totalBudget}`;
    updateCategoryAmounts(userExpenses.categories);
    fillExpensesTable(localStorage.getItem('username'), userExpenses.categories);
}
function updateCategoryAmounts(categories) {
    document.getElementById("groceries").innerHTML = `₹ ${getCategoryAmount(categories.Groceries)}`;
    document.getElementById("entertainment").innerHTML = `₹ ${getCategoryAmount(categories.Entertainment)}`;
    document.getElementById("utilities").innerHTML = `₹ ${getCategoryAmount(categories.Utilities)}`;
    document.getElementById("others").innerHTML = `₹ ${getCategoryAmount(categories.Others || [])}`;
}
function clearCard() {
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-purpose").value = "";
    document.getElementById("expense-date").value = "";
    document.getElementById("expense-category").value = "";
}
