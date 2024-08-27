document.addEventListener('DOMContentLoaded', function () {
    displayCategoryExpenses();
    displayMonthlyExpenses();
});

async function displayCategoryExpenses(): Promise<void> {
    const username: string | null = localStorage.getItem('username');

    const data = await fetch(`http://localhost:3000/expenses?username=${username}`).then((res) => res.json());
    const expenses = (data.length) ? data[0].categories : {};
    console.log(expenses);

    const categories: Record<string, HTMLElement | null> = {
        Groceries: document.querySelector('#groceries-table tbody'),
        Entertainment: document.querySelector('#entertainment-table tbody'),
        Utilities: document.querySelector('#utilities-table tbody'),
        Others: document.querySelector('#others-table tbody')
    };

    for (const category in categories) {
        categories[category]!.innerHTML = ``;
    }

    const totals: Record<string, number> = {
        Groceries: 0,
        Entertainment: 0,
        Utilities: 0,
        Others: 0
    };

    const getMonthYear = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    for (const category in expenses) {
        if (categories.hasOwnProperty(category)) {
            const expensesByMonth: Record<string, any[]> = {};

            expenses[category].forEach((expense: any) => {
                const monthYear = getMonthYear(expense.date);

                if (!expensesByMonth[monthYear]) {
                    expensesByMonth[monthYear] = [];
                }

                expensesByMonth[monthYear].push(expense);
                totals[category] += parseFloat(expense.amount);
            });

            for (const monthYear in expensesByMonth) {
                const monthHeader = document.createElement('tr');
                const monthCell = document.createElement('td');
                monthCell.colSpan = 2;
                monthCell.style.fontWeight = 'bold';
                monthCell.style.textAlign = 'center';
                monthCell.textContent = monthYear;
                monthHeader.appendChild(monthCell);

                const tbody = categories[category];
                tbody!.appendChild(monthHeader);

                expensesByMonth[monthYear].forEach((expense: any) => {
                    const row = document.createElement('tr');
                    const dateCell = document.createElement('td');
                    const amountCell = document.createElement('td');

                    dateCell.textContent = expense.date;
                    amountCell.textContent = `₹ ${expense.amount}`;

                    row.appendChild(dateCell);
                    row.appendChild(amountCell);

                    tbody!.appendChild(row);
                });
            }

            // Adding total row
            const tbody = categories[category];
            const totalRow = document.createElement('tr');
            const totalLabelCell = document.createElement('td');
            const totalAmountCell = document.createElement('td');

            totalLabelCell.textContent = 'Total';
            totalLabelCell.style.fontWeight = 'bold';
            totalAmountCell.textContent = `₹ ${totals[category].toFixed(2)}`;
            totalAmountCell.style.fontWeight = 'bold';

            totalRow.appendChild(totalLabelCell);
            totalRow.appendChild(totalAmountCell);

            tbody!.appendChild(totalRow);
        }
    }
}

async function displayMonthlyExpenses(): Promise<void> {
    const username: string | null = localStorage.getItem('username');
    const data = await fetch(`http://localhost:3000/expenses?username=${username}`).then((res) => res.json());
    const expenses = (data.length) ? data[0].categories : {};

    const monthlyTable: HTMLElement | null = document.querySelector('#monthly-expenses-table tbody');

    monthlyTable!.innerHTML = '';

    const totalsByMonth: Record<string, number> = {};

    const getMonthYear = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };

    for (const category in expenses) {
        expenses[category].forEach((expense: any) => {
            const monthYear = getMonthYear(expense.date);

            if (!totalsByMonth[monthYear]) {
                totalsByMonth[monthYear] = 0;
            }

            totalsByMonth[monthYear] += parseFloat(expense.amount);
        });
    }

    for (const monthYear in totalsByMonth) {
        const row = document.createElement('tr');
        const monthCell = document.createElement('td');
        const amountCell = document.createElement('td');

        monthCell.textContent = monthYear;
        amountCell.textContent = `₹ ${totalsByMonth[monthYear].toFixed(2)}`;

        row.appendChild(monthCell);
        row.appendChild(amountCell);

        monthlyTable!.appendChild(row);
    }
}
