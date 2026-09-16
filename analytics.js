let studyPeriod = 7;

document.addEventListener("DOMContentLoaded", () => {
    setupAnalytics();
});

function setupAnalytics() {
    const periodSelect = document.getElementById("study-period");

    periodSelect.addEventListener("change", () => {
        studyPeriod = Number(periodSelect.value);
        renderStudyChart();
    });

    renderAnalytics();
}

function renderAnalytics() {
    updateOverview();
    renderStudyChart();
    renderTaskProgress();
    renderSubjectPerformance();
    renderWeeklySummary();
    renderInsights();
}

function getWeekDates(days = 7) {
    const dates = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        dates.push(`${year}-${month}-${day}`);
    }

    return dates;
}

function getWeekSessions(days = 7) {
    const data = getStudyOSData();
    const dates = getWeekDates(days);

    return (data.studySessions || []).filter(session =>
        dates.includes(session.date) &&
        session.type === "focus"
    );
}

function getWeekTasks() {
    const data = getStudyOSData();
    const dates = getWeekDates(7);

    return (data.tasks || []).filter(task => {
        const taskDate = task.dueDate || task.date || task.createdAt;

        if (!taskDate) {
            return false;
        }

        return dates.includes(String(taskDate).slice(0, 10));
    });
}

// Overview cards
function updateOverview() {
    const sessions = getWeekSessions(7);
    const tasks = getWeekTasks();

    const totalMinutes = sessions.reduce(
        (total, session) => total + Number(session.duration || 0),
        0
    );

    const completedTasks = tasks.filter(task =>
        task.completed === true
    ).length;

    const completionRate = tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

    document.getElementById("total-study-time").textContent =
        formatStudyTime(totalMinutes);

    document.getElementById("analytics-streak").textContent =
        `${calculateStudyStreak()} days`;

    document.getElementById("analytics-tasks-completed").textContent =
        completedTasks;

    document.getElementById("goal-completion").textContent =
        `${completionRate}%`;
}

function formatStudyTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

// Study chart
function renderStudyChart() {
    const chart = document.getElementById("study-chart");
    const dates = getWeekDates(studyPeriod);
    const sessions = getWeekSessions(studyPeriod);

    const chartEmpty = document.getElementById("chart-empty");

    if (!sessions.length) {
        chart.innerHTML = "";
        chart.appendChild(chartEmpty);
        return;
    }

    const dailyMinutes = dates.map(date => {
        return sessions
            .filter(session => session.date === date)
            .reduce(
                (total, session) =>
                    total + Number(session.duration || 0),
                0
            );
    });

    const maxMinutes = Math.max(...dailyMinutes, 1);

    chart.innerHTML = "";

    const bars = document.createElement("div");
    bars.className = "chart-bars";

    dates.forEach((date, index) => {
        const column = document.createElement("div");
        column.className = "chart-column";

        const value = document.createElement("span");
        value.className = "bar-value";
        value.textContent = `${dailyMinutes[index]}m`;

        const bar = document.createElement("div");
        bar.className = "bar";

        const height = dailyMinutes[index] > 0
            ? Math.max((dailyMinutes[index] / maxMinutes) * 100, 4)
            : 3;

        bar.style.height = `${height}%`;

        const label = document.createElement("span");
        label.className = "bar-label";

        const dateObject = new Date(`${date}T00:00:00`);

        label.textContent = dateObject.toLocaleDateString("en-US", {
            weekday: "short"
        });

        column.append(value, bar, label);
        bars.appendChild(column);
    });

    chart.appendChild(bars);
}

// Task progress
function renderTaskProgress() {
    const data = getStudyOSData();
    const tasks = data.tasks || [];

    const completed = tasks.filter(task =>
        task.completed === true
    ).length;

    const pending = tasks.filter(task =>
        task.completed !== true
    ).length;

    const today = getTodayDate();

    const overdue = tasks.filter(task =>
        task.completed !== true &&
        task.dueDate &&
        task.dueDate < today
    ).length;

    document.getElementById("completed-task-count").textContent =
        completed;

    document.getElementById("pending-task-count").textContent =
        pending;

    document.getElementById("overdue-task-count").textContent =
        overdue;

    const total = tasks.length || 1;

    document.getElementById("completed-task-progress").style.width =
        `${(completed / total) * 100}%`;

    document.getElementById("pending-task-progress").style.width =
        `${(pending / total) * 100}%`;

    document.getElementById("overdue-task-progress").style.width =
        `${(overdue / total) * 100}%`;
}

// Subject performance
function renderSubjectPerformance() {
    const data = getStudyOSData();
    const subjects = data.subjects || [];
    const sessions = data.studySessions || [];
    const container = document.getElementById("subject-performance");
    const emptyState = document.getElementById("subject-empty");

    if (!subjects.length) {
        container.innerHTML = "";
        container.appendChild(emptyState);
        return;
    }

    container.innerHTML = "";

    subjects.forEach(subject => {
        const subjectSessions = sessions.filter(session =>
            session.subjectId === subject.id &&
            session.type === "focus"
        );

        const minutes = subjectSessions.reduce(
            (total, session) =>
                total + Number(session.duration || 0),
            0
        );

        const row = document.createElement("div");
        row.className = "subject-row";

        const info = document.createElement("div");
        info.className = "subject-info";

        const name = document.createElement("span");
        name.textContent = subject.name;

        const time = document.createElement("strong");
        time.textContent = formatStudyTime(minutes);

        info.append(name, time);

        const bar = document.createElement("div");
        bar.className = "subject-bar";

        const fill = document.createElement("div");
        fill.className = "subject-fill";

        const progress = Math.min(
            (minutes / Math.max(...subjects.map(item =>
                sessions
                    .filter(session =>
                        session.subjectId === item.id &&
                        session.type === "focus"
                    )
                    .reduce(
                        (total, session) =>
                            total + Number(session.duration || 0),
                        0
                    )
            ), 1)) * 100,
            100
        );

        fill.style.width = `${progress}%`;

        bar.appendChild(fill);
        row.append(info, bar);
        container.appendChild(row);
    });
}

// Weekly summary
function renderWeeklySummary() {
    const sessions = getWeekSessions(7);
    const tasks = getWeekTasks();

    const totalMinutes = sessions.reduce(
        (total, session) => total + Number(session.duration || 0),
        0
    );

    const activeDays = new Set(
        sessions.map(session => session.date)
    ).size;

    const completedTasks = tasks.filter(task =>
        task.completed === true
    ).length;

    const completionRate = tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

    const averageTime = Math.round(totalMinutes / 7);

    document.getElementById("average-study-time").textContent =
        `${averageTime}m/day`;

    document.getElementById("weekly-completion-rate").textContent =
        `${completionRate}%`;

    document.getElementById("active-study-days").textContent =
        `${activeDays} days`;

    document.getElementById("weekly-focus-sessions").textContent =
        sessions.length;
}

// Study streak
function calculateStudyStreak() {
    const data = getStudyOSData();

    const dates = new Set(
        (data.studySessions || [])
            .filter(session => session.type === "focus")
            .map(session => session.date)
    );

    let streak = 0;
    const currentDate = new Date();

    while (true) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

        const dateString = `${year}-${month}-${day}`;

        if (!dates.has(dateString)) {
            break;
        }

        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

// Insights
function renderInsights() {
    const data = getStudyOSData();
    const sessions = getWeekSessions(7);
    const tasks = data.tasks || [];
    const insightsList = document.getElementById("insights-list");

    const insights = [];

    const totalMinutes = sessions.reduce(
        (total, session) => total + Number(session.duration || 0),
        0
    );

    const completedTasks = tasks.filter(task =>
        task.completed === true
    ).length;

    if (sessions.length === 0) {
        insights.push({
            icon: "fa-lightbulb",
            title: "Start a focus session",
            text: "Complete your first focus session to start building your productivity history."
        });
    } else {
        insights.push({
            icon: "fa-clock",
            title: "Keep your study momentum",
            text: `You've studied for ${formatStudyTime(totalMinutes)} this week.`
        });
    }

    if (completedTasks > 0) {
        insights.push({
            icon: "fa-check",
            title: "Tasks are moving forward",
            text: `You've completed ${completedTasks} task${completedTasks === 1 ? "" : "s"}.`
        });
    }

    const streak = calculateStudyStreak();

    if (streak > 0) {
        insights.push({
            icon: "fa-fire",
            title: "You're building a streak",
            text: `You've studied for ${streak} consecutive day${streak === 1 ? "" : "s"}.`
        });
    }

    insightsList.innerHTML = "";

    insights.forEach(insight => {
        const item = document.createElement("div");
        item.className = "insight-item";

        item.innerHTML = `
            <div class="insight-icon">
                <i class="fa-solid ${insight.icon}"></i>
            </div>
            <div>
                <strong>${insight.title}</strong>
                <p>${insight.text}</p>
            </div>
        `;

        insightsList.appendChild(item);
    });
}