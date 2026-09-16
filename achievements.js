const achievementDefinitions = [
    {
        id: "first-focus",
        icon: "fa-bullseye",
        name: "First Focus",
        description: "Complete your first focus session.",
        target: 1,
        type: "sessions"
    },
    {
        id: "focus-starter",
        icon: "fa-clock",
        name: "Focus Starter",
        description: "Complete 5 focus sessions.",
        target: 5,
        type: "sessions"
    },
    {
        id: "deep-worker",
        icon: "fa-brain",
        name: "Deep Worker",
        description: "Complete 10 focus sessions.",
        target: 10,
        type: "sessions"
    },
    {
        id: "study-master",
        icon: "fa-graduation-cap",
        name: "Study Master",
        description: "Complete 25 focus sessions.",
        target: 25,
        type: "sessions"
    },
    {
        id: "task-finisher",
        icon: "fa-check",
        name: "Task Finisher",
        description: "Complete 5 tasks.",
        target: 5,
        type: "tasks"
    },
    {
        id: "task-pro",
        icon: "fa-list-check",
        name: "Task Pro",
        description: "Complete 20 tasks.",
        target: 20,
        type: "tasks"
    },
    {
        id: "consistent-learner",
        icon: "fa-calendar-check",
        name: "Consistent Learner",
        description: "Build a 3-day study streak.",
        target: 3,
        type: "streak"
    },
    {
        id: "dedicated-student",
        icon: "fa-star",
        name: "Dedicated Student",
        description: "Build a 7-day study streak.",
        target: 7,
        type: "streak"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    renderAchievements();
});

function renderAchievements() {
    const data = getStudyOSData();

    if (!Array.isArray(data.achievements)) {
        data.achievements = [];
    }

    const progressData = getProgressData(data);
    const unlockedIds = [];

    achievementDefinitions.forEach(achievement => {
        const progress = progressData[achievement.type] || 0;

        if (progress >= achievement.target) {
            unlockedIds.push(achievement.id);
        }
    });

    data.achievements = unlockedIds;
    saveStudyOSData(data);

    updateSummary(unlockedIds);
    renderAchievementCards(progressData, unlockedIds);
    renderRecentAchievements(unlockedIds);
}

function getProgressData(data) {
    const focusSessions = (data.studySessions || []).filter(
        session => session.type === "focus"
    );

    const completedTasks = (data.tasks || []).filter(
        task => task.completed === true
    );

    return {
        sessions: focusSessions.length,
        tasks: completedTasks.length,
        streak: calculateStudyStreak()
    };
}

function updateSummary(unlockedIds) {
    const unlockedCount = unlockedIds.length;
    const totalCount = achievementDefinitions.length;
    const remainingCount = totalCount - unlockedCount;
    const progress = totalCount
        ? Math.round((unlockedCount / totalCount) * 100)
        : 0;

    document.getElementById("unlocked-count").textContent =
        unlockedCount;

    document.getElementById("remaining-count").textContent =
        remainingCount;

    document.getElementById("achievement-progress").textContent =
        `${progress}%`;

    document.getElementById("achievement-total").textContent =
        `${unlockedCount} of ${totalCount} unlocked`;
}

function renderAchievementCards(progressData, unlockedIds) {
    const grid = document.getElementById("achievements-grid");

    grid.innerHTML = "";

    achievementDefinitions.forEach(achievement => {
        const progress = progressData[achievement.type] || 0;
        const unlocked = unlockedIds.includes(achievement.id);
        const percentage = Math.min(
            (progress / achievement.target) * 100,
            100
        );

        const card = document.createElement("div");
        card.className = `achievement-card ${
            unlocked ? "unlocked" : "locked"
        }`;

        card.innerHTML = `
            <div class="achievement-icon">
                <i class="fa-solid ${achievement.icon}"></i>
            </div>

            <div class="achievement-content">
                <div class="achievement-header">
                    <h3>${achievement.name}</h3>
                    <span class="achievement-status ${unlocked ? "unlocked" : ""}">
                        <i class="fa-solid ${
                            unlocked ? "fa-check" : "fa-lock"
                        }"></i>
                    </span>
                </div>

                <p>${achievement.description}</p>

                <div class="achievement-progress">
                    <div
                        class="progress-fill"
                        style="width: ${percentage}%"
                    ></div>
                </div>

                <span class="achievement-progress-text">
                    ${Math.min(progress, achievement.target)} / ${achievement.target}
                </span>
            </div>
        `;

        grid.appendChild(card);
    });
}

function renderRecentAchievements(unlockedIds) {
    const container = document.getElementById("recent-achievements");

    if (!unlockedIds.length) {
        container.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <div class="recent-info">
                    <strong>No achievements yet</strong>
                    <p>Complete focus sessions and tasks to unlock achievements.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    const recentAchievements = achievementDefinitions.filter(
        achievement => unlockedIds.includes(achievement.id)
    ).slice(-5).reverse();

    recentAchievements.forEach(achievement => {
        const item = document.createElement("div");
        item.className = "recent-item";

        item.innerHTML = `
            <div class="recent-icon">
                <i class="fa-solid ${achievement.icon}"></i>
            </div>

            <div class="recent-info">
                <strong>${achievement.name}</strong>
                <p>${achievement.description}</p>
            </div>

            <span class="recent-check">
                <i class="fa-solid fa-check"></i>
            </span>
        `;

        container.appendChild(item);
    });
}

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