let currentProjects = [];
let currentTasks = [];


/* ========================================
   DOM ELEMENTS
======================================== */

const addProjectButton =
    document.getElementById("add-project-button");

const cancelProjectButton =
    document.getElementById("cancel-project-button");

const projectFormContainer =
    document.getElementById("project-form-container");

const projectForm =
    document.getElementById("project-form");

const projectList =
    document.getElementById("project-list");


/* ========================================
   OPEN / CLOSE PROJECT FORM
======================================== */

if (addProjectButton) {

    addProjectButton.addEventListener(
        "click",
        () => {

            projectFormContainer.classList.add(
                "visible"
            );

        }
    );

}


if (cancelProjectButton) {

    cancelProjectButton.addEventListener(
        "click",
        () => {

            projectForm.reset();

            projectFormContainer.classList.remove(
                "visible"
            );

        }
    );

}


/* ========================================
   LOAD PROJECTS + TASKS
======================================== */

async function loadProjects() {

    try {

        /*
         * Load projects and tasks together.
         */

        const [
            projectsResponse,
            tasksResponse
        ] = await Promise.all([

            fetch(
                "/api/projects",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "/api/tasks",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (!projectsResponse.ok) {

            throw new Error(
                "Failed to fetch projects."
            );

        }


        if (!tasksResponse.ok) {

            throw new Error(
                "Failed to fetch tasks."
            );

        }


        const projects =
            await projectsResponse.json();


        const tasks =
            await tasksResponse.json();


        /*
         * Store raw data.
         */

        currentProjects =
            projects;


        currentTasks =
            tasks;


        /*
         * Calculate project statistics
         * from the actual tasks.
         */

        const projectsWithStats =
            calculateProjectStats(
                projects,
                tasks
            );


        /*
         * Update statistics at top.
         */

        updateProjectStats(
            projectsWithStats
        );


        /*
         * Render project cards.
         */

        renderProjects(
            projectsWithStats
        );


        console.log(
            "Projects loaded:",
            projectsWithStats
        );


        console.log(
            "Tasks loaded:",
            tasks
        );


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        if (projectList) {

            projectList.innerHTML = `

                <div class="project-empty-state">

                    <div class="project-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load projects
                    </h3>

                    <p>
                        Please check that the FlowOS server is running.
                    </p>

                </div>

            `;

        }

    }

}


/* ========================================
   CALCULATE PROJECT STATISTICS
======================================== */

function calculateProjectStats(
    projects,
    tasks
) {

    return projects.map(
        project => {

            /*
             * Find every task belonging
             * to this project.
             */

            const projectTasks =
                tasks.filter(
                    task =>
                        Number(task.projectId) ===
                        Number(project.id)
                );


            /*
             * Count tasks.
             */

            const taskCount =
                projectTasks.length;


            /*
             * Count completed tasks.
             */

            const completedTaskCount =
                projectTasks.filter(
                    task =>
                        task.completed === true
                ).length;


            /*
             * Calculate progress.
             */

            const progress =
                taskCount === 0
                    ? 0
                    : Math.round(
                        (
                            completedTaskCount /
                            taskCount
                        ) * 100
                    );


            /*
             * Return project with
             * calculated statistics.
             */

            return {

                ...project,

                taskCount:
                    taskCount,

                completedTaskCount:
                    completedTaskCount,

                progress:
                    progress

            };

        }
    );

}


/* ========================================
   CREATE PROJECT
======================================== */

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "project-name"
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        "project-description"
                    )
                    .value
                    .trim();


            const status =
                document
                    .getElementById(
                        "project-status"
                    )
                    .value;


            const color =
                document
                    .getElementById(
                        "project-color"
                    )
                    .value;


            const deadline =
                document
                    .getElementById(
                        "project-deadline"
                    )
                    .value;


            /* --------------------------------
               Validation
            -------------------------------- */

            if (!name) {

                alert(
                    "Project name is required."
                );

                return;

            }


            /* --------------------------------
               Prevent duplicate submission
            -------------------------------- */

            const submitButton =
                projectForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;


            submitButton.textContent =
                "Creating...";


            try {

                const response =
                    await fetch(
                        "/api/projects",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    description:
                                        description,

                                    status:
                                        status,

                                    color:
                                        color,

                                    deadline:
                                        deadline ||
                                        null

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    const errorMessage =
                        data.errors &&
                        data.errors.length > 0

                            ? data.errors.join(
                                "\n"
                            )

                            : data.message ||
                              "Failed to create project.";


                    alert(
                        errorMessage
                    );


                    return;

                }


                /*
                 * Close form.
                 */

                projectForm.reset();


                projectFormContainer.classList.remove(
                    "visible"
                );


                /*
                 * Reload everything.
                 *
                 * This guarantees the newly
                 * created project uses the same
                 * calculation logic.
                 */

                await loadProjects();


            } catch (error) {

                console.error(
                    "Error creating project:",
                    error
                );


                alert(
                    "Unable to create project. Please check that the FlowOS server is running."
                );


            } finally {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Create Project";

            }

        }
    );

}


/* ========================================
   RENDER PROJECTS
======================================== */

function renderProjects(
    projects
) {

    if (!projectList) {

        return;

    }


    projectList.innerHTML =
        "";


    if (projects.length === 0) {

        projectList.innerHTML = `

            <div class="project-empty-state">

                <div class="project-empty-icon">
                    📁
                </div>

                <h3>
                    No projects yet
                </h3>

                <p>
                    Create your first project to start organizing your work.
                </p>

            </div>

        `;

        return;

    }


    projects.forEach(
        project => {

            const projectCard =
                createProjectCard(
                    project
                );


            projectList.appendChild(
                projectCard
            );

        }
    );

}


/* ========================================
   CREATE PROJECT CARD
======================================== */

function createProjectCard(
    project
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "project-card";


    const status =
        project.status ||
        "planning";


    const color =
        project.color ||
        "blue";


    const description =
        project.description ||
        "No description added yet.";


    const deadline =
        project.deadline
            ? formatDate(
                project.deadline
            )
            : "No deadline";


    /*
     * These values are now calculated
     * from /api/tasks.
     */

    const taskCount =
        Number(
            project.taskCount
        ) || 0;


    const completedTaskCount =
        Number(
            project.completedTaskCount
        ) || 0;


    const progress =
        Math.min(
            100,
            Math.max(
                0,
                Number(
                    project.progress
                ) || 0
            )
        );


    card.innerHTML = `

        <div class="project-card-header">

            <div class="project-title-wrapper">

                <div
                    class="project-color ${escapeHtml(color)}"
                ></div>


                <div>

                    <h2>
                        ${escapeHtml(project.name)}
                    </h2>


                    <p class="project-description">
                        ${escapeHtml(description)}
                    </p>

                </div>

            </div>


            <span
                class="project-status ${escapeHtml(status)}"
            >
                ${capitalize(status)}
            </span>

        </div>


        <div class="project-meta">

            <span>
                ${taskCount}
                ${taskCount === 1 ? "task" : "tasks"}
            </span>


            <span>
                ${completedTaskCount}
                completed
            </span>


            <span>
                Deadline:
                ${escapeHtml(deadline)}
            </span>

        </div>


        <div class="project-progress">

            <div class="project-progress-header">

                <span>
                    Progress
                </span>


                <strong>
                    ${progress}%
                </strong>

            </div>


            <div class="project-progress-track">

                <div
                    class="project-progress-bar"
                    style="width: ${progress}%"
                ></div>

            </div>

        </div>

    `;


    return card;

}


/* ========================================
   PROJECT STATISTICS
======================================== */

function updateProjectStats(
    projects
) {

    const total =
        projects.length;


    const active =
        projects.filter(
            project =>
                project.status ===
                "active"
        ).length;


    const completed =
        projects.filter(
            project =>
                project.status ===
                "completed"
        ).length;


    /*
     * Total tasks across every project.
     */

    const totalTasks =
        projects.reduce(
            (
                sum,
                project
            ) => {

                return (
                    sum +
                    (
                        Number(
                            project.taskCount
                        ) || 0
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "total-projects"
        );


    const activeElement =
        document.getElementById(
            "active-projects"
        );


    const completedElement =
        document.getElementById(
            "completed-projects"
        );


    const taskCountElement =
        document.getElementById(
            "project-task-count"
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


    if (taskCountElement) {

        taskCountElement.textContent =
            totalTasks;

    }

}


/* ========================================
   FORMAT DATE
======================================== */

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid date";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


/* ========================================
   CAPITALIZE
======================================== */

function capitalize(
    value
) {

    if (!value) {

        return "";

    }


    return (
        value.charAt(0).toUpperCase()
        +
        value.slice(1)
    );

}


/* ========================================
   BASIC HTML ESCAPING
======================================== */

function escapeHtml(
    value
) {

    return String(value)
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


/* ========================================
   START
======================================== */

loadProjects();