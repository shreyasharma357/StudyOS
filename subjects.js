/* RUN WHEN PAGE LOADS */
document.addEventListener("DOMContentLoaded", function () {
    // 1. Grab DOM Elements
    const subjectsGrid = document.getElementById("subjects-grid");
    const emptyState = document.getElementById("subjects-empty-state");
    const addSubjectBtn = document.getElementById("add-subject-btn");
    const emptyAddSubjectBtn = document.getElementById("empty-add-subject-btn");

    // Helper Function: Calculate Course Progress
    function calculateProgress(subject) {
        if (!subject.topics || subject.topics.length === 0) return 0;
        const completedTopics = subject.topics.filter(t => t.completed).length;
        return Math.round((completedTopics / subject.topics.length) * 100);
    }

    // 2. Render Subjects from common.js Data
    function renderSubjects() {
        try {
            const data = getStudyOSData();
            const subjects = data.subjects || [];

            // Clear existing cards
            const existingCards = document.querySelectorAll(".subject-card");
            existingCards.forEach(card => card.remove());

            // Toggle Empty State
            if (subjects.length === 0) {
                if (emptyState) emptyState.style.display = "flex";
            } else {
                if (emptyState) emptyState.style.display = "none";
                subjects.forEach(subject => createSubjectCard(subject));
            }
        } catch (error) {
            console.error("Error loading subjects from common.js:", error);
        }
    }

    // 3. Create Subject Card
    function createSubjectCard(subject) {
        const card = document.createElement("div");
        card.className = "subject-card";
        
        // Ensure data is accurate
        const topicsCount = subject.topics ? subject.topics.length : 0;
        const progress = subject.progress || 0;
        
        card.innerHTML = `
            <div class="subject-card-header">
                <div class="subject-info">
                    <div class="subject-icon"><i class="fa-solid fa-book"></i></div>
                    <div>
                        <div class="subject-name">${subject.name}</div>
                        <div class="subject-code">${subject.code}</div>
                    </div>
                </div>
                <button class="subject-menu delete-btn" title="Delete Subject">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            
            <div class="subject-progress">
                <div class="progress-header">
                    <span class="progress-label">Course Progress</span>
                    <span class="progress-percentage">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
            </div>
            
            <div class="topic-summary">
                <div class="topic-count">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>${topicsCount} Topics</span>
                </div>
                <a href="#" class="view-topics view-btn">
                    View Topics <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        `;

        // Delete functionality
        card.querySelector(".delete-btn").addEventListener("click", function () {
            if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
                const data = getStudyOSData();
                let subjects = data.subjects || [];
                subjects = subjects.filter(sub => sub.id !== subject.id);
                updateStudyOSData("subjects", subjects);
                renderSubjects();
            }
        });

        // View topics functionality
        card.querySelector(".view-btn").addEventListener("click", function (e) {
            e.preventDefault();
            openTopicsModal(subject);
        });

        if (subjectsGrid && emptyState) {
            subjectsGrid.insertBefore(card, emptyState);
        }
    }

    // 4. Custom "Add Subject" Popup
    function openAddSubjectModal() {
        const modal = document.createElement("div");
        modal.className = "topics-model"; 
        
        modal.innerHTML = `
            <div class="topics-model-content" style="max-width: 400px;">
                <div class="topics-model-header" style="margin-bottom: 15px;">
                    <h2>Add New Subject</h2>
                    <button class="topics-model-close" id="close-add-modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="text" id="new-subject-input" placeholder="e.g. Mathematics" 
                           style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: transparent; color: var(--text-primary); font-family: inherit; font-size: 1rem; outline: none;">
                    <button id="confirm-add-btn" class="btn btn-primary" style="width: 100%;">
                        Create Subject
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const input = modal.querySelector("#new-subject-input");
        input.focus(); 

        function saveNewSubject() {
            const name = input.value.trim();
            if (name !== "") {
                const data = getStudyOSData();
                const subjects = data.subjects || [];

                subjects.push({
                    id: "sub_" + Date.now(),
                    name: name,
                    code: "Code: SUB-" + Math.floor(Math.random() * 1000),
                    progress: 0,
                    topicsCount: 0,
                    topics: [] 
                });

                updateStudyOSData("subjects", subjects);
                renderSubjects();
                modal.remove(); 
            }
        }

        modal.querySelector("#confirm-add-btn").addEventListener("click", saveNewSubject);
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") saveNewSubject();
        });
        modal.querySelector("#close-add-modal").addEventListener("click", () => modal.remove());
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // 5. Topics Modal 
    function openTopicsModal(subject) {
        if (!subject.topics) subject.topics = [];

        const modal = document.createElement("div");
        modal.className = "topics-model";
        
        function generateTopicsListHTML() {
            if (subject.topics.length === 0) {
                return `
                    <div class="topics-empty-state" style="color: var(--text-secondary); text-align: center; padding: 40px 0;">
                        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-soft);"></i>
                        <p>No topics added for this subject yet.</p>
                    </div>
                `;
            } else {
                return `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">` + 
                    subject.topics.map((topic, index) => `
                        <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
                                <input type="checkbox" class="topic-checkbox" data-index="${index}" ${topic.completed ? 'checked' : ''} 
                                       style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent);">
                                <span style="color: var(--text-primary); font-weight: 500; transition: all 0.2s ease; ${topic.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">
                                    ${topic.name}
                                </span>
                            </label>
                            <button class="delete-topic-btn" data-index="${index}" style="background: none; border: none; color: red; cursor: pointer; padding: 5px; margin-left: 10px;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </li>
                    `).join('') + `</ul>`;
            }
        }

        modal.innerHTML = `
            <div class="topics-model-content">
                <div class="topics-model-header">
                    <div>
                        <div class="page-label">
                            <i class="fa-solid fa-book-open"></i> Topics
                        </div>
                        <h2>${subject.name} <span id="modal-progress-text" style="font-size: 1rem; color: var(--accent); margin-left: 10px;">(${subject.progress || 0}%)</span></h2>
                    </div>
                    <button class="topics-model-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                    <input type="text" id="new-topic-input" placeholder="Enter new topic..." 
                           style="flex: 1; padding: 10px 15px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: transparent; color: var(--text-primary); outline: none;">
                    <button id="add-topic-btn" class="btn btn-primary" style="padding: 10px 18px;">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>

                <div id="topics-list-container">
                    ${generateTopicsListHTML()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const topicInput = modal.querySelector("#new-topic-input");
        const listContainer = modal.querySelector("#topics-list-container");
        const progressText = modal.querySelector("#modal-progress-text");

        function updateSubjectState() {
            subject.topicsCount = subject.topics.length;
            subject.progress = calculateProgress(subject);
            
            const data = getStudyOSData();
            const sIndex = data.subjects.findIndex(s => s.id === subject.id);
            if (sIndex !== -1) {
                data.subjects[sIndex] = subject;
                updateStudyOSData("subjects", data.subjects);
            }

            progressText.innerText = `(${subject.progress}%)`;
            listContainer.innerHTML = generateTopicsListHTML();
            bindListEvents();
            renderSubjects();
        }

        function saveTopic() {
            const topicName = topicInput.value.trim();
            if (topicName !== "") {
                subject.topics.push({ name: topicName, completed: false });
                topicInput.value = ""; 
                updateSubjectState();
            }
        }

        function bindListEvents() {
            const deleteBtns = listContainer.querySelectorAll(".delete-topic-btn");
            deleteBtns.forEach(btn => {
                btn.addEventListener("click", function() {
                    const idx = this.getAttribute("data-index");
                    subject.topics.splice(idx, 1);
                    updateSubjectState();
                });
            });

            const checkboxes = listContainer.querySelectorAll(".topic-checkbox");
            checkboxes.forEach(chk => {
                chk.addEventListener("change", function() {
                    const idx = this.getAttribute("data-index");
                    subject.topics[idx].completed = this.checked;
                    updateSubjectState();
                });
            });
        }

        modal.querySelector("#add-topic-btn").addEventListener("click", saveTopic);
        topicInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") saveTopic();
        });
        bindListEvents();

        modal.querySelector(".topics-model-close").addEventListener("click", () => modal.remove());
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // 6. Attach Event Listeners to Main Page Buttons
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener("click", function(e) {
            e.preventDefault();
            openAddSubjectModal();
        });
    }
    
    if (emptyAddSubjectBtn) {
        emptyAddSubjectBtn.addEventListener("click", function(e) {
            e.preventDefault();
            openAddSubjectModal();
        });
    }

    // 7. Initialize Page
    renderSubjects();
});