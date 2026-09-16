const AI_CHAT_STORAGE_KEY = "studyOSAIChat";

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const clearChatButton = document.getElementById("clear-chat");
const sendMessageButton = document.getElementById("send-message");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");

document.addEventListener("DOMContentLoaded", () => {
    loadChat();
    setupChatEvents();
});

function setupChatEvents() {
    chatForm.addEventListener("submit", handleSubmit);

    clearChatButton.addEventListener("click", clearChat);

    suggestionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const question = button.dataset.question;

            if (!question) {
                return;
            }

            chatInput.value = question;
            chatInput.focus();
            autoResizeInput();
        });
    });

    chatInput.addEventListener("input", autoResizeInput);

    chatInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            chatForm.requestSubmit();
        }
    });
}

function handleSubmit(event) {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    addMessage("user", message);
    saveMessage("user", message);

    chatInput.value = "";
    autoResizeInput();

    showTypingIndicator();

    sendMessageButton.disabled = true;

    setTimeout(() => {
        removeTypingIndicator();

        const response = generateAIResponse(message);

        addMessage("assistant", response);
        saveMessage("assistant", response);

        sendMessageButton.disabled = false;
        chatInput.focus();
    }, 700);
}

function addMessage(type, text) {
    const message = document.createElement("div");

    message.className =
        type === "user"
            ? "message user-message"
            : "message assistant-message";

    const icon =
        type === "user"
            ? "fa-user"
            : "fa-robot";

    const name =
        type === "user"
            ? "You"
            : "StudyOS AI";

    message.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid ${icon}"></i>
        </div>

        <div class="message-content">
            <span class="message-name">${name}</span>

            <div class="message-bubble"></div>
        </div>
    `;

    const bubble = message.querySelector(".message-bubble");
    bubble.textContent = text;

    chatMessages.appendChild(message);
    scrollToBottom();
}

function generateAIResponse(message) {
    const text = message.toLowerCase();

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return "Hello! I'm your StudyOS Assistant. What would you like to study today?";
    }

    if (
        text.includes("data structure") ||
        text.includes("stack") ||
        text.includes("queue") ||
        text.includes("array") ||
        text.includes("linked list")
    ) {
        return "Data structures are ways of organizing and storing data so it can be used efficiently. Common examples include arrays, linked lists, stacks, queues, trees, and graphs.";
    }

    if (
        text.includes("stack")
    ) {
        return "A stack is a linear data structure that follows LIFO: Last In, First Out. The main operations are push, pop, and peek.";
    }

    if (
        text.includes("queue")
    ) {
        return "A queue is a linear data structure that follows FIFO: First In, First Out. Elements are usually inserted using enqueue and removed using dequeue.";
    }

    if (
        text.includes("study plan") ||
        text.includes("study schedule") ||
        text.includes("timetable")
    ) {
        return "Try dividing your study time into focused sessions. For example: 25 minutes of focused study, a 5-minute break, and then another focus session. Prioritize difficult subjects when your energy is highest.";
    }

    if (
        text.includes("javascript") ||
        text.includes("js")
    ) {
        return "JavaScript is a programming language commonly used to make websites interactive. In StudyOS, JavaScript handles features such as tasks, subjects, the focus timer, analytics, LocalStorage, and this AI Assistant.";
    }

    if (
        text.includes("html")
    ) {
        return "HTML provides the structure of a webpage. Elements such as headings, paragraphs, buttons, forms, links, and sections are created using HTML.";
    }

    if (
        text.includes("css")
    ) {
        return "CSS controls the appearance and layout of webpages. It handles things like colors, spacing, typography, responsive layouts, animations, and positioning.";
    }

    if (
        text.includes("localstorage") ||
        text.includes("local storage")
    ) {
        return "LocalStorage lets a frontend application save data directly in the browser. StudyOS uses it to store subjects, tasks, study sessions, achievements, settings, and profile information without needing a backend.";
    }

    if (
        text.includes("pomodoro") ||
        text.includes("focus")
    ) {
        return "The Pomodoro technique breaks studying into focused work sessions followed by short breaks. StudyOS has a built-in Focus page where you can configure your focus and break durations.";
    }

    if (
        text.includes("exam") ||
        text.includes("revision")
    ) {
        return "For exam preparation, start by listing your subjects and topics. Prioritize weak areas, study in focused sessions, revise regularly, and use practice questions to test your understanding.";
    }

    if (
        text.includes("motivat") ||
        text.includes("procrastinat")
    ) {
        return "Start with a small task instead of trying to finish everything at once. Set a short focus session, remove distractions, and concentrate only on the next task. Progress becomes easier once you start.";
    }

    if (
        text.includes("thank")
    ) {
        return "You're welcome. Keep going and stay consistent with your studies.";
    }

    return "I can help with basic study and programming questions in this frontend demo. Try asking me about data structures, JavaScript, HTML, CSS, LocalStorage, Pomodoro studying, or creating a study plan.";
}

function saveMessage(type, text) {
    const chat = getSavedChat();

    chat.push({
        type,
        text,
        timestamp: Date.now()
    });

    localStorage.setItem(
        AI_CHAT_STORAGE_KEY,
        JSON.stringify(chat)
    );
}

function getSavedChat() {
    const savedChat =
        localStorage.getItem(AI_CHAT_STORAGE_KEY);

    if (!savedChat) {
        return [];
    }

    try {
        const chat = JSON.parse(savedChat);

        return Array.isArray(chat) ? chat : [];
    } catch (error) {
        console.error("Unable to load AI chat:", error);
        return [];
    }
}

function loadChat() {
    const chat = getSavedChat();

    if (!chat.length) {
        return;
    }

    chat.forEach(message => {
        if (
            message.type === "user" ||
            message.type === "assistant"
        ) {
            addMessage(
                message.type,
                message.text
            );
        }
    });
}

function clearChat() {
    const confirmed = confirm(
        "Are you sure you want to clear this conversation?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(AI_CHAT_STORAGE_KEY);

    chatMessages.innerHTML = `
        <div class="message assistant-message">

            <div class="message-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>

            <div class="message-content">
                <span class="message-name">StudyOS AI</span>

                <div class="message-bubble">
                    Hello! I'm your StudyOS Assistant.
                    Ask me anything about your studies,
                    programming, or concepts you want to understand.
                </div>
            </div>

        </div>
    `;
}

function showTypingIndicator() {
    if (document.getElementById("typing-indicator")) {
        return;
    }

    const typingMessage = document.createElement("div");

    typingMessage.className =
        "message assistant-message";

    typingMessage.id = "typing-indicator";

    typingMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="message-content">
            <span class="message-name">StudyOS AI</span>

            <div class="message-bubble typing-bubble">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatMessages.appendChild(typingMessage);
    scrollToBottom();
}

function removeTypingIndicator() {
    document
        .getElementById("typing-indicator")
        ?.remove();
}

function autoResizeInput() {
    chatInput.style.height = "auto";

    chatInput.style.height =
        `${Math.min(chatInput.scrollHeight, 140)}px`;
}

function scrollToBottom() {
    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}