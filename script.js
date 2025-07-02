// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT REFERENCES ---
    const transactionForm = document.getElementById('transaction-form');
    const transactionDateInput = document.getElementById('transaction-date');
    const transactionCategoryInput = document.getElementById('transaction-category');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeDisplay = document.getElementById('total-income');
    const totalExpenseDisplay = document.getElementById('total-expense');
    const balanceDisplay = document.getElementById('balance');
    const noTransactionsMessage = document.getElementById('no-transactions-message');
    const messageBox = document.getElementById('message-box');

    // --- STATE MANAGEMENT ---
    // Load transactions from localStorage or initialize with an empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // --- FUNCTIONS ---

    /**
     * Saves the current state of transactions to localStorage.
     */
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    /**
     * Renders all transactions to the DOM.
     */
    function renderTransactions() {
        // Clear the current list to prevent duplicates
        transactionList.innerHTML = '';

        if (transactions.length === 0) {
            noTransactionsMessage.classList.remove('hidden');
        } else {
            noTransactionsMessage.classList.add('hidden');
            // Sort transactions by date, newest first, for a logical order
            const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedTransactions.forEach(transaction => {
                const isIncome = transaction.type === 'income';
                const sign = isIncome ? '+' : '-';
                const amountColor = isIncome ? 'text-blue-600' : 'text-orange-600';
                const borderColor = isIncome ? 'border-blue-500' : 'border-orange-500';

                const transactionEl = document.createElement('div');
                transactionEl.className = `transaction-item flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderColor}`;
                
                transactionEl.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="text-center">
                            <p class="font-bold text-sm">${new Date(transaction.date).toLocaleDateString('km-KH', { day: '2-digit' })}</p>
                            <p class="text-xs text-slate-500">${new Date(transaction.date).toLocaleDateString('km-KH', { month: 'short' })}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">${transaction.category}</p>
                            <p class="text-sm text-slate-500">${new Date(transaction.date).toLocaleDateString('km-KH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold ${amountColor}">${sign}${formatCurrency(transaction.amount)}</p>
                        <button data-id="${transaction.id}" class="delete-btn text-xs text-red-500 hover:text-red-700 font-bold">លុប</button>
                    </div>
                `;
                transactionList.appendChild(transactionEl);
            });
        }
    }

    /**
     * Updates the summary section (income, expense, balance).
     */
    function updateSummary() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const balance = totalIncome - totalExpense;

        totalIncomeDisplay.textContent = formatCurrency(totalIncome);
        totalExpenseDisplay.textContent = formatCurrency(totalExpense);
        balanceDisplay.textContent = formatCurrency(balance);
        
        // Change balance color to red if negative, green otherwise
        balanceDisplay.classList.toggle('text-red-700', balance < 0);
        balanceDisplay.classList.toggle('text-green-900', balance >= 0);
    }

    /**
     * Handles the form submission to add a new transaction.
     * @param {Event} e - The form submission event.
     */
    function addTransaction(e) {
        e.preventDefault(); // Prevent page reload

        const date = transactionDateInput.value;
        const category = transactionCategoryInput.value.trim();
        const amount = parseFloat(transactionAmountInput.value);
        const type = document.querySelector('input[name="transaction-type"]:checked').value;

        // Simple validation
        if (!date || !category || isNaN(amount) || amount <= 0) {
            showMessage('សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ។', 'error');
            return;
        }

        const newTransaction = {
            id: Date.now().toString(), // Unique ID using timestamp
            date,
            category,
            amount,
            type
        };

        transactions.push(newTransaction);
        
        saveTransactions();
        renderTransactions();
        updateSummary();

        // Reset form for the next entry
        transactionForm.reset();
        setDefaultDate();
        
        showMessage('ប្រតិបត្តិការត្រូវបានបន្ថែមដោយជោគជ័យ!', 'success');
    }
    
    /**
     * Handles deleting a transaction when a delete button is clicked.
     * @param {Event} e - The click event.
     */
    function deleteTransaction(e) {
        // Use event delegation to find delete button clicks
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            // Filter out the transaction to be deleted
            transactions = transactions.filter(transaction => transaction.id !== id);
            
            saveTransactions();
            renderTransactions();
            updateSummary();
            showMessage('ប្រតិបត្តិការត្រូវបានលុប។', 'success');
        }
    }

    /**
     * Displays a temporary message to the user (e.g., for success or error).
     * @param {string} message - The text to display.
     * @param {string} type - 'success' for green, 'error' for red.
     */
    function showMessage(message, type = 'error') {
        messageBox.textContent = message;
        // Make the message box visible and set its color
        messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg transition-all duration-300 opacity-100 translate-x-0`;
        
        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else {
            messageBox.classList.add('bg-red-500');
        }

        // Hide the message box after 3 seconds
        setTimeout(() => {
            messageBox.classList.replace('opacity-100', 'opacity-0');
            messageBox.classList.replace('translate-x-0', 'translate-x-full');
        }, 3000);
    }

    /**
     * Formats a number as Khmer currency (Riel).
     * @param {number} amount - The number to format.
     * @returns {string} - The formatted currency string.
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR', minimumFractionDigits: 0 }).format(amount);
    }
    
    /**
     * Sets the date input to the current date on page load.
     */
    function setDefaultDate() {
        const today = new Date();
        // Format to YYYY-MM-DD for the date input
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        transactionDateInput.value = `${year}-${month}-${day}`;
    }

    // --- INITIALIZATION ---
    /**
     * Sets up the application on initial load.
     */
    function init() {
        setDefaultDate();
        renderTransactions();
        updateSummary();
        // Add event listeners
        transactionForm.addEventListener('submit', addTransaction);
        transactionList.addEventListener('click', deleteTransaction);
    }

    init(); // Run the application
});
