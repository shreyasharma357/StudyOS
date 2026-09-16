/*STUDYOS STORAGE KEY */
const STUDYOS_STORAGE_KEY = "studyOSData";
/*DEFAULT DATA*/
const defaultStudyOSData = {
    profile: {
        name: "Student",
        email: "",
        college: "",
        course: "",
        semester: ""
    },
    subjects: [],
    task: [],
    studySessions: [],
    achievements: [],
    settings: {
        dailyGoal: 2,
        pomodoroDuration: 25,
        shortBreak: 5,
        longBreak: 15
    }
};
/*LOAD DATA FROM LOCALSTORAGE*/
function getStudyOSData() {
    const savedData = localStorage.getItem(STUDYOS_STORAGE_KEY);
    if (!savedData) {
        localStorage.setItem(
            STUDYOS_STORAGE_KEY,
            JSON.stringify(defaultStudyOSData)
        );
        return structuredClone(defaultStudyOSData);
    }
    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error(
            "Unable to read StudyOS data:",
            error
        );
        localStorage.setItem(
            STUDYOS_STORAGE_KEY,
            JSON.stringify(defaultStudyOSData)
        );
        return structuredClone(defaultStudyOSData);
    }
}
/*SAVE DATA TO LOCALSTORAGE*/
function saveStudyOSData(data) {
    localStorage.setItem(
        STUDYOS_STORAGE_KEY,
        JSON.stringify(data)
    );
}
/*UPDATE A SPECIFIC SECTION*/
function updateStudyOSData(section, value) {
    const data = getStudyOSData();
    data[section] = value;
    saveStudyOSData(data);
    return data;
}
/*DYNAMIC GREETING*/
function updateGreeting() {
    const greetingElement = document.getElementById("greeting");
    if (!greetingElement) {
        return;
    }
    const currentHour = new Date().getHours();
    let greeting;
    if (currentHour >= 5 && currentHour < 12) {

        greeting = "Good Morning";

    } else if (currentHour >= 12 && currentHour < 17) {

        greeting = "Good Afternoon";

    } else if (currentHour >= 17 && currentHour < 21) {

        greeting = "Good Evening";

    } else {

        greeting = "Good Night";

    }
    greetingElement.textContent = greeting;
}
/*UPDATE STUDENT NAME*/
function updateStudentName() {
    const nameElement = document.getElementById("student-name");
    if (!nameElement) {
        return;
    }
    const data = getStudyOSData();
    const studentName = data.profile?.name?.trim();
    if (studentName) {
        nameElement.textContent = studentName;
    } else {
        nameElement.textContent = "Student";
    }
}
/*DATE HELPER*/
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
/*FORMAT DATE*/
function formatDate(dateString) {
    if (!dateString) {
        return "";
    }
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
/*INITIALIZE STUDYOS*/
function initializeStudyOS() {
    updateGreeting();
    updateStudentName();
    initializeLogoMenu();
}
/*RUN WHEN PAGE LOADS*/
document.addEventListener(
    "DOMContentLoaded",
    initializeStudyOS
);
function initializeLogoMenu() {
    const logoTrigger = document.getElementById("logo-menu-trigger");
    const logoMenu = document.getElementById("logo-menu");
    const logoOverlay = document.getElementById("logo-menu-overlay");
    const logoClose = document.getElementById("logo-menu-close");

    if (!logoTrigger || !logoMenu || !logoOverlay || !logoClose) {
        return;
    }

    function openLogoMenu() {
        logoMenu.classList.add("open");
        logoOverlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeLogoMenu() {
        logoMenu.classList.remove("open");
        logoOverlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    logoTrigger.addEventListener("click", openLogoMenu);
    logoClose.addEventListener("click", closeLogoMenu);
    logoOverlay.addEventListener("click", closeLogoMenu);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeLogoMenu();
        }
    });

    logoMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeLogoMenu);
    });
}
console.log("common.js is working!");