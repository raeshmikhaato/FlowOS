let dashboardTasks = [];
let dashboardProjects = [];
let selectedDashboardTask = null;


/* ========================================
   SETTINGS
======================================== */

function getFlowOSSettings() {

    const defaults = {
        priority: "medium",
        weekStart: "sunday"
    };

    try {

        const saved =
            localStorage.getItem(
                "flowosSettings"
            );

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


function getDefaultDashboardPriority() {

    const priority =
        getFlowOSSettings().priority;

    return [
        "low",
        "medium",
        "high"
    ].includes(priority)
        ? priority
        : "medium";

}


function applyDefaultDashboardPriority() {

    const select =
        document.getElementById(
            "dashboard-task-priority"
        );

    if (select) {

        select.value =
            getDefaultDashboardPriority();

    }

}


/* ========================================
   GUARANTEED DASHBOARD TASK UI
======================================== */

(function injectDashboardTaskStyles() {

    if (
        document.getElementById(
            "flowos-dashboard-task-ui-fix"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "flowos-dashboard-task-ui-fix";


    style.textContent = `

        .dashboard-task {

            position: relative !important;

            display: flex !important;

            align-items: center !important;

            gap: 14px !important;

        }


        .dashboard-task::before {

            content: "";

            flex: 0 0 4px;

            align-self: stretch;

            min-height: 42px;

            border-radius: 999px;

            background: #64748b;

        }


        .dashboard-task.high::before {
            background: #ef4444;
        }


        .dashboard-task.medium::before {
            background: #f59e0b;
        }


        .dashboard-task.low::before {
            background: #22c55e;
        }


        .dashboard-task-checkbox {

            flex: 0 0 22px !important;

            width: 22px !important;
            height: 22px !important;

            min-width: 22px !important;
            min-height: 22px !important;

            padding: 0 !important;

            border: 2px solid #667085 !important;

            border-radius: 50% !important;

            background: #12151c !important;

            cursor: pointer !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            color: #ffffff !important;

            font-size: 12px !important;

            font-weight: 700 !important;

            box-sizing: border-box !important;

        }


        html:not(.dark-theme)
        .dashboard-task-checkbox,

        body:not(.dark-theme)
        .dashboard-task-checkbox {

            background: #ffffff !important;

            border-color: #b8c0cc !important;

            color: #ffffff !important;

        }


        .dashboard-task-checkbox:hover {

            border-color: #22c55e !important;

        }


        .dashboard-task.completed
        .dashboard-task-checkbox {

            background: #22c55e !important;

            border-color: #22c55e !important;

        }


        .dashboard-task-delete {

            flex: 0 0 auto !important;

            display: inline-flex !important;

            align-items: center !important;

            justify-content: center !important;

            border: 1px solid #3a4050 !important;

            background: #181b24 !important;

            color: #cbd5e1 !important;

            padding: 8px 11px !important;

            border-radius: 8px !important;

            cursor: pointer !important;

        }


        html:not(.dark-theme)
        .dashboard-task-delete,

        body:not(.dark-theme)
        .dashboard-task-delete {

            background: #ffffff !important;

            border-color: #d9dee7 !important;

            color: #667085 !important;

        }


        .dashboard-task-delete:hover {

            border-color: #ef4444 !important;

            color: #ef4444 !important;

        }


        .dashboard-task-details {

            flex: 1 !important;

            min-width: 0 !important;

        }

    `;


    document.head.appendChild(
        style
    );

})();


/* ========================================
   HELPERS
======================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


function capitalize(
    value
) {

    return value
        ? value.charAt(0).toUpperCase() +
          value.slice(1)
        : "";

}


function formatDashboardDate(
    value
) {

    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "No deadline";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* ========================================
   LOAD DASHBOARD
======================================== */

async function loadDashboard() {

    try {

        const [
            tasksResponse,
            projectsResponse
        ] =
            await Promise.all([

                fetch(
                    "/api/tasks",
                    {
                        cache: "no-store"
                    }
                ),

                fetch(
                    "/api/projects",
                    {
                        cache: "no-store"
                    }
                )

            ]);


        if (!tasksResponse.ok) {

            throw new Error(
                "Failed to fetch tasks: " +
                tasksResponse.status
            );

        }


        if (!projectsResponse.ok) {

            throw new Error(
                "Failed to fetch projects: " +
                projectsResponse.status
            );

        }


        dashboardTasks =
            await tasksResponse.json();


        dashboardProjects =
            await projectsResponse.json();


        dashboardTasks =
            dashboardTasks.map(
                task => ({

                    ...task,

                    priority:
                        task.priority ||
                        "medium"

                })
            );


        updateDashboardTaskStats(
            dashboardTasks
        );


        updateDashboardProjectStats(
            dashboardProjects
        );


        renderDashboardProjects(
            dashboardProjects,
            dashboardTasks
        );


        renderActiveTasks(
            dashboardTasks.filter(
                task =>
                    !task.completed
            )
        );


        updateTodayProgress(
            dashboardTasks
        );


        loadDashboardProjectDropdown(
            dashboardProjects
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showDashboardError();

    }

}


/* ========================================
   TASK STATISTICS
======================================== */

function updateDashboardTaskStats(
    tasks
) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const active =
        total -
        completed;


    const percentage =
        total
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    setText(
        "dashboard-total",
        total
    );


    setText(
        "dashboard-active",
        active
    );


    setText(
        "dashboard-completed",
        completed
    );


    setText(
        "dashboard-progress",
        `${percentage}%`
    );


    setText(
        "dashboard-progress-label",
        `${percentage}%`
    );


    const progressBar =
        document.getElementById(
            "dashboard-progress-bar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;

    }

}


/* ========================================
   PROJECT STATISTICS
======================================== */

function updateDashboardProjectStats(
    projects
) {

    setText(
        "dashboard-project-total",
        projects.length
    );


    setText(
        "dashboard-project-active",
        projects.filter(
            project =>
                String(
                    project.status
                )
                .toLowerCase() ===
                "active"
        ).length
    );


    setText(
        "dashboard-project-completed",
        projects.filter(
            project =>
                String(
                    project.status
                )
                .toLowerCase() ===
                "completed"
        ).length
    );

}


/* ========================================
   PROJECT OVERVIEW
======================================== */

function renderDashboardProjects(
    projects,
    tasks
) {

    let container =
        document.getElementById(
            "dashboard-project-list"
        );


    if (!container) {

        container =
            document.querySelector(
                ".dashboard-project-list"
            );

    }


    if (!container) {

        container =
            document.querySelector(
                ".dashboard-project-grid"
            );

    }


    if (!container) {

        container =
            document.querySelector(
                ".project-overview-list"
            );

    }


    if (!container) {

        const heading =
            [
                ...document.querySelectorAll(
                    "h2,h3"
                )
            ]
            .find(
                element =>
                    element.textContent
                        .trim()
                        .toLowerCase() ===
                    "project overview"
            );


        if (heading) {

            container =
                document.createElement(
                    "div"
                );


            container.id =
                "dashboard-project-list";


            container.className =
                "dashboard-project-grid";


            const parent =
                heading.closest(
                    "section"
                ) ||
                heading.parentElement;


            if (parent) {

                parent.after(
                    container
                );

            }

        }

    }


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (!projects.length) {

        container.innerHTML = `

            <div class="dashboard-empty">

                <div class="empty-icon">
                    📁
                </div>

                <strong>
                    No projects yet
                </strong>

                <span>
                    Create a project to start organizing your work.
                </span>

            </div>

        `;

        return;

    }


    projects.forEach(
        project => {

            container.appendChild(

                createDashboardProjectCard(
                    project,
                    tasks
                )

            );

        }
    );

}


/* ========================================
   PROJECT CARD
======================================== */

function createDashboardProjectCard(
    project,
    tasks
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "dashboard-project-card project-card";


    const projectTasks =
        tasks.filter(
            task =>
                Number(
                    task.projectId
                ) ===
                Number(
                    project.id
                )
        );


    const completed =
        projectTasks.filter(
            task =>
                task.completed
        ).length;


    const total =
        projectTasks.length;


    const progress =
        total
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    const status =
        project.status ||
        "planning";


    const color =
        project.color ||
        "blue";


    card.innerHTML = `

        <div
            class="
                dashboard-project-card-header
            "
        >

            <div
                class="
                    dashboard-project-title-wrapper
                "
            >

                <div
                    class="
                        project-color
                        ${escapeHtml(color)}
                    "
                ></div>


                <div>

                    <h3
                        class="
                            dashboard-project-title
                        "
                    >

                        ${escapeHtml(
                            project.name
                        )}

                    </h3>


                    <p
                        class="
                            dashboard-project-description
                        "
                    >

                        ${escapeHtml(
                            project.description ||
                            "No description added yet."
                        )}

                    </p>

                </div>

            </div>


            <span
                class="
                    project-status
                    ${escapeHtml(
                        String(status)
                            .toLowerCase()
                    )}
                "
            >

                ${capitalize(
                    status
                )}

            </span>

        </div>


        <div
            class="
                dashboard-project-progress
            "
        >

            <div
                class="
                    dashboard-project-progress-header
                "
            >

                <span>
                    Progress
                </span>


                <span
                    class="
                        dashboard-project-percentage
                    "
                >

                    ${progress}%

                </span>

            </div>


            <div
                class="
                    dashboard-project-progress-track
                "
            >

                <div
                    class="
                        dashboard-project-progress-bar
                    "
                    style="
                        width: ${progress}%;
                    "
                ></div>

            </div>

        </div>


        <div
            class="
                dashboard-project-footer
            "
        >

            <span>

                ${completed}
                /
                ${total}
                tasks completed

            </span>


            <span>

                ${
                    project.deadline
                        ? formatDashboardDate(
                            project.deadline
                        )
                        : "No deadline"
                }

            </span>

        </div>

    `;


    return card;

}


/* ========================================
   TODAY PROGRESS
======================================== */

function updateTodayProgress(
    tasks
) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
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


    document
        .querySelectorAll(
            "#today-progress-percentage, .today-progress-percentage"
        )
        .forEach(
            element => {

                element.textContent =
                    `${percentage}%`;

            }
        );


    document
        .querySelectorAll(
            "#today-progress-bar, .today-progress-bar"
        )
        .forEach(
            element => {

                element.style.width =
                    `${percentage}%`;

            }
        );

}


/* ========================================
   ACTIVE TASKS
======================================== */

function renderActiveTasks(
    tasks
) {

    const list =
        document.getElementById(
            "dashboard-task-list"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    if (!tasks.length) {

        list.innerHTML = `

            <div class="dashboard-empty">

                <div class="empty-icon">
                    ✓
                </div>

                <strong>
                    You're all caught up!
                </strong>

                <span>
                    No active tasks right now.
                </span>

            </div>

        `;

        return;

    }


    tasks
        .slice(
            0,
            5
        )
        .forEach(
            task => {

                const priority =
                    task.priority ||
                    "medium";


                const element =
                    document.createElement(
                        "article"
                    );


                element.className =
                    `
                        dashboard-task
                        ${priority}
                    `;


                element.innerHTML = `

                    <button
                        class="
                            dashboard-task-checkbox
                        "
                        type="button"
                        aria-label="Complete task"
                    ></button>


                    <div
                        class="
                            dashboard-task-details
                        "
                    >

                        <h3
                            class="
                                dashboard-task-title
                            "
                        >

                            ${escapeHtml(
                                task.title
                            )}

                        </h3>


                        <span
                            class="
                                dashboard-task-meta
                            "
                        >

                            ${
                                task.estimatedMinutes ||
                                0
                            }

                            min

                        </span>

                    </div>


                    <span
                        class="
                            dashboard-task-priority
                            ${priority}
                        "
                    >

                        ${capitalize(
                            priority
                        )}

                    </span>


                    <button
                        class="
                            dashboard-task-delete
                        "
                        type="button"
                    >

                        Delete

                    </button>

                `;


                const checkbox =
                    element.querySelector(
                        ".dashboard-task-checkbox"
                    );


                const deleteButton =
                    element.querySelector(
                        ".dashboard-task-delete"
                    );


                checkbox.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();


                        await updateDashboardTaskCompletion(
                            task,
                            checkbox
                        );

                    }
                );


                deleteButton.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();


                        await deleteDashboardTask(
                            task,
                            deleteButton
                        );

                    }
                );


                element.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                "button"
                            )
                        ) {

                            return;

                        }


                        openTaskDetails(
                            task
                        );

                    }
                );


                list.appendChild(
                    element
                );

            }
        );

}


/* ========================================
   COMPLETE DASHBOARD TASK
======================================== */

async function updateDashboardTaskCompletion(
    task,
    checkbox
) {

    checkbox.disabled =
        true;


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
                                true,

                            projectId:
                                task.projectId ||
                                null

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update task."
            );

        }


        await loadDashboard();


    } catch (error) {

        console.error(
            "Failed to complete task:",
            error
        );


        checkbox.disabled =
            false;

    }

}


/* ========================================
   DELETE DASHBOARD TASK
======================================== */

async function deleteDashboardTask(
    task,
    button
) {

    if (
        !confirm(
            `Delete "${task.title}"?`
        )
    ) {

        return;

    }


    button.disabled =
        true;


    try {

        const response =
            await fetch(
                `/api/tasks/${task.id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete task."
            );

        }


        await loadDashboard();


    } catch (error) {

        console.error(
            "Failed to delete task:",
            error
        );


        alert(
            error.message
        );


        button.disabled =
            false;

    }

}


/* ========================================
   DASHBOARD PROJECT DROPDOWN
======================================== */

function loadDashboardProjectDropdown(
    projects
) {

    const select =
        document.getElementById(
            "dashboard-task-project"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            No project
        </option>

    `;


    projects.forEach(
        project => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                project.id;


            option.textContent =
                project.name;


            select.appendChild(
                option
            );

        }
    );

}


/* ========================================
   QUICK ADD MODAL
======================================== */

const addTaskButton =
    document.getElementById(
        "dashboard-add-task-button"
    );


const taskModal =
    document.getElementById(
        "task-modal"
    );


const closeTaskModal =
    document.getElementById(
        "close-task-modal"
    );


const closeTaskModalBottom =
    document.getElementById(
        "close-task-modal-bottom"
    );


const dashboardTaskForm =
    document.getElementById(
        "dashboard-task-form"
    );


function closeQuickAddModal() {

    if (taskModal) {

        taskModal.classList.remove(
            "visible"
        );

    }


    if (dashboardTaskForm) {

        dashboardTaskForm.reset();

    }

}


if (
    addTaskButton &&
    taskModal
) {

    addTaskButton.addEventListener(
        "click",
        () => {

            taskModal.classList.add(
                "visible"
            );


            applyDefaultDashboardPriority();


            document
                .getElementById(
                    "dashboard-task-title"
                )
                ?.focus();

        }
    );

}


if (closeTaskModal) {

    closeTaskModal.addEventListener(
        "click",
        closeQuickAddModal
    );

}


if (closeTaskModalBottom) {

    closeTaskModalBottom.addEventListener(
        "click",
        closeQuickAddModal
    );

}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskModal
            ) {

                closeQuickAddModal();

            }

        }
    );

}


/* ========================================
   CREATE TASK FROM DASHBOARD
======================================== */

if (dashboardTaskForm) {

    dashboardTaskForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "dashboard-task-title"
                    )
                    ?.value
                    .trim() ||
                "";


            const priority =
                document
                    .getElementById(
                        "dashboard-task-priority"
                    )
                    ?.value ||
                getDefaultDashboardPriority();


            const estimatedMinutes =
                Number(
                    document
                        .getElementById(
                            "dashboard-task-time"
                        )
                        ?.value ||
                    0
                );


            const projectSelect =
                document.getElementById(
                    "dashboard-task-project"
                );


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

                                    estimatedMinutes,

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

                    throw new Error(
                        data.message ||
                        "Failed to create task."
                    );

                }


                closeQuickAddModal();


                await loadDashboard();


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    error.message ||
                    "Unable to create task."
                );

            }

        }
    );

}


/* ========================================
   TASK DETAILS MODAL
======================================== */

const taskDetailsModal =
    document.getElementById(
        "task-details-modal"
    );


const detailsModalClose =
    document.getElementById(
        "details-modal-close"
    );


const detailsModalCloseButton =
    document.getElementById(
        "details-modal-close-button"
    );


const detailsCompleteButton =
    document.getElementById(
        "details-complete-button"
    );


function openTaskDetails(
    task
) {

    selectedDashboardTask =
        task;


    setText(
        "details-task-title",
        task.title || ""
    );


    setText(
        "details-task-priority",
        capitalize(
            task.priority ||
            "medium"
        )
    );


    setText(
        "details-task-time",
        `${
            task.estimatedMinutes ||
            0
        } min`
    );


    setText(
        "details-task-status",
        task.completed
            ? "Completed"
            : "Active"
    );


    if (detailsCompleteButton) {

        detailsCompleteButton.disabled =
            Boolean(
                task.completed
            );


        detailsCompleteButton.textContent =
            task.completed
                ? "Completed"
                : "Mark Complete";

    }


    if (taskDetailsModal) {

        taskDetailsModal.classList.add(
            "visible"
        );

    }

}


function closeTaskDetails() {

    if (taskDetailsModal) {

        taskDetailsModal.classList.remove(
            "visible"
        );

    }


    selectedDashboardTask =
        null;

}


if (detailsModalClose) {

    detailsModalClose.addEventListener(
        "click",
        closeTaskDetails
    );

}


if (detailsModalCloseButton) {

    detailsModalCloseButton.addEventListener(
        "click",
        closeTaskDetails
    );

}


if (taskDetailsModal) {

    taskDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskDetailsModal
            ) {

                closeTaskDetails();

            }

        }
    );

}


/* ========================================
   COMPLETE FROM DETAILS
======================================== */

if (detailsCompleteButton) {

    detailsCompleteButton.addEventListener(
        "click",
        async () => {

            if (
                !selectedDashboardTask
            ) {

                return;

            }


            const task =
                selectedDashboardTask;


            detailsCompleteButton.disabled =
                true;


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
                                        true,

                                    projectId:
                                        task.projectId ||
                                        null

                                })

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to complete task."
                    );

                }


                closeTaskDetails();


                await loadDashboard();


            } catch (error) {

                console.error(
                    error
                );


                detailsCompleteButton.disabled =
                    false;

            }

        }
    );

}


/* ========================================
   ERROR
======================================== */

function showDashboardError() {

    const list =
        document.getElementById(
            "dashboard-task-list"
        );


    if (!list) {

        return;

    }


    list.innerHTML = `

        <div class="dashboard-empty">

            <div class="empty-icon">
                ⚠️
            </div>

            <strong>
                Unable to load dashboard
            </strong>

            <span>
                Please make sure the FlowOS server is running.
            </span>

        </div>

    `;

}


/* ========================================
   SETTINGS SYNC
======================================== */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "flowosSettings"
        ) {

            applyDefaultDashboardPriority();

        }

    }
);


/* ========================================
   START
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyDefaultDashboardPriority();

        loadDashboard();

    }
);