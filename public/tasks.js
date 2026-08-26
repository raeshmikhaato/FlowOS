let currentTasks = [];
let currentProjects = [];


/* =========================================================
   FLOWOS SETTINGS
========================================================= */

function getFlowOSSettings() {

    const defaults = {
        priority: "medium",
        weekStart: "sunday"
    };

    try {

        const saved =
            localStorage.getItem("flowosSettings");

        if (!saved) {
            return defaults;
        }

        return {
            ...defaults,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "FlowOS: Could not read settings.",
            error
        );

        return defaults;
    }
}


function getDefaultTaskPriority() {

    const settings =
        getFlowOSSettings();

    if (
        ["low", "medium", "high"]
            .includes(settings.priority)
    ) {
        return settings.priority;
    }

    return "medium";
}


function applyDefaultTaskPriority() {

    const select =
        document.getElementById(
            "task-priority"
        );

    if (select) {

        select.value =
            getDefaultTaskPriority();

    }
}


/* =========================================================
   DOM
========================================================= */

const addTaskButton =
    document.getElementById(
        "add-task-button"
    );

const cancelTaskButton =
    document.getElementById(
        "cancel-task-button"
    );

const taskFormContainer =
    document.getElementById(
        "task-form-container"
    );

const taskForm =
    document.getElementById(
        "task-form"
    );

const taskList =
    document.getElementById(
        "task-list"
    );

const taskSearch =
    document.getElementById(
        "task-search"
    );

const priorityFilter =
    document.getElementById(
        "priority-filter"
    );

const statusFilter =
    document.getElementById(
        "status-filter"
    );

const clearFiltersButton =
    document.getElementById(
        "clear-filters"
    );

const taskResultsCount =
    document.getElementById(
        "task-results-count"
    );

const projectSelect =
    document.getElementById(
        "task-project"
    );


/* =========================================================
   PROGRESS BAR VISUAL FIX
   IMPORTANT:
   This is injected from JavaScript so the existing
   conflicting CSS cannot hide the filled portion.
========================================================= */

(function installProgressBarFix() {

    const style =
        document.createElement("style");

    style.id =
        "flowos-progress-final-fix";

    style.textContent = `

        .progress-section .progress-track {
            position: relative !important;
            width: 100% !important;
            height: 10px !important;
            overflow: hidden !important;
            border-radius: 999px !important;
            background: #303542 !important;
        }

        .progress-section #progress-bar {
            display: block !important;
            height: 100% !important;
            min-height: 10px !important;
            max-height: 10px !important;
            border-radius: 999px !important;
            background: #22c55e !important;
            transition: width 0.4s ease !important;
            opacity: 1 !important;
            visibility: visible !important;
        }

        html.dark-theme
        .progress-section
        #progress-bar,

        body.dark-theme
        .progress-section
        #progress-bar {

            background: #22c55e !important;

        }

        html:not(.dark-theme)
        .progress-section
        #progress-bar,

        body:not(.dark-theme)
        .progress-section
        #progress-bar {

            background: #22c55e !important;

        }

    `;

    document.head.appendChild(style);

})();


/* =========================================================
   FORM OPEN
========================================================= */

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        () => {

            if (taskFormContainer) {

                taskFormContainer.classList.add(
                    "visible"
                );

            }

            applyDefaultTaskPriority();

        }
    );

}


/* =========================================================
   FORM CANCEL
========================================================= */

if (cancelTaskButton) {

    cancelTaskButton.addEventListener(
        "click",
        () => {

            if (taskForm) {
                taskForm.reset();
            }

            if (taskFormContainer) {

                taskFormContainer.classList.remove(
                    "visible"
                );

            }

        }
    );

}


/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjectsForTaskForm() {

    try {

        const response =
            await fetch(
                "/api/projects",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch projects."
            );

        }

        currentProjects =
            await response.json();

        if (!projectSelect) {
            return;
        }

        projectSelect.innerHTML = `
            <option value="">
                No project
            </option>
        `;

        currentProjects.forEach(
            project => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    project.id;

                option.textContent =
                    project.name;

                projectSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );

    }
}


/* =========================================================
   GET PROJECT NAME
========================================================= */

function getProjectName(
    projectId
) {

    if (
        projectId === null ||
        projectId === undefined
    ) {
        return null;
    }

    const project =
        currentProjects.find(
            item =>
                Number(item.id) ===
                Number(projectId)
        );

    return project
        ? project.name
        : null;
}


/* =========================================================
   CREATE TASK
========================================================= */

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const title =
                document
                    .getElementById(
                        "task-title"
                    )
                    ?.value
                    .trim();

            const priority =
                document
                    .getElementById(
                        "task-priority"
                    )
                    ?.value ||
                getDefaultTaskPriority();

            const estimatedMinutes =
                document
                    .getElementById(
                        "task-time"
                    )
                    ?.value;

            const projectId =
                projectSelect &&
                projectSelect.value
                    ? Number(
                        projectSelect.value
                    )
                    : null;

            if (
                !title ||
                !estimatedMinutes
            ) {

                alert(
                    "Please enter a task title and estimated time."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/tasks",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    title,

                                    priority,

                                    estimatedMinutes:
                                        Number(
                                            estimatedMinutes
                                        ),

                                    projectId

                                })

                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (!response.ok) {

                    alert(
                        data.errors
                            ? data.errors.join(
                                "\n"
                            )
                            : data.message ||
                              "Failed to create task."
                    );

                    return;
                }

                const selectedProject =
                    currentProjects.find(
                        project =>
                            Number(project.id) ===
                            Number(projectId)
                    );

                data.projectId =
                    projectId;

                data.projectName =
                    selectedProject
                        ? selectedProject.name
                        : null;

                currentTasks.unshift(
                    data
                );

                updateTaskStats(
                    currentTasks
                );

                filterTasks();

                taskForm.reset();

                applyDefaultTaskPriority();

                if (taskFormContainer) {

                    taskFormContainer.classList.remove(
                        "visible"
                    );

                }

            } catch (error) {

                console.error(
                    "Error creating task:",
                    error
                );

                alert(
                    "Unable to create task. Please check that the FlowOS server is running."
                );

            }

        }
    );

}


/* =========================================================
   CREATE TASK CARD
========================================================= */

function createTaskElement(
    task
) {

    const taskCard =
        document.createElement(
            "article"
        );

    taskCard.className =
        "task-card";

    if (task.completed) {

        taskCard.classList.add(
            "completed"
        );

    }

    const priority =
        task.priority ||
        "medium";

    const projectName =
        task.projectName ||
        getProjectName(
            task.projectId
        ) ||
        "No project";

    taskCard.innerHTML = `

        <div class="task-checkbox">

            ${
                task.completed
                    ? "✓"
                    : ""
            }

        </div>


        <div class="task-details">

            <h2>
                ${escapeHtml(
                    task.title
                )}
            </h2>


            <div class="task-meta">

                <span
                    class="
                        priority
                        ${escapeHtml(priority)}
                    "
                >

                    ${
                        priority
                            .charAt(0)
                            .toUpperCase() +
                        priority.slice(1)
                    }

                    priority

                </span>


                <span>
                    ${task.estimatedMinutes || 0} min
                </span>


                <span>
                    ${escapeHtml(
                        projectName
                    )}
                </span>


                <span>
                    Today
                </span>

            </div>

        </div>


        <button
            class="delete-task-button"
            type="button"
        >
            Delete
        </button>

    `;

    taskList.appendChild(
        taskCard
    );

    addCheckboxBehavior(
        taskCard,
        task
    );

    addDeleteBehavior(
        taskCard,
        task
    );
}


/* =========================================================
   COMPLETE / UNCOMPLETE TASK
========================================================= */

function addCheckboxBehavior(
    taskCard,
    task
) {

    const checkbox =
        taskCard.querySelector(
            ".task-checkbox"
        );

    checkbox.addEventListener(
        "click",
        async () => {

            const updatedCompleted =
                !task.completed;

            try {

                const response =
                    await fetch(
                        `/api/tasks/${task.id}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        task.title,

                                    priority:
                                        task.priority ||
                                        "medium",

                                    estimatedMinutes:
                                        task.estimatedMinutes,

                                    completed:
                                        updatedCompleted,

                                    projectId:
                                        task.projectId
                                            ? Number(
                                                task.projectId
                                            )
                                            : null

                                })

                        }
                    );

                const responseData =
                    await response
                        .json()
                        .catch(
                            () => null
                        );

                if (!response.ok) {

                    console.error(
                        "Failed to update task:",
                        responseData
                    );

                    return;
                }

                task.completed =
                    Boolean(
                        responseData.completed
                    );

                if (
                    responseData.projectId !==
                    undefined
                ) {

                    task.projectId =
                        responseData.projectId;

                }

                if (
                    responseData.projectName
                ) {

                    task.projectName =
                        responseData.projectName;

                }

                updateTaskStats(
                    currentTasks
                );

                filterTasks();

            } catch (error) {

                console.error(
                    "Error updating task:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   DELETE TASK
========================================================= */

function addDeleteBehavior(
    taskCard,
    task
) {

    const deleteButton =
        taskCard.querySelector(
            ".delete-task-button"
        );

    deleteButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    `Delete "${task.title}"?`
                );

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `/api/tasks/${task.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {

                    console.error(
                        "Failed to delete task."
                    );

                    return;
                }

                currentTasks =
                    currentTasks.filter(
                        currentTask =>
                            currentTask.id !==
                            task.id
                    );

                updateTaskStats(
                    currentTasks
                );

                filterTasks();

            } catch (error) {

                console.error(
                    "Error deleting task:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   ⭐ ACTUAL PROGRESS BAR
========================================================= */

function updateOverallProgress(
    percentage
) {

    const progressBar =
        document.getElementById(
            "progress-bar"
        );

    if (!progressBar) {
        return;
    }

    const safePercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(percentage) || 0
            )
        );


    /*
       WIDTH + BACKGROUND ARE BOTH INLINE
       AND BOTH USE !important.
       Therefore the old dark-theme CSS
       cannot hide the filled portion.
    */

    progressBar.style.setProperty(
        "width",
        `${safePercentage}%`,
        "important"
    );

    progressBar.style.setProperty(
        "height",
        "100%",
        "important"
    );

    progressBar.style.setProperty(
        "min-height",
        "10px",
        "important"
    );

    progressBar.style.setProperty(
        "display",
        "block",
        "important"
    );

    progressBar.style.setProperty(
        "background",
        "#22c55e",
        "important"
    );

    progressBar.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    progressBar.style.setProperty(
        "visibility",
        "visible",
        "important"
    );

    progressBar.style.setProperty(
        "border-radius",
        "999px",
        "important"
    );

    progressBar.setAttribute(
        "aria-valuenow",
        safePercentage
    );

}


/* =========================================================
   TASK STATISTICS
========================================================= */

function updateTaskStats(
    tasks
) {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                Boolean(
                    task.completed
                )
        ).length;

    const active =
        total -
        completed;

    const completionRate =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    const totalElement =
        document.getElementById(
            "total-tasks"
        );

    const activeElement =
        document.getElementById(
            "active-tasks"
        );

    const completedElement =
        document.getElementById(
            "completed-tasks"
        );

    const completionElement =
        document.getElementById(
            "completion-rate"
        );

    const progressPercentage =
        document.getElementById(
            "progress-percentage"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }

    if (activeElement) {

        activeElement.textContent =
            active;

    }

    if (completedElement) {

        completedElement.textContent =
            completed;

    }

    if (completionElement) {

        completionElement.textContent =
            `${completionRate}%`;

    }

    if (progressPercentage) {

        progressPercentage.textContent =
            `${completionRate}%`;

    }


    /*
       THIS IS THE IMPORTANT PART.
    */

    updateOverallProgress(
        completionRate
    );


    /*
       Run once more after the browser has
       completed the current rendering cycle.
    */

    requestAnimationFrame(
        () => {

            updateOverallProgress(
                completionRate
            );

        }
    );

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    try {

        const response =
            await fetch(
                "/api/tasks",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch tasks."
            );

        }

        currentTasks =
            await response.json();

        currentTasks =
            currentTasks.map(
                task => {

                    if (
                        !task.priority
                    ) {

                        task.priority =
                            "medium";

                    }

                    if (
                        !task.projectName &&
                        task.projectId
                    ) {

                        task.projectName =
                            getProjectName(
                                task.projectId
                            );

                    }

                    return task;

                }
            );

        updateTaskStats(
            currentTasks
        );

        filterTasks();

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        if (taskList) {

            taskList.innerHTML = `

                <div class="task-empty-state">

                    <div class="task-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load tasks
                    </h3>

                    <p>
                        Please check that the FlowOS server is running.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   FILTER TASKS
========================================================= */

function filterTasks() {

    const searchTerm =
        (
            taskSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const selectedPriority =
        priorityFilter?.value ||
        "all";

    const selectedStatus =
        statusFilter?.value ||
        "all";


    const filteredTasks =
        currentTasks.filter(
            task => {

                const title =
                    String(
                        task.title ||
                        ""
                    )
                    .toLowerCase();

                const matchesSearch =
                    title.includes(
                        searchTerm
                    );

                const matchesPriority =
                    selectedPriority ===
                        "all" ||

                    task.priority ===
                        selectedPriority;

                const matchesStatus =
                    selectedStatus ===
                        "all" ||

                    (
                        selectedStatus ===
                            "active" &&
                        !task.completed
                    ) ||

                    (
                        selectedStatus ===
                            "completed" &&
                        task.completed
                    );

                return (
                    matchesSearch &&
                    matchesPriority &&
                    matchesStatus
                );

            }
        );


    renderFilteredTasks(
        filteredTasks
    );

}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderFilteredTasks(
    tasks
) {

    if (!taskList) {
        return;
    }

    taskList.innerHTML =
        "";


    if (taskResultsCount) {

        taskResultsCount.textContent =
            `${tasks.length} ${
                tasks.length === 1
                    ? "task"
                    : "tasks"
            }`;

    }


    if (
        tasks.length === 0
    ) {

        taskList.innerHTML = `

            <div class="task-empty-state">

                <div class="task-empty-icon">
                    🔍
                </div>

                <h3>
                    No tasks found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        /*
           Still make sure progress is visible.
        */

        const total =
            currentTasks.length;

        const completed =
            currentTasks.filter(
                task =>
                    task.completed
            ).length;

        const percentage =
            total
                ? Math.round(
                    (
                        completed /
                        total
                    ) * 100
                )
                : 0;

        updateOverallProgress(
            percentage
        );

        return;
    }


    tasks.forEach(
        task => {

            createTaskElement(
                task
            );

        }
    );


    /*
       Re-apply progress after task cards
       have been rendered.
    */

    const total =
        currentTasks.length;

    const completed =
        currentTasks.filter(
            task =>
                task.completed
        ).length;

    const percentage =
        total
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;

    updateOverallProgress(
        percentage
    );

}


/* =========================================================
   FILTER EVENTS
========================================================= */

if (taskSearch) {

    taskSearch.addEventListener(
        "input",
        filterTasks
    );

}

if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        filterTasks
    );

}

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterTasks
    );


}


/* =========================================================
   CLEAR FILTERS
========================================================= */

if (clearFiltersButton) {

    clearFiltersButton.addEventListener(
        "click",
        () => {

            if (taskSearch) {
                taskSearch.value = "";
            }

            if (priorityFilter) {
                priorityFilter.value = "all";
            }

            if (statusFilter) {
                statusFilter.value = "all";
            }

            filterTasks();

        }
    );

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeTasksPage() {

    await loadProjectsForTaskForm();

    applyDefaultTaskPriority();

    await loadTasks();

}


initializeTasksPage();