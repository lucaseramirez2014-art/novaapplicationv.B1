/**
 * NovaMind Application Core Logic
 * Handles navigation switching, dynamic brand logos, and localStorage persistence.
 */

// Initial State with localStorage Fallbacks
const state = {
    currentApp: 'hub',
    transactions: JSON.parse(localStorage.getItem('nova_transactions')) || [],
    goals: JSON.parse(localStorage.getItem('nova_goals')) || []
};

// Brand Icon SVGs corresponding to each sub-application
const BRAND_LOGOS = {
    hub: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    finance: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/></svg>`,
    goals: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10l2 2 4-4"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
    fit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" fill="#10b981" opacity="0.2"/><circle cx="9" cy="9" r="1.5" fill="#ef4444"/><circle cx="15" cy="8.5" r="1.5" fill="#ef4444"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    renderSavedData();
});

/**
 * Tab Navigation & Dynamic Branding Switcher
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const appViews = document.querySelectorAll('.app-view');
    const brandLogo = document.getElementById('brandLogo');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const selectedApp = link.getAttribute('data-app');

            // Update Active Tab UI
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // Switch Active View
            appViews.forEach(view => {
                view.classList.toggle('active', view.id === `${selectedApp}-view`);
            });

            // Update Top Left Logo Icon
            if (BRAND_LOGOS[selectedApp] && brandLogo) {
                brandLogo.innerHTML = BRAND_LOGOS[selectedApp];
            }
        });
    });
}

/**
 * Modal Open/Close Controls and Event Handlers
 */
function initModals() {
    // Transaction Modal Elements
    const txnModal = document.getElementById('transactionModal');
    const openTxnBtn = document.getElementById('openTxnModalBtn');
    const closeTxnBtn = document.getElementById('closeTxnModalBtn');
    const cancelTxnBtn = document.getElementById('cancelTxnModalBtn');
    const txnForm = document.getElementById('transactionForm');

    // Goal Modal Elements
    const goalModal = document.getElementById('goalModal');
    const openGoalBtn = document.getElementById('openGoalModalBtn');
    const closeGoalBtn = document.getElementById('closeGoalModalBtn');
    const cancelGoalBtn = document.getElementById('cancelGoalModalBtn');
    const goalForm = document.getElementById('goalForm');

    // Helper functions for modal visibility
    const showModal = (modal) => modal?.showModal();
    const hideModal = (modal) => modal?.close();

    openTxnBtn?.addEventListener('click', () => showModal(txnModal));
    closeTxnBtn?.addEventListener('click', () => hideModal(txnModal));
    cancelTxnBtn?.addEventListener('click', () => hideModal(txnModal));

    openGoalBtn?.addEventListener('click', () => showModal(goalModal));
    closeGoalBtn?.addEventListener('click', () => hideModal(goalModal));
    cancelGoalBtn?.addEventListener('click', () => hideModal(goalModal));

    // Form Submission Handlers
    txnForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('txnName').value.trim();
        const amountInput = parseFloat(document.getElementById('txnAmount').value);

        if (!nameInput || isNaN(amountInput)) return;

        // Security / Data Sanitization: Escaping string inputs
        const safeName = sanitizeInput(nameInput);

        const newTxn = { id: Date.now(), name: safeName, amount: amountInput };
        state.transactions.push(newTxn);

        saveAndSync('nova_transactions', state.transactions);
        txnForm.reset();
        hideModal(txnModal);
        renderSavedData();
    });

    goalForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const goalName = sanitizeInput(document.getElementById('goalName').value.trim());
        const goalHours = document.getElementById('goalHours').value;

        if (!goalName) return;

        const newGoal = { id: Date.now(), name: goalName, hours: goalHours };
        state.goals.push(newGoal);

        saveAndSync('nova_goals', state.goals);
        goalForm.reset();
        hideModal(goalModal);
        renderSavedData();
    });
}

/**
 * Utility: Input Sanitization to prevent XSS
 */
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Helper to sync state changes into browser localStorage
 */
function saveAndSync(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to write to localStorage:', e);
    }
}

/**
 * Render dynamic goal cards and recalculate budget metrics
 */
function renderSavedData() {
    // Render Goals Grid
    const goalsGrid = document.getElementById('goalsGrid');
    if (goalsGrid) {
        goalsGrid.innerHTML = state.goals.map(goal => `
            <div class="card goal-card">
                <h3>${goal.name}</h3>
                <p>Allocation: <strong>${goal.hours} hrs/week</strong></p>
            </div>
        `).join('');
    }

    // Recalculate Finance Expenses
    const expensesElement = document.getElementById('expenses');
    if (expensesElement && state.transactions.length > 0) {
        const totalExpenses = state.transactions.reduce((sum, item) => sum + item.amount, 0);
        expensesElement.textContent = `$${totalExpenses.toFixed(2)}`;
    }
}