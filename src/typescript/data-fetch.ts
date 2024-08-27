const apiUrl: string = "http://localhost:3000";

window.onload = async function () {
    const username: string | null = localStorage.getItem('username');
    if (!username) {
        alert("User not logged in");
        return;
    }

    document.getElementById("username")!.innerHTML = `Welcome! ${username}`;

    const budget = await getBudget(username);
    if (budget) {
        document.getElementById("budget")!.innerHTML = `₹ ${budget.totalBudget}`;
        updateCategoryAmounts(budget.categories);
    }

    const expenses = await getExpenses(username);
    fillExpensesTable(username, expenses);

    document.getElementById("add-expense-button")!.addEventListener("click", function () {
        addExpense(username);
    });
}

function toggleCard(): void {
    const displayCard = document.getElementById("expense-card");
    displayCard!.style.display = (displayCard!.style.display == "none") ? "block" : "none";
}

async function getExpenses(username: string): Promise<any> {
    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const data = await response.json();
    return data.length ? data[0].categories : {};
}

async function getBudget(username: string): Promise<any> {
    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const budget = await response.json();
    return budget.length ? budget[0] : null;
}

function getCategoryAmount(category: any[]): string {
    let total = 0;
    if (category) {
        for (let i = 0; i < category.length; i++) {
            total += category[i].amount;
        }
    }
    return total.toFixed(2);
}

function fillExpensesTable(username: string, categories: any): void {
    const tbody = document.getElementById("expense-table-body");
    tbody!.innerHTML = '';
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
                    row.appendChild(createButtonCell("Edit", "blue", async function () {
                        await editExpense(username, category, expenseIndex);
                    }));
                    row.appendChild(createButtonCell("Delete", "red", async function () {
                        if (confirm("Are you sure you want to delete this expense?")) {
                            await deleteExpense(username, category, expenseIndex);
                        }
                    }));

                    tbody!.appendChild(row);
                    totalAmount += expense.amount;
                }
            }
        }
    }

    document.getElementById("total-amount")!.innerHTML = `₹ ${totalAmount.toFixed(2)}`;
}

function createCell(content: string): HTMLTableCellElement {
    const cell = document.createElement("td");
    cell.innerHTML = content;
    return cell;
}

function createButtonCell(text: string, color: string, onClick: () => void): HTMLTableCellElement {
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

async function creditAmount(): Promise<void> {
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
    const budget = await getBudget(username!);
    if (budget) {
        budget.totalBudget += creditAmount;

        try {
            const response = await fetch(`${apiUrl}/expenses/${budget.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(budget),
            });

            if (response.ok) {
                document.getElementById("budget")!.innerHTML = `₹ ${budget.totalBudget.toFixed(2)}`;
                console.log("Amount credited successfully!");
            } else {
                alert("Failed to credit amount. Please try again.");
            }
        } catch (error) {
            console.error("Error crediting amount:", error);
            alert("An error occurred. Please try again.");
        }
    } else {
        alert("Failed to get budget data. Please try again.");
    }
}

async function debitAmount(): Promise<void> {
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
    const budget = await getBudget(username!);
    if (budget && budget.totalBudget >= debitAmount) {
        budget.totalBudget -= debitAmount;
        try {
            const response = await fetch(`${apiUrl}/expenses/${budget.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(budget),
            });
            if (!response.ok) {
                alert("Failed to update budget. Please try again.");
            }
        } catch (error) {
            console.error("Error debiting amount:", error);
            alert("An error occurred. Please try again.");
        }
    } else {
        alert("Insufficient funds. Please enter a lower amount.");
    }
}

async function addExpense(username: string): Promise<void> {
    const amountInput = document.getElementById("expense-amount") as HTMLInputElement;
    const purposeInput = document.getElementById("expense-purpose") as HTMLInputElement;
    const dateInput = document.getElementById("expense-date") as HTMLInputElement;
    const categoryInput = document.getElementById("expense-category") as HTMLInputElement;

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

    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const data = await response.json();
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
        const updateResponse = await fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
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
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("An error occurred. Please try again.");
    }
}

async function editExpense(username: string, category: string, expenseIndex: string): Promise<void> {
    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const data = await response.json();
    if (data.length === 0) {
        alert("User not found");
        return;
    }

    const userExpenses = data[0];
    const expenses = userExpenses.categories[category];
    const expenseToEdit = expenses[expenseIndex];

    const amountInput = document.getElementById("expense-amount") as HTMLInputElement;
    const purposeInput = document.getElementById("expense-purpose") as HTMLInputElement;
    const dateInput = document.getElementById("expense-date") as HTMLInputElement;
    const categoryInput = document.getElementById("expense-category") as HTMLInputElement;

    amountInput.value = expenseToEdit.amount;
    purposeInput.value = expenseToEdit.description;
    dateInput.value = expenseToEdit.date;
    categoryInput.value = category;

    document.getElementById("expense-card-title")!.innerHTML = "Edit Expense";
    const addButton = document.getElementById("add-expense-button")!;
    addButton.innerHTML = "Update";

    // Remove the previous event listener correctly
    addButton.removeEventListener("click", () => addExpense(username));

    // Add the new event listener
    addButton.addEventListener("click", async () => {
        await updateExpense(username, category, expenseIndex);
    });

    document.getElementById("expense-card")!.style.display = "block";
}

async function updateExpense(username: string, category: string, expenseIndex: string): Promise<void> {
    const amountInput = document.getElementById("expense-amount") as HTMLInputElement;
    const purposeInput = document.getElementById("expense-purpose") as HTMLInputElement;
    const dateInput = document.getElementById("expense-date") as HTMLInputElement;
    const newCategoryInput = document.getElementById("expense-category") as HTMLInputElement;

    const amount: string = amountInput.value.trim();
    const purpose: string = purposeInput.value.trim();
    const date: string = dateInput.value.trim();
    const newCategory: string = newCategoryInput.value.trim();

    if (!amount || !purpose || !date || !newCategory) {
        alert("Please fill in all fields");
        return;
    }

    const updatedExpense = {
        date: date,
        amount: parseFloat(amount),
        description: purpose
    };

    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const data = await response.json();
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
        const updateResponse = await fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
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
        document.getElementById("expense-card")!.style.display = "none";
        updateDisplay(userExpenses);
        clearCard();

        // Remove the previous event listener correctly
        const addButton = document.getElementById("add-expense-button")!;
        addButton.removeEventListener("click", async () => {
            await updateExpense(username, category, expenseIndex);
        });

        // Add the new event listener
        addButton.addEventListener("click", () => {
            addExpense(username);
        });

    } catch (error) {
        console.error("Error updating expense:", error);
        alert("An error occurred. Please try again.");
    }
}

async function deleteExpense(username: string, category: string, expenseIndex: string): Promise<void> {
    const response = await fetch(`${apiUrl}/expenses?username=${username}`);
    const data = await response.json();
    if (data.length === 0) {
        alert("User not found");
        return;
    }

    const userExpenses = data[0];
    const deletedExpense = userExpenses.categories[category][expenseIndex];
    userExpenses.categories[category].splice(expenseIndex, 1);

    try {
        const updateResponse = await fetch(`${apiUrl}/expenses/${userExpenses.id}`, {
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

    } catch (error) {
        console.error("Error deleting expense:", error);
        alert("An error occurred. Please try again.");
    }
}

function updateDisplay(userExpenses: any): void {
    document.getElementById("budget")!.innerHTML = `₹ ${userExpenses.totalBudget}`;
    updateCategoryAmounts(userExpenses.categories);
    fillExpensesTable(localStorage.getItem('username')!, userExpenses.categories);
}

function updateCategoryAmounts(categories: any): void {
    document.getElementById("groceries")!.innerHTML = `₹ ${getCategoryAmount(categories.Groceries)}`;
    document.getElementById("entertainment")!.innerHTML = `₹ ${getCategoryAmount(categories.Entertainment)}`;
    document.getElementById("utilities")!.innerHTML = `₹ ${getCategoryAmount(categories.Utilities)}`;
    document.getElementById("others")!.innerHTML = `₹ ${getCategoryAmount(categories.Others || [])}`;
}

function clearCard(): void {
    (document.getElementById("expense-amount") as HTMLInputElement).value = "";
    (document.getElementById("expense-purpose") as HTMLInputElement).value = "";
    (document.getElementById("expense-date") as HTMLInputElement).value = "";
    (document.getElementById("expense-category") as HTMLInputElement).value = "";
}
