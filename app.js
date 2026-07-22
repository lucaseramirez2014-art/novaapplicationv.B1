/**
 * NovaMind Core Application Engine
 * Architecture: Event-driven ES6+ JavaScript
 * Features: LocalStorage persistence, XSS sanitization, dynamic tab routing, modal control
 */

// ==========================================================================
// 1. Application State & Storage Management
// ==========================================================================

const STORAGE_KEYS = {
    TRANSACTIONS: 'novamind_transactions',
    GOALS: 'novamind_goals'
};

// Primary Application State
const state = {
    currentApp: 'hub',
    transactions: loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
    goals: loadFromStorage(STORAGE_KEYS.GOALS, [])
};

/**
 * Safely load JSON data from LocalStorage.
 * @param {string} key - Storage key
 * @param {Array|Object} fallback - Default fallback structure
 */
function loadFromStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (err) {
        console.error(`Error loading key "${key}" from storage:`, err);
        return fallback;
    }
}

/**
 * Persist data to LocalStorage.
 * @param {string} key - Storage key
 * @param {any} data - Serializable payload
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.error(`Error saving key "${key}" to storage:`, err);
    }
}

// ==========================================================================
// 2. Dynamic Brand SVG Configuration
// ==========================================================================

const BRAND_LOGOS = {
    hub: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>`,
    finance: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v12M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/>
              </svg>`,
    goals: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M9 10l2 2 4-4"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>`,
    fit: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" fill="#10b981" opacity="0.2"/>
            <circle cx="9" cy="9" r="1.5" fill="#ef4444"/>
            <circle cx="15" cy="8.5" r="1.5" fill="#ef4444"/>
          </svg>`
};

// ==========================================================================
// 3. Application Lifecycle & Setup
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    renderAllViews();
});

// ==========================================================================
// 4. Navigation & View Routing Engine
// ==========================================================================

/**
 * Switches active application view and updates navigation states.
 * @param {string} appName - 'hub' | 'finance' | 'goals' | 'fit'
 */
function navigateTo(appName) {
    const navLinks = document.querySelectorAll('.nav-link');
    const appViews = document.querySelectorAll('.app-view');
    const brandLogo = document.getElementById('brandLogo');

    // Update active tab button state
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.app === appName);
    });

    // Toggle view visibility
    appViews.forEach(view => {
        view.classList.toggle('active', view.id === `${appName}-view`);
    });

    // Update brand SVG icon
    if (BRAND_LOGOS[appName] && brandLogo) {
        brandLogo.innerHTML = BRAND_LOGOS[appName];
    }

    state.currentApp = appName;
}

function initNavigation() {
    // Nav Click Listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetApp = e.currentTarget.dataset.app;
            if (targetApp) navigateTo(targetApp);
        });
    });

    // Hotkey Navigation (1=Hub, 2=Finance, 3=Goals, 4=Fit)
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

        const keyMap = { '1': 'hub', '2': 'finance', '3': 'goals', '4': 'fit' };
        if (keyMap[e.key]) navigateTo(keyMap[e.key]);
    });
}

// ==========================================================================
// 5. Modal Dialog Management & Form Submissions
// ==========================================================================

function initModals() {
    // Modal Elements
    const txnModal = document.getElementById('transactionModal');
    const goalModal = document.getElementById('goalModal');

    // Open Controls
    document.getElementById('openTxnModalBtn')?.addEventListener('click', () => txnModal?.showModal());
    document.getElementById('openGoalModalBtn')?.addEventListener('click', () => goalModal?.showModal());

    // Close / Cancel Controls
    document.getElementById('closeTxnModalBtn')?.addEventListener('click', () => txnModal?.close());
    document.getElementById('cancelTxnModalBtn')?.addEventListener('click', () => txnModal?.close());
    document.getElementById('closeGoalModalBtn')?.addEventListener('click', () => goalModal?.close());
    document.getElementById('cancelGoalModalBtn')?.addEventListener('click', () => goalModal?.close());

    // Transaction Form Handler
    document.getElementById('transactionForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('txnName');
        const amountInput = document.getElementById('txnAmount');

        const rawName = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (!rawName || isNaN(amount) || amount <= 0) return;

        const newTransaction = {
            id: Date.now(),
            name: sanitizeString(rawName),
            amount: amount
        };

        state.transactions.push(newTransaction);
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, state.transactions);

        e.target.reset();
        txnModal?.close();
        renderFinanceView();
    });

    // Goal Form Handler
    document.getElementById('goalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('goalName');
        const hoursInput = document.getElementById('goalHours');

        const rawName = nameInput.value.trim();
        const hours = parseInt(hoursInput.value, 10);

        if (!rawName) return;

        const newGoal = {
            id: Date.now(),
            name: sanitizeString(rawName),
            hours: hours
        };

        state.goals.push(newGoal);
        saveToStorage(STORAGE_KEYS.GOALS, state.goals);

        e.target.reset();
        goalModal?.close();
        renderGoalsView();
    });
}

// ==========================================================================
// 6. Rendering Logic
// ==========================================================================

function renderAllViews() {
    renderFinanceView();
    renderGoalsView();
}

/**
 * Calculates updated expense totals and updates DOM metrics.
 */
function renderFinanceView() {
    const expensesElement = document.getElementById('expenses');
    if (!expensesElement) return;

    const baseExpense = 1970.00; // Baseline dashboard mock state
    const addedExpenses = state.transactions.reduce((acc, txn) => acc + txn.amount, 0);
    const totalExpense = baseExpense + addedExpenses;

    expensesElement.textContent = formatCurrency(totalExpense);
}

/**
 * Renders dynamically saved goals as card components.
 */
function renderGoalsView() {
    const goalsGrid = document.getElementById('goalsGrid');
    if (!goalsGrid) return;

    if (state.goals.length === 0) {
        goalsGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">No custom goals created yet.</p>`;
        return;
    }

    // Safely template HTML strings using sanitized attributes
    goalsGrid.innerHTML = state.goals.map(goal => `
        <article class="hub-app-card" style="margin-bottom: 1rem;">
            <div class="app-card-header">
                <span class="app-icon goals-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </span>
                <h3>${goal.name}</h3>
            </div>
            <p>Target Commitment: <strong>${goal.hours} hrs / week</strong></p>
        </article>
    `).join('');
}

// ==========================================================================
// 7. Security & Helper Utilities
// ==========================================================================

/**
 * Sanitizes user input string to neutralize standard XSS vectors.
 * @param {string} str - Raw user input
 * @returns {string} Safe HTML-encoded string
 */
function sanitizeString(str) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
}

/**
 * Formats a numeric value into a USD currency string.
 * @param {number} value
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}