// Nova Ecosystem - JavaScript Application

const money = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(n);
const clean = s => s.replace(/[&<>]/g, '');

// Navigation functionality
function navigateTo(appName) {
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.app === appName) {
            link.classList.add('active');
        }
    });

    // Update app views
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`${appName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Dialog functions
function openDialog(id) {
    document.getElementById(id).showModal();
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navigateTo(link.dataset.app);
        });
    });

    // Initialize preference tags toggle
    document.querySelectorAll('.preference-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // Initialize shopping item checkboxes
    document.querySelectorAll('.shopping-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateShoppingSummary);
    });

    // Initialize check buttons
    document.addEventListener('click', e => {
        if (e.target.classList.contains('check')) {
            e.target.classList.toggle('done');
            refreshGoalProgress();
        }
    });

    // Simulate AI interactions
    setupAIInteractions();
});

// Add transaction
function addTransaction(e) {
    e.preventDefault();
    const n = Number(txnAmount.value);
    const name = clean(txnName.value.trim());
    if (!n || !name) return;
    available.textContent = money(4280 - n);
    expenses.textContent = money(1970 + n);
    e.target.closest('dialog').close();
    e.target.reset();
}

// Add goal
function addGoal(e) {
    e.preventDefault();
    const name = clean(goalName.value.trim());
    const hours = goalHours.value;
    if (!name) return;
    goalsGrid.insertAdjacentHTML('afterbegin', `
        <article class="goal-card" onclick="toggleGoalPlan(this)">
            <div class="goal-top">
                <span class="tag">AI plan</span>
                <span>✦</span>
            </div>
            <h3>${name}</h3>
            <p>3 milestones · paced at ${hours}h/week</p>
            <div class="goal-percent">0%</div>
            <div class="progress"><i style="width:0%"></i></div>
        </article>
    `);
    document.querySelector('.tree-head h2').textContent = name;
    document.querySelector('.tree-head .sub').textContent = `AI plan · 3 milestones · 12 tasks · paced at ${hours} hours/week`;
    e.target.closest('dialog').close();
    e.target.reset();
}

// Toggle milestone
function toggleMilestone(button) {
    const collapsed = button.dataset.collapsed === 'true';
    button.parentElement.querySelectorAll('.task').forEach(t => t.hidden = !collapsed);
    button.dataset.collapsed = String(!collapsed);
    button.firstChild.nodeValue = (collapsed ? '⌄' : '›') + button.firstChild.nodeValue.slice(1);
}

// Goal plans data
const goalPlans = {
    "Build emergency fund": {
        timeline: "12 weeks",
        pace: "Set up one 20-minute money review each Friday.",
        tasks: [
            ["Choose your monthly savings amount", "30m", "blocking"],
            ["Automate a weekly transfer", "20m", "blocking"],
            ["Review your progress every Friday", "15m", "recurring"]
        ]
    },
    "Read 24 books": {
        timeline: "10 weeks",
        pace: "Reserve three 25-minute reading sessions each week.",
        tasks: [
            ["Pick your next three books", "20m", "blocking"],
            ["Set a weekly reading rhythm", "15m", "blocking"],
            ["Log each finished book", "5m", "recurring"]
        ]
    },
    "Run a half marathon": {
        timeline: "6 weeks",
        pace: "Complete three runs each week, with one long run.",
        tasks: [
            ["Confirm your training schedule", "20m", "blocking"],
            ["Complete this week's easy runs", "2h", "blocking"],
            ["Plan Sunday's long run", "15m", "recurring"]
        ]
    }
};

// Toggle goal plan
function toggleGoalPlan(card) {
    const planArea = document.querySelector('#goalsGrid + .grid');
    const wasOpen = card.classList.contains('is-active');
    document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('is-active'));
    if (wasOpen) {
        planArea.hidden = true;
        return;
    }
    card.classList.add('is-active');
    planArea.hidden = false;
    const name = card.querySelector('h3').textContent;
    const plan = goalPlans[name] || {
        timeline: "6 weeks",
        pace: "Start with two focused sessions each week.",
        tasks: [
            ["Define the outcome", "30m", "blocking"],
            ["Create the first action", "1h", "blocking"],
            ["Review progress weekly", "15m", "recurring"]
        ]
    };
    document.querySelector('.tree-head h2').textContent = name;
    document.querySelector('.tree-head .sub').textContent = `AI plan · 2 milestones · ${plan.tasks.length} actions · ${plan.timeline}`;
    planTree.innerHTML = `
        <div class="milestone">
            <button class="tree-toggle" onclick="toggleMilestone(this)">⌄ 1. Get started <span class="mini">· 0% · ${plan.tasks.reduce((a, t) => a + parseInt(t[1]), 0)}m</span></button>
            ${planTasks(plan.tasks)}
        </div>
    `;
}

function planTasks(tasks) {
    return tasks.map(([title, time, priority]) => `
        <div class="task">
            <button class="check" aria-label="Complete ${title}"></button>
            <div class="task-text">${title}</div>
            <span class="task-meta">${time} <span class="priority ${priority === 'blocking' ? 'blocking' : 'optional'}">${priority}</span></span>
        </div>
    `).join('');
}

// Refresh goal progress
function refreshGoalProgress() {
    const active = document.querySelector('.goal-card.is-active');
    if (!active) return;
    const checks = [...document.querySelectorAll('#planTree .check')];
    const completed = checks.filter(check => check.classList.contains('done')).length;
    const percent = checks.length ? Math.round(completed / checks.length * 100) : 0;
    active.querySelector('.goal-percent').textContent = `${percent}%`;
    active.querySelector('.progress i').style.width = `${percent}%`;
    document.querySelector('.tree-head .sub').textContent = `AI plan · ${checks.length} actions · ${completed} complete · ${percent}% progress`;
}

// Update shopping summary
function updateShoppingSummary() {
    const checkboxes = document.querySelectorAll('.shopping-item input[type="checkbox"]:checked');
    const totalItems = document.querySelectorAll('.shopping-item').length;
    const checkedItems = checkboxes.length;
    const remainingItems = totalItems - checkedItems;

    const summaryElement = document.querySelector('.shopping-summary .total-items');
    if (summaryElement) {
        summaryElement.textContent = `${remainingItems} items remaining`;
    }
}

// Setup AI interaction simulations
function setupAIInteractions() {
    // Fit optimize button
    const optimizeBtn = document.querySelector('.ai-suggestion-card .btn-amber');
    if (optimizeBtn && optimizeBtn.textContent === 'Optimize Further') {
        optimizeBtn.addEventListener('click', () => {
            optimizeBtn.textContent = 'Optimizing...';
            setTimeout(() => {
                optimizeBtn.textContent = 'Optimized!';
                optimizeBtn.style.background = 'var(--success)';
                const costElement = document.querySelector('.estimated-cost');
                if (costElement) {
                    costElement.textContent = 'Est. $54.75';
                }
                setTimeout(() => {
                    optimizeBtn.textContent = 'Optimize Further';
                    optimizeBtn.style.background = '';
                }, 2000);
            }, 1500);
        });
    }

    // Dietary preference edit button
    const editPrefsBtn = document.querySelector('.dietary-card .btn-secondary');
    if (editPrefsBtn) {
        editPrefsBtn.addEventListener('click', () => {
            alert('Dietary preferences editor would open here. This would allow you to add/remove dietary restrictions, set calorie targets, and specify allergies.');
        });
    }

    // View full week button
    const viewWeekBtn = document.querySelector('.meal-plan-card .btn-secondary');
    if (viewWeekBtn) {
        viewWeekBtn.addEventListener('click', () => {
            alert('Full weekly meal plan view would open here, showing all 7 days with detailed recipes and nutritional information.');
        });
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === '1') navigateTo('hub');
    if (e.key === '2') navigateTo('finance');
    if (e.key === '3') navigateTo('goals');
    if (e.key === '4') navigateTo('fit');
});

// Export functions for global access
window.navigateTo = navigateTo;
window.openDialog = openDialog;
window.addTransaction = addTransaction;
window.addGoal = addGoal;
window.toggleMilestone = toggleMilestone;
window.toggleGoalPlan = toggleGoalPlan;
window.refreshGoalProgress = refreshGoalProgress;
