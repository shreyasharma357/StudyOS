const profileForm = document.getElementById("profile-form");
const saveProfileButton = document.getElementById("save-profile");
const saveSettingsButton = document.getElementById("save-settings");

const profileNameInput = document.getElementById("profile-name");
const profileEmailInput = document.getElementById("profile-email");
const profileCollegeInput = document.getElementById("profile-college");
const profileCourseInput = document.getElementById("profile-course");
const profileSemesterInput = document.getElementById("profile-semester");

const dailyGoalInput = document.getElementById("daily-goal");
const pomodoroDurationInput = document.getElementById("pomodoro-duration");
const shortBreakInput = document.getElementById("short-break");
const longBreakInput = document.getElementById("long-break");

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadSettings();
    setupProfileEvents();
});

function setupProfileEvents() {
    profileForm.addEventListener("submit", event => {
        event.preventDefault();
        saveProfile();
    });

    saveSettingsButton.addEventListener("click", saveSettings);
}

function loadProfile() {
    const data = getStudyOSData();
    const profile = data.profile || {};

    profileNameInput.value = profile.name || "";
    profileEmailInput.value = profile.email || "";
    profileCollegeInput.value = profile.college || "";
    profileCourseInput.value = profile.course || "";
    profileSemesterInput.value = profile.semester || "";

    updateProfileOverview(profile);
}

function updateProfileOverview(profile) {
    const nameElement = document.getElementById(
        "profile-display-name"
    );

    const courseElement = document.getElementById(
        "profile-display-course"
    );

    const emailElement = document.getElementById(
        "profile-display-email"
    );

    const collegeElement = document.getElementById(
        "profile-display-college"
    );

    const semesterElement = document.getElementById(
        "profile-display-semester"
    );

    nameElement.textContent =
        profile.name?.trim() || "Student";

    courseElement.textContent =
        profile.course?.trim() || "Student";

    emailElement.textContent =
        profile.email?.trim() || "Not added";

    collegeElement.textContent =
        profile.college?.trim() || "Not added";

    semesterElement.textContent =
        profile.semester?.trim() || "Not added";
}

function saveProfile() {
    const data = getStudyOSData();

    data.profile = {
        name: profileNameInput.value.trim(),
        email: profileEmailInput.value.trim(),
        college: profileCollegeInput.value.trim(),
        course: profileCourseInput.value.trim(),
        semester: profileSemesterInput.value
    };

    saveStudyOSData(data);

    updateProfileOverview(data.profile);
    updateStudentName();

    showSavedState(
        saveProfileButton,
        "Profile Saved"
    );
}

function loadSettings() {
    const data = getStudyOSData();
    const settings = data.settings || {};

    dailyGoalInput.value =
        settings.dailyGoal ?? 2;

    pomodoroDurationInput.value =
        settings.pomodoroDuration ?? 25;

    shortBreakInput.value =
        settings.shortBreak ?? 5;

    longBreakInput.value =
        settings.longBreak ?? 15;
}

function saveSettings() {
    const data = getStudyOSData();

    if (!data.settings) {
        data.settings = {};
    }

    data.settings.dailyGoal =
        Number(dailyGoalInput.value) || 2;

    data.settings.pomodoroDuration =
        Number(pomodoroDurationInput.value) || 25;

    data.settings.shortBreak =
        Number(shortBreakInput.value) || 5;

    data.settings.longBreak =
        Number(longBreakInput.value) || 15;

    saveStudyOSData(data);

    showSavedState(
        saveSettingsButton,
        "Preferences Saved"
    );
}

function showSavedState(button, text) {
    const originalHTML = button.innerHTML;

    button.innerHTML = `
        <i class="fa-solid fa-check"></i>
        ${text}
    `;

    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }, 1500);
}