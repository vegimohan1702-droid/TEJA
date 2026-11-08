// =====================================
// EXPENSE TRACKER - JAVASCRIPT
// =====================================

// Categories

const categories = {
    income: [
        "Salary",
        "Pocket Money",
        "Business",
        "Other Income"
    ],

    expense: [
        "Food",
        "Transport",
        "Shopping",
        "Education",
        "Entertainment",
        "Bills",
        "Health",
        "Other"
    ]
};

// Chart colors

const chartColors = [
    "#a78bfa",
    "#34d399",
    "#fb7185",
    "#fbbf24",
    "#38bdf8",
    "#f472b6",
    "#818cf8",
    "#2dd4bf"
];

// Load saved transactions

function loadTransactions() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("expenseTransactions")
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {
        return [];
    }
}

let transactions = loadTransactions();


// =====================================
// HTML ELEMENTS
// =====================================

const form = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const monthFilter = document.getElementById("monthFilter");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");

const categoryChart = document.getElementById("categoryChart");
const categoryLegend = document.getElementById("categoryLegend");
const monthlyChart = document.getElementById("monthlyChart");


// =====================================
// INITIAL SETTINGS
// =====================================

const today = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.value = formatDate(today);
monthFilter.value = formatDate(today).slice(0, 7);


// =====================================
// SAVE DATA
// =====================================

function saveTransactions() {
    try {
        localStorage.setItem(
            "expenseTransactions",
            JSON.stringify(transactions)
        );

    } catch (error) {
        alert("Unable to save data in this browser.");
    }
}


// =====================================
// CATEGORY SELECTION
// =====================================

function updateCategories() {

    const selectedType = typeInput.value;

    categoryInput.innerHTML = "";

    categories[selectedType].forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryInput.appendChild(option);

    });

}

typeInput.addEventListener("change", updateCategories);


// =====================================
// ADD TRANSACTION
// =====================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (date > formatDate(new Date())) {
        alert("Future transaction dates are not allowed.");
        return;
    }

    const transaction = {

        id: Date.now().toString() + Math.random().toString(36).slice(2),

        title: title,
        amount: amount,
        type: type,
        category: category,
        date: date

    };

    transactions.push(transaction);

    saveTransactions();

    form.reset();

    dateInput.value = formatDate(new Date());

    updateCategories();

    renderApp();

});


// =====================================
// DELETE TRANSACTION
// =====================================

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();

    renderApp();

}


// =====================================
// FILTER TRANSACTIONS BY MONTH
// =====================================

function getMonthlyTransactions() {

    const selectedMonth = monthFilter.value;

    return transactions.filter(transaction => {

        return transaction.date.startsWith(selectedMonth);

    });

}

monthFilter.addEventListener("change", renderApp);


// =====================================
// FORMAT CURRENCY
// =====================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2

    }).format(amount);

}


// =====================================
// UPDATE SUMMARY
// =====================================

function updateSummary() {

    const monthlyTransactions = getMonthlyTransactions();

    const income = monthlyTransactions

        .filter(item => item.type === "income")

        .reduce((sum, item) => sum + item.amount, 0);


    const expense = monthlyTransactions

        .filter(item => item.type === "expense")

        .reduce((sum, item) => sum + item.amount, 0);


    const monthlyBalance = income - expense;

    totalIncome.textContent = formatCurrency(income);

    totalExpense.textContent = formatCurrency(expense);

    balance.textContent = formatCurrency(monthlyBalance);

}


// =====================================
// CATEGORY-WISE SPENDING
// =====================================

function updateCategoryChart() {

    const monthlyTransactions = getMonthlyTransactions();

    const expenseTransactions = monthlyTransactions.filter(

        item => item.type === "expense"

    );

    const categoryTotals = {};

    expenseTransactions.forEach(item => {

        categoryTotals[item.category] =

            (categoryTotals[item.category] || 0) + item.amount;

    });

    const entries = Object.entries(categoryTotals);

    const total = expenseTransactions.reduce(

        (sum, item) => sum + item.amount, 0

    );

    categoryLegend.innerHTML = "";

    if (total === 0) {

        categoryChart.style.background = "#353b50";

        categoryChart.innerHTML = "<p>No expenses yet.</p>";

        return;

    }

    let currentAngle = 0;

    const gradients = [];

    entries.forEach(([category, amount], index) => {

        const percentage = (amount / total) * 100;

        const angle = (amount / total) * 360;

        const color = chartColors[index % chartColors.length];

        gradients.push(

            `${color} ${currentAngle}deg ${currentAngle + angle}deg`

        );

        currentAngle += angle;


        // Create category legend

        const legendItem = document.createElement("div");

        legendItem.className = "legend-item";

        const nameContainer = document.createElement("div");

        nameContainer.className = "legend-name";

        const colorBox = document.createElement("span");

        colorBox.className = "legend-color";

        colorBox.style.background = color;

        const name = document.createElement("span");

        name.textContent = category;

        nameContainer.append(colorBox, name);

        const value = document.createElement("span");

        value.textContent =

            `${formatCurrency(amount)} (${percentage.toFixed(1)}%)`;

        legendItem.append(nameContainer, value);

        categoryLegend.appendChild(legendItem);

    });

    categoryChart.style.background =

        `conic-gradient(${gradients.join(", ")})`;

    categoryChart.innerHTML = "<p>Expenses</p>";

}


// =====================================
// MONTHLY INCOME VS EXPENSE CHART
// =====================================

function updateMonthlyChart() {

    const monthlyTransactions = getMonthlyTransactions();

    const income = monthlyTransactions

        .filter(item => item.type === "income")

        .reduce((sum, item) => sum + item.amount, 0);

    const expense = monthlyTransactions

        .filter(item => item.type === "expense")

        .reduce((sum, item) => sum + item.amount, 0);


    monthlyChart.innerHTML = "";

    const maximum = Math.max(income, expense, 1);

    const values = [

        {
            label: "Income",
            amount: income,
            className: "income-bar"
        },

        {
            label: "Expenses",
            amount: expense,
            className: "expense-bar"
        }

    ];


    values.forEach(item => {

        const group = document.createElement("div");

        group.className = "bar-group";

        const value = document.createElement("span");

        value.className = "bar-value";

        value.textContent = formatCurrency(item.amount);


        const bar = document.createElement("div");

        bar.className = `bar ${item.className}`;

        bar.style.height = `${(item.amount / maximum) * 160}px`;


        const label = document.createElement("span");

        label.className = "bar-label";

        label.textContent = item.label;


        group.append(value, bar, label);

        monthlyChart.appendChild(group);

    });


    const legend = document.createElement("div");

    legend.className = "chart-legend";

    legend.innerHTML = `

        <span>
            <i class="legend-color income-bar"></i>
            Income
        </span>

        <span>
            <i class="legend-color expense-bar"></i>
            Expenses
        </span>

    `;

    monthlyChart.appendChild(legend);

}


// =====================================
// TRANSACTION HISTORY
// =====================================

function renderTransactions() {

    const monthlyTransactions = getMonthlyTransactions();

    transactionList.innerHTML = "";

    const sortedTransactions = [...monthlyTransactions].sort(

        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)

    );

    transactionCount.textContent =

        `${sortedTransactions.length} transactions`;


    if (sortedTransactions.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent = "No transactions found.";

        row.appendChild(cell);

        transactionList.appendChild(row);

        return;

    }


    sortedTransactions.forEach(item => {

        const row = document.createElement("tr");


        const titleCell = document.createElement("td");

        titleCell.textContent = item.title;


        const categoryCell = document.createElement("td");

        categoryCell.textContent = item.category;


        const dateCell = document.createElement("td");

        dateCell.textContent = item.date;


        const typeCell = document.createElement("td");

        typeCell.textContent =

            item.type === "income" ? "Income" : "Expense";

        typeCell.className =

            item.type === "income" ? "income-text" : "expense-text";


        const amountCell = document.createElement("td");

        amountCell.textContent = formatCurrency(item.amount);

        amountCell.className = typeCell.className;


        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            deleteTransaction(item.id);

        });


        actionCell.appendChild(deleteButton);

        row.append(

            titleCell,
            categoryCell,
            dateCell,
            typeCell,
            amountCell,
            actionCell

        );

        transactionList.appendChild(row);

    });

}


// =====================================
// RENDER ALL FEATURES
// =====================================

function renderApp() {

    updateSummary();

    updateCategoryChart();

    updateMonthlyChart();

    renderTransactions();

}


// =====================================
// START APPLICATION
// =====================================

updateCategories();

renderApp();