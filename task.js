const taskList =
    document.getElementById("task-list");
const tasksEmptyState =
    document.getElementById("tasks-empty-state");
const addTaskButton =
    document.getElementById("add-task-btn");
const emptyAddTaskButton =
    document.getElementById("empty-add-task-btn");
const totalTasksElement =
    document.getElementById("total-tasks");
const pendingTasksElement =
    document.getElementById("pending-tasks");
const completedTasksElement =
    document.getElementById("completed-tasks");
const dueTodayElement =
    document.getElementById("due-today");
const filterButtons =
    document.querySelectorAll(".filter-btn");
const taskSort =
    document.getElementById("task-sort");
let currentFilter = "all"; /* State */
let currentSort = "date";
function generateTaskId() { /*Generate Id*/
    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}
function escapeTaskHTML(text) { /*Escape HTMl*/
    const div =
        document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}
function getSubjectName(subjectId, data) { /*subject name */
    const subjects =
        data.subjects || [];
    const subject =
        subjects.find(
            item => item.id === subjectId
        );
    return subject
        ? subject.name
        : "No Subject";
}
function updateTaskSummary() { /*udate summary*/
    const data =
        getStudyOSData();
    const tasks =
        data.tasks || [];
    const completedTasks =
        tasks.filter(
            task => task.completed
        );
    const pendingTasks =
        tasks.filter(
            task => !task.completed
        );
    const todayTasks =
        tasks.filter(
            task =>
                task.dueDate === getTodayDate()
        );
    totalTasksElement.textContent =
        tasks.length;
    pendingTasksElement.textContent =
        pendingTasks.length;
    completedTasksElement.textContent =
        completedTasks.length;
    dueTodayElement.textContent =
        todayTasks.length;
}
function getFilteredTasks(tasks) { /*Filter task */
    if (currentFilter === "pending") {
        return tasks.filter(
            task => !task.completed
        );
    }
    if (currentFilter === "completed") {
        return tasks.filter(
            task => task.completed
        );
    }
    return tasks;
}
function sortTasks(tasks) { /*Sort task*/
    const sortedTasks =
        [...tasks];
    /* Due Date */
    if (currentSort === "date") {
        sortedTasks.sort((a, b) => {
            const dateA =
                a.dueDate || "9999-12-31";
            const dateB =
                b.dueDate || "9999-12-31";
            return (
                new Date(dateA) -
                new Date(dateB)
            );
        });
    }
    /* Priority */
    if (currentSort === "priority") {
        const priorityOrder = {
            high: 1,
            medium: 2,
            low: 3
        };
        sortedTasks.sort((a, b) => {
            return (
                (priorityOrder[a.priority] || 2) -
                (priorityOrder[b.priority] || 2)
            );
        });
    }
    /* Recently Added */
    if (currentSort === "created") {
        sortedTasks.sort((a, b) => {
            return (
                (b.createdAt || 0) -
                (a.createdAt || 0)
            );
        });
    }
    return sortedTasks;
}
function renderTasks() { /*Render Task*/
    const data =
        getStudyOSData();
    let tasks =
        data.tasks || [];
    tasks =
        getFilteredTasks(tasks);
    tasks =
        sortTasks(tasks);
    taskList.innerHTML = "";
    /* No tasks */
    if (tasks.length === 0) {
        taskList.style.display = "none";
        tasksEmptyState.style.display = "flex";
        return;
    }
    /* Tasks available */
    taskList.style.display = "flex";
    tasksEmptyState.style.display = "none";
    tasks.forEach(task => {
        const taskCard =
            createTaskCard(
              task,
                data
            );
        taskList.appendChild(
            taskCard
        );
    });
}
function createTaskCard(task, data) { /*create atsk card */
    const taskCard =
        document.createElement("div");
    taskCard.className =
        "task-card";
    if (task.completed) {
        taskCard.classList.add(
            "completed"
        );
    }
    const subjectName =
        getSubjectName(
            task.subjectId,
            data
        );
    const priority =
        task.priority || "medium";
    const dueDate =
        task.dueDate
            ? formatDate(task.dueDate)
            : "No due date";
    taskCard.innerHTML = `
        <button
            type="button"
            class="task-checkbox ${
                task.completed
                    ? "checked"
                    : ""
            }"
            data-action="toggle"
            data-id="${task.id}"
            title="${
                task.completed
                    ? "Mark as pending"
                    : "Mark as completed"
            }"
        >
            ${
                task.completed
                    ? '<i class="fa-solid fa-check"></i>'
                    : ""
            }
        </button>
        <div class="task-content">
            <div class="task-title-row">
                <h3 class="task-title">
                    ${escapeTaskHTML(
                        task.title
                    )}
                </h3>
                <span
                    class="task-priority ${priority}"
                >
                    ${
                        priority
                            .charAt(0)
                            .toUpperCase() +
                        priority.slice(1)
                    }
                </span>
            </div>
            ${
                task.description
                    ? `
                        <p class="task-description">
                            ${escapeTaskHTML(
                                task.description
                            )}
                        </p>
                    `
                    : ""
            }
            <div class="task-meta">
                <span>
                    <i class="fa-solid fa-book"></i>
                    ${escapeTaskHTML(
                        subjectName
                    )}
                </span>
                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${dueDate}
                </span>
            </div>
        </div>
        <div class="task-actions">
            <button
                type="button"
                class="icon-button"
                data-action="edit"
                data-id="${task.id}"
                title="Edit task"
            >
                <i class="fa-solid fa-pen"></i>
            </button>
            <button
                type="button"
                class="icon-button danger"
                data-action="delete"
                data-id="${task.id}"
                title="Delete task"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    return taskCard;
                }
function openTaskModal(task = null) { /*Open Task Model*/
    const data =
        getStudyOSData();
    const existingModal =
        document.getElementById(
            "task-modal"
        );
    if (existingModal) {

        existingModal.remove();
    }
    const modal =
        document.createElement("div");
    modal.className =
        "task-modal";
    modal.id =
        "task-modal";
    const isEditing =
        Boolean(task);
    const subjects =
        data.subjects || [];
    let subjectOptions = "";
    if (subjects.length > 0) {
        subjectOptions =
            subjects.map(subject => {
                return `
                    <option
                        value="${subject.id}"
                        ${
                            task?.subjectId === subject.id
                                ? "selected"
                                : ""
                        }
                    >
                        ${escapeTaskHTML(
                            subject.name
                        )}
                    </option>
                `;
            }).join("");
    } else {
        subjectOptions = `
            <option value="">
                No subjects available
            </option>
        `;
    }
    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <div>
                    <h2>
                        ${
                            isEditing
                                ? "Edit Task"
                                : "Add Task"
                        }
                    </h2>
                    <p>
                        ${
                            isEditing
                                ? "Update your task details."
                                : "Create a new task."
                        }
                    </p>
                </div>
                <button
                    type="button"
                    class="task-modal-close"
                    id="close-task-modal"
                    title="Close"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <form id="task-form">
                <!-- TITLE -->
                <div class="form-group">
                    <label for="task-title">
                        Task Title
                    </label>
                    <input
                        type="text"
                        id="task-title"
                        placeholder="Enter task title"
                        value="${
                            escapeTaskHTML(
                                task?.title || ""
                            )
                        }"
                        required
                    >
                </div>
                <!-- DESCRIPTION -->
                <div class="form-group">
                    <label for="task-description">
                        Description
                    </label>
                    <textarea
                        id="task-description"
                        placeholder="Add a description (optional)"
                    >${
                        escapeTaskHTML(
                            task?.description || ""
                        )
                    }</textarea>
                </div>
                <!-- SUBJECT + DATE -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="task-subject">
                            Subject
                        </label>
                        <select id="task-subject">
                            ${subjectOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="task-date">
                            Due Date
                        </label>
                        <input
                            type="date"
                            id="task-date"
                            value="${
                                task?.dueDate ||
                                getTodayDate()
                            }"
                        >
                    </div>
                </div>
                <!-- PRIORITY -->
                <div class="form-group">
                    <label for="task-priority">
                        Priority
                    </label>
                    <select id="task-priority">
                        <option
                            value="low"
                            ${
                                task?.priority === "low"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Low
                        </option>
                        <option
                            value="medium"
                            ${
                                !task ||
                                task.priority === "medium"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Medium
                        </option>
                        <option
                            value="high"
                            ${
                                task?.priority === "high"
                                    ? "selected"
                                    : ""
                            }
                        >
                            High
                        </option>
                    </select>
                </div>
                <div class="form-actions"> <!-- Form Action -->
                    <button
                        type="button"
                        class="btn btn-secondary"
                        id="cancel-task">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary">
                        <i class="fa-solid fa-check"></i>
                        ${
                            isEditing
                                ? "Save Changes"
                                : "Add Task"
                        }
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(
        modal
    );
    setTimeout(() => {
        modal.classList.add(
            "show"
        );
    }, 10);
    /* Form submit */
    const form =
        document.getElementById(
            "task-form"        
        );
    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            saveTask(
                task?.id || null
            );
        }
    );
    /* Close button */
    document
        .getElementById(
            "close-task-modal"
        )
        .addEventListener(
            "click",
            closeTaskModal
        );
    /* Cancel */
    document
        .getElementById(
            "cancel-task"
        )
        .addEventListener(
            "click",
            closeTaskModal
        );
    /* Click outside */
    modal.addEventListener(
        "click",
        event => {
            if (
                event.target === modal
            ) {
                closeTaskModal();
            }
        }
    );
    /* Escape key */
    document.addEventListener(
        "keydown",
        handleEscapeKey
    );
}
function handleEscapeKey(event) { /*Escape Key */
    if (event.key === "Escape") {
        closeTaskModal();
    }
}
function closeTaskModal() { /*Close Modal */
    const modal =
        document.getElementById(
            "task-modal"
        );
    if (!modal) {

        return;
    }
    modal.classList.remove(
        "show"
    );
    document.removeEventListener(
        "keydown",
        handleEscapeKey
    );
    setTimeout(() => {
        if (modal) {
            modal.remove();
        }
    }, 250);
}
function saveTask(taskId = null) { /*Save Task */
    const data =
        getStudyOSData();
    const title =
        document
            .getElementById(
                "task-title"
            )
            .value
            .trim()
    const description =
        document
            .getElementById(
                "task-description"
            )
            .value
            .trim();
    const subjectId =
        document
            .getElementById(
                "task-subject"
            )
            .value;
    const dueDate =
        document
            .getElementById(
                "task-date"
            )
            .value;
    const priority =
        document
            .getElementById(
                "task-priority"
            )
            .value;
    if (!title) {
        alert(
            "Please enter a task title."
        );
        return;
    }
    /* Editing existing task */
    if (taskId) {
        const task =
            data.tasks.find(
                item =>
                    item.id === taskId
            );
        if (task) {
            task.title =
                title;
            task.description =
                description;
            task.subjectId =
                subjectId;
            task.dueDate =
                dueDate;
            task.priority =
                priority;
        }
    }
    /* Creating new task */
    else {
        data.tasks.push({
            id:
                generateTaskId(),
            title:
                title,
            description:
                description,
            subjectId:
                subjectId,
            dueDate:
                dueDate,
            priority:
                priority,
            completed:
                false,
            createdAt:
                Date.now()

        });
    }
    saveStudyOSData(
        data
    );
    closeTaskModal();
    updateTaskSummary();
    renderTasks();
}
function toggleTask(taskId) { /* Toggle Task */
    const data =
        getStudyOSData();
    const task =
        data.tasks.find(
            item =>
                item.id === taskId
        );
    if (!task) {
        return;
    }
    task.completed =
        !task.completed;
    saveStudyOSData(
        data
    );
    updateTaskSummary();
    renderTasks();
}
function editTask(taskId) { /*Edit Task*/
    const data =
        getStudyOSData();
    const task =
        data.tasks.find(
            item =>
                item.id === taskId
        );
    if (!task) {

        return;
    }
    openTaskModal(
        task
    );
}
function deleteTask(taskId) { /*Delete Task*/
    const data =
        getStudyOSData();
    const task =
        data.tasks.find(
            item =>
                item.id === taskId
        );
    if (!task) {

        return;
    }
    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );
    if (!confirmed) {

        return;
    }
    data.tasks =
        data.tasks.filter(
            item =>
                item.id !== taskId
        );
    saveStudyOSData(
        data
    );
    updateTaskSummary();
    renderTasks();
}
taskList.addEventListener( /*Task Action*/
    "click",
    event => {
        const button =
            event.target.closest(
                "[data-action]"
            );
        if (!button) {

            return;
        }
        const action =
            button.dataset.action;
        const taskId =
            button.dataset.id;
        if (
            action === "toggle"
        ) {
            toggleTask(
                taskId
            );
        }
        if (
            action === "edit"
        ) {
            editTask(
                taskId
            );
        }
        if (
            action === "delete"
        ) {
            deleteTask(
                taskId
            );
        }
    }
);
filterButtons.forEach( /*Filter Buttons */
    button => {
        button.addEventListener(
            "click",
            () => {
                filterButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );
                button.classList.add(
                    "active"
                );
                currentFilter =
                    button.dataset.filter;
                renderTasks();
            }
        );
    }
);
taskSort.addEventListener( /*sort*/
    "change",
    () => {
        currentSort =
            taskSort.value;
        renderTasks();
    }
);
addTaskButton.addEventListener( /*add task*/
    "click",
    () => {
        openTaskModal();
    }
);
emptyAddTaskButton.addEventListener(
    "click",
    () => {
        openTaskModal();
    }
);
function initializeTasks() { /*Initialize*/
    updateTaskSummary();
    renderTasks();
}
document.addEventListener(
    "DOMContentLoaded",
    initializeTasks
);