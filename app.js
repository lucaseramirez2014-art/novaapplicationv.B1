/**
 * NovaMind Core Application Logic
 * Standard ES6 Modular Design System
 */

// Application State with LocalStorage Persistence
const state = {
    currentApp: 'hub',
    transactions: JSON.parse(localStorage.getItem('nova_transactions')) || [],
    goals: JSON.parse(localStorage.getItem('nova_goals')) || []
};

// Dynamic Application Logos
const BRAND_LOGOS = {
    hub: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    finance: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/></svg>`,
    goals: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10l2 2 4-4"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
    fit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" fill="#10b981" opacity="0.2"/><circle cx="9" cy="9" r="1.5" fill="#ef4444"/><circle cx="15" cy="8.5" r="1.5" fill="#ef4444"/></svg>`
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    renderSavedData();
});

/**
 * 1. Routing & Tab Navigation
 */
function navigateTo(appName) {
    const navLinks = document.querySelectorAll('.nav-link');
    const appViews = document.querySelectorAll('.app-view');
    const brandLogo = document.getElementById('brandLogo');

    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.app === appName);
    });

    appViews.forEach(view => {
        view.classList.toggle('active', view.id === `${appName}-view`);
    });

    if (BRAND_LOGOS[appName] && brandLogo) {
        brandLogo.innerHTML = BRAND_LOGOS[appName];
    }
    state.currentApp = appName;
}

function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.app));
    });

    // Keyboard Shortcuts (1-4)
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        if (e.key === '1') navigateTo('hub');
        if (e.key === '2') navigateTo('finance');
        if (e.key === '3') navigateTo('goals');
        if (e.key === '4') navigateTo('fit');
    });
}

/**
 * 2. Dialog Modal Controls & Submissions
 */
function initModals() {
    const txnModal = document.getElementById('transactionModal');
    const goalModal = document.getElementById('goalModal');

    document.getElementById('openTxnModalBtn')?.addEventListener('click', () => txnModal?.showModal());
    document.getElementById('closeTxnModalBtn')?.addEventListener('click', () => txnModal?.close());
    document.getElementById('cancelTxnModalBtn')?.addEventListener('click', () => txnModal?.close());

    document.getElementById('openGoalModalBtn')?.addEventListener('click', () => goalModal?.showModal());
    document.getElementById('closeGoalModalBtn')?.addEventListener('click', () => goalModal?.close());
    document.getElementById('cancelGoalModalBtn')?.addEventListener('click', () => goalModal?.close());

    // Submit Transaction
    document.getElementById('transactionForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('txnName').value.trim();
        const amountInput = parseFloat(document.getElementById('txnAmount').value);

        if (!nameInput || isNaN(amountInput)) return;

        const newTxn = { id: Date.now(), name: sanitizeInput(nameInput), amount: amountInput };
        state.transactions.push(newTxn);

        saveAndSync('nova_transactions', state.transactions);
        e.target.reset();
        txnModal?.close();
        renderSavedData();
    });

    // Submit Goal
    document.getElementById('goalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('goalName').value.trim();
        const hoursInput = document.getElementById('goalHours').value;

        if (!nameInput) return;

        const newGoal = { id: Date.now(), name: sanitizeInput(nameInput), hours: hoursInput };
        state.goals.push(newGoal);

        saveAndSync('nova_goals', state.goals);
        e.target.reset();
        goalModal?.close();
        renderSavedData();
    });
}

/**
 * 3. Render Data State to DOM
 */
function renderSavedData() {
    // Render Goals Grid
    const goalsGrid = document.getElementById('goalsGrid');
    if (goalsGrid) {
        goalsGrid.innerHTML = state.goals.map(goal => `
            <article class="card goal-card">
                <h3>${goal.name}</h3>
                <p>Allocation: <strong>${goal.hours} hrs/week</strong></p>
            </article>
        `).join('');
    }

    // Render Expense Sums
    const expensesElement = document.getElementById('expenses');
    if (expensesElement) {
        const total = state.transactions.reduce((sum, item) => sum + item.amount, 0);
        expensesElement.textContent = formatCurrency(1970 + total);
    }
}

/**
 * Utility Helpers
 */
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

function saveAndSync(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.error('Storage error:', err);
    }
}

// Global scope bindings
window.navigateTo = navigateTo;