let timerInterval = null;
let timerMode = "focus";
let timerRunning = false;
let totalSeconds = 25 * 60;
let remainingSeconds = 25 * 60;
let completedSessions = 0;
let currentSubjectId = "";

const timerDisplay = document.getElementById("timer-display");
const timerModeElement = document.getElementById("timer-mode");
const sessionStatus = document.getElementById("session-status");
const startTimerButton = document.getElementById("start-timer");
const resetTimerButton = document.getElementById("reset-timer");
const skipTimerButton = document.getElementById("skip-timer");
const timerRing = document.querySelector(".timer-ring");

const completedSessionsElement = document.getElementById("completed-sessions");
const focusDurationInput = document.getElementById("focus-duration");
const shortBreakInput = document.getElementById("short-break");
const longBreakInput = document.getElementById("long-break");
const focusDurationValue = document.getElementById("focus-duration-value");
const shortBreakValue = document.getElementById("short-break-value");
const longBreakValue = document.getElementById("long-break-value");
const focusSubjectSelect = document.getElementById("focus-subject");
const saveSettingsButton = document.getElementById("save-focus-settings");

const todaySessionsElement = document.getElementById("today-sessions");
const todayFocusTimeElement = document.getElementById("today-focus-time");
const dailyGoalHoursElement = document.getElementById("daily-goal-hours");
const focusGoalProgressElement = document.getElementById("focus-goal-progress");
const focusProgressFill = document.getElementById("focus-progress-fill");

document.addEventListener("DOMContentLoaded", () => {
    loadFocusSettings();
    loadSubjects();
    updateTodayProgress();
    initializeTimer();
    setupEventListeners();
});

// Load saved settings
function loadFocusSettings() {
    const data = getStudyOSData();
    const settings = data.settings || {};

    const focusDuration = settings.pomodoroDuration || 25;
    const shortBreak = settings.shortBreak || 5;
    const longBreak = settings.longBreak || 15;

    focusDurationInput.value = focusDuration;
    shortBreakInput.value = shortBreak;
    longBreakInput.value = longBreak;

    focusDurationValue.textContent = `${focusDuration} min`;
    shortBreakValue.textContent = `${shortBreak} min`;
    longBreakValue.textContent = `${longBreak} min`;
}

// Load subjects
function loadSubjects() {
    const data = getStudyOSData();
    const subjects = data.subjects || [];

    focusSubjectSelect.innerHTML =
        `<option value="">No subject selected</option>`;

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        focusSubjectSelect.appendChild(option);
    });
}

// Events
function setupEventListeners() {
    startTimerButton.addEventListener("click", toggleTimer);
    resetTimerButton.addEventListener("click", resetTimer);
    skipTimerButton.addEventListener("click", skipTimer);

    focusDurationInput.addEventListener("input", () => {
        focusDurationValue.textContent = `${focusDurationInput.value} min`;
    });

    shortBreakInput.addEventListener("input", () => {
        shortBreakValue.textContent = `${shortBreakInput.value} min`;
    });

    longBreakInput.addEventListener("input", () => {
        longBreakValue.textContent = `${longBreakInput.value} min`;
    });

    saveSettingsButton.addEventListener("click", saveFocusSettings);

    focusSubjectSelect.addEventListener("change", () => {
        currentSubjectId = focusSubjectSelect.value;
    });
}

// Initialize timer
function initializeTimer() {
    const data = getStudyOSData();
    const duration = data.settings?.pomodoroDuration || 25;
    setTimer("focus", duration);
}

// Set timer
function setTimer(mode, minutes) {
    timerMode = mode;
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;

    updateTimerDisplay();
    updateTimerMode();
    updateTimerRing();
}

// Start or pause
function toggleTimer() {
    timerRunning ? pauseTimer() : startTimer();
}

function startTimer() {
    if (timerRunning) return;

    timerRunning = true;
    sessionStatus.textContent = "Session in progress";
    startTimerButton.innerHTML =
        `<i class="fa-solid fa-pause"></i> Pause`;

    document.querySelector(".timer-card")?.classList.add("running");

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();
        updateTimerRing();

        if (remainingSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;

    sessionStatus.textContent = "Session paused";
    startTimerButton.innerHTML =
        `<i class="fa-solid fa-play"></i> Resume`;

    document.querySelector(".timer-card")?.classList.remove("running");
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;

    const data = getStudyOSData();
    let minutes;

    if (timerMode === "focus") {
        minutes = data.settings?.pomodoroDuration || 25;
    } else if (timerMode === "short-break") {
        minutes = data.settings?.shortBreak || 5;
    } else {
        minutes = data.settings?.longBreak || 15;
    }

    setTimer(timerMode, minutes);

    sessionStatus.textContent =
        timerMode === "focus" ? "Ready to focus" : "Break time";

    startTimerButton.innerHTML =
        `<i class="fa-solid fa-play"></i> Start`;

    const card = document.querySelector(".timer-card");
    card?.classList.remove("running", "break-mode");

    if (timerMode !== "focus") {
        card?.classList.add("break-mode");
    }
}

// Skip timer
function skipTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    moveToNextSession();
}

// Complete timer
function completeTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;

    if (timerMode === "focus") {
        recordStudySession();
        updateTodayProgress();
        moveToNextSession();
    } else {
        moveToNextSession();
    }
}

// Move to next session
function moveToNextSession() {
    const data = getStudyOSData();
    const settings = data.settings || {};

    if (timerMode === "focus") {
        completedSessions++;

        if (completedSessions % 4 === 0) {
            setTimer("long-break", settings.longBreak || 15);
        } else {
            setTimer("short-break", settings.shortBreak || 5);
        }
    } else {
       setTimer("focus", settings.pomodoroDuration || 25);
    }
    sessionStatus.textContent =
        timerMode === "focus" ? "Ready to focus" : "Break time";
    startTimerButton.innerHTML =
        `<i class="fa-solid fa-play"></i> Start`;
    const card = document.querySelector(".timer-card");
    card?.classList.remove("running");
    card?.classList.toggle("break-mode", timerMode !== "focus");
}
// Save completed session
function recordStudySession() {
    const data = getStudyOSData();
    if (!Array.isArray(data.studySessions)) {
        data.studySessions = [];
    }
    data.studySessions.push({
        id: Date.now().toString(),
        date: getTodayDate(),
        duration: Math.floor(totalSeconds / 60),
        subjectId: currentSubjectId,
        type: "focus",
        completedAt: Date.now()
    });
    saveStudyOSData(data);
}
// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.title = `${timerDisplay.textContent} — StudyOS`;
}
// Update mode text
function updateTimerMode() {
    if (timerMode === "focus") {
        timerModeElement.textContent = "Focus Session";
    } else if (timerMode === "short-break") {
        timerModeElement.textContent = "Short Break";
    } else {
        timerModeElement.textContent = "Long Break";
    }
}
// Update progress ring
function updateTimerRing() {
    if (!timerRing) return;
    const elapsed = totalSeconds - remainingSeconds;
    const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
    const degrees = progress * 360;
    timerRing.style.background =
        `conic-gradient(var(--accent) ${degrees}deg, var(--border-color) ${degrees}deg)`;
}
// Update today's stats
function updateTodayProgress() {
    const data = getStudyOSData();
    const today = getTodayDate();
    const sessions = (data.studySessions || []).filter(session =>
        session.date === today && session.type === "focus"
    );
    const totalMinutes = sessions.reduce(
        (total, session) => total + Number(session.duration || 0),
        0
    );
    const dailyGoal = Number(data.settings?.dailyGoal || 2);
    const goalMinutes = dailyGoal * 60;
    const progress = goalMinutes > 0
        ? Math.min((totalMinutes / goalMinutes) * 100, 100)
        : 0;
    todaySessionsElement.textContent = sessions.length;
    todayFocusTimeElement.textContent = `${totalMinutes} min`;
    dailyGoalHoursElement.textContent = `${dailyGoal} hr`;
    focusGoalProgressElement.textContent = `${Math.round(progress)}%`;
    focusProgressFill.style.width = `${progress}%`;
    completedSessionsElement.textContent = sessions.length;
    completedSessions = sessions.length;
}
// Save settings
function saveFocusSettings() {
    const data = getStudyOSData();
    if (!data.settings) {
        data.settings = {};
    }
    data.settings.pomodoroDuration = Number(focusDurationInput.value);
    data.settings.shortBreak = Number(shortBreakInput.value);
    data.settings.longBreak = Number(longBreakInput.value);
    saveStudyOSData(data);
    if (!timerRunning) {
        let minutes;
        if (timerMode === "focus") {
            minutes = data.settings.pomodoroDuration;
        } else if (timerMode === "short-break") {
            minutes = data.settings.shortBreak;
        } else {
            minutes = data.settings.longBreak;
        }
        setTimer(timerMode, minutes);
    }
    updateTodayProgress();
    saveSettingsButton.innerHTML =
        `<i class="fa-solid fa-check"></i> Saved`;
    setTimeout(() => {
        saveSettingsButton.innerHTML =
            `<i class="fa-solid fa-floppy-disk"></i> Save Settings`;
    }, 1500);
}