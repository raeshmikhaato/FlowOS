/* ========================================
   DATA
======================================== */

let tasks = [];
let projects = [];


/* ========================================
   DOM
======================================== */

const errorMessage =
    document.getElementById("error-message");


const totalTasksElement =
    document.getElementById("total-tasks");


const completedTasksElement =
    document.getElementById("completed-tasks");


const completionRateElement =
    document.getElementById("completion-rate");


const estimatedHoursElement =
    document.getElementById("estimated-hours");


const completedHoursElement =
    document.getElementById("completed-hours");


const remainingHoursElement =
    document.getElementById("remaining-hours");


const highPriorityRateElement =
    document.getElementById("high-priority-rate");


const priorityChart =
    document.getElementById("priority-chart");


const projectChart =
    document.getElementById("project-chart");


const projectPerformance =
    document.getElementById("project-performance");


const insightsList =
    document.getElementById("insights-list");


/* ========================================
   HELPERS
======================================== */

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


function formatHours(minutes) {

    const value =
        Number(minutes) || 0;


    const hours =
        value / 60;


    if (hours === 0) {

        return "0h";

    }


    if (hours < 1) {

        return `${Math.round(value)}m`;

    }


    return `${hours.toFixed(1)}h`;

}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function getNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


/* ========================================
   LOAD DATA
======================================== */

async function loadAnalytics() {

    try {

        const [
            tasksResponse,
            projectsResponse
        ] = await Promise.all([

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


        if (
            !tasksResponse.ok ||
            !projectsResponse.ok
        ) {

            throw new Error(
                "Failed to load analytics data."
            );

        }


        tasks =
            await tasksResponse.json();


        projects =
            await projectsResponse.json();


        renderAnalytics();


    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );


        showError(
            "Unable to load analytics right now. Please refresh the page."
        );

    }

}


/* ========================================
   CALCULATIONS
======================================== */

function calculateMetrics() {

    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(
            task => task.completed
        ).length;


    const completionRate =
        totalTasks === 0
            ? 0
            : Math.round(
                (
                    completedTasks /
                    totalTasks
                ) * 100
            );


    const estimatedMinutes =
        tasks.reduce(
            (total, task) => {

                return (
                    total +
                    getNumber(
                        task.estimatedMinutes
                    )
                );

            },
            0
        );


    const completedMinutes =
        tasks
            .filter(
                task => task.completed
            )
            .reduce(
                (total, task) => {

                    return (
                        total +
                        getNumber(
                            task.estimatedMinutes
                        )
                    );

                },
                0
            );


    const remainingMinutes =
        estimatedMinutes -
        completedMinutes;


    const highPriorityTasks =
        tasks.filter(
            task =>
                task.priority === "high"
        );


    const completedHighPriorityTasks =
        highPriorityTasks.filter(
            task => task.completed
        );


    const highPriorityRate =
        highPriorityTasks.length === 0
            ? 0
            : Math.round(
                (
                    completedHighPriorityTasks.length /
                    highPriorityTasks.length
                ) * 100
            );


    return {

        totalTasks,

        completedTasks,

        completionRate,

        estimatedMinutes,

        completedMinutes,

        remainingMinutes,

        highPriorityTasks,

        completedHighPriorityTasks,

        highPriorityRate

    };

}


/* ========================================
   OVERVIEW
======================================== */

function renderOverview(metrics) {

    totalTasksElement.textContent =
        metrics.totalTasks;


    completedTasksElement.textContent =
        metrics.completedTasks;


    completionRateElement.textContent =
        `${metrics.completionRate}%`;


    estimatedHoursElement.textContent =
        formatHours(
            metrics.estimatedMinutes
        );


    completedHoursElement.textContent =
        formatHours(
            metrics.completedMinutes
        );


    remainingHoursElement.textContent =
        formatHours(
            metrics.remainingMinutes
        );


    highPriorityRateElement.textContent =
        metrics.highPriorityTasks.length === 0
            ? "No high-priority tasks"
            : `${metrics.highPriorityRate}%`;
}


/* ========================================
   PRIORITY CHART
======================================== */

function renderPriorityChart() {

    const priorities = [

        {
            key: "high",
            label: "High"
        },

        {
            key: "medium",
            label: "Medium"
        },

        {
            key: "low",
            label: "Low"
        }

    ];


    const counts =
        priorities.map(priority => {

            return {

                ...priority,

                count:
                    tasks.filter(
                        task =>
                            task.priority ===
                            priority.key
                    ).length

            };

        });


    const maxCount =
        Math.max(
            ...counts.map(
                item => item.count
            ),
            1
        );


    if (tasks.length === 0) {

        priorityChart.innerHTML = `

            <div class="chart-empty">
                No tasks available yet.
            </div>

        `;

        return;

    }


    priorityChart.innerHTML =
        counts.map(item => {

            const percentage =
                item.count === 0
                    ? 0
                    : (
                        item.count /
                        maxCount
                    ) * 100;


            return `

                <div class="bar-row">

                    <div class="bar-label">
                        ${item.label}
                    </div>

                    <div class="bar-track">

                        <div
                            class="bar-fill"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                    <div class="bar-value">
                        ${item.count}
                    </div>

                </div>

            `;

        }).join("");

}


/* ========================================
   PROJECT CHART
======================================== */

function renderProjectChart() {

    if (projects.length === 0) {

        projectChart.innerHTML = `

            <div class="chart-empty">
                No projects available yet.
            </div>

        `;

        return;

    }


    const projectData =
        projects
            .map(project => {

                return {

                    name:
                        project.name,

                    count:
                        getNumber(
                            project.taskCount
                        )

                };

            })
            .filter(
                project =>
                    project.count > 0
            )
            .sort(
                (a, b) =>
                    b.count - a.count
            )
            .slice(0, 6);


    if (projectData.length === 0) {

        projectChart.innerHTML = `

            <div class="chart-empty">
                Your projects do not have
                any assigned tasks yet.
            </div>

        `;

        return;

    }


    const maxCount =
        Math.max(
            ...projectData.map(
                item => item.count
            ),
            1
        );


    projectChart.innerHTML =
        projectData.map(item => {

            const percentage =
                (
                    item.count /
                    maxCount
                ) * 100;


            return `

                <div class="bar-row">

                    <div
                        class="bar-label"
                        title="${escapeHtml(item.name)}"
                    >
                        ${escapeHtml(
                            item.name
                        )}
                    </div>

                    <div class="bar-track">

                        <div
                            class="bar-fill"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                    <div class="bar-value">
                        ${item.count}
                    </div>

                </div>

            `;

        }).join("");

}


/* ========================================
   PROJECT PERFORMANCE
======================================== */

function renderProjectPerformance() {

    if (projects.length === 0) {

        projectPerformance.innerHTML = `

            <div class="chart-empty">
                No projects available yet.
            </div>

        `;

        return;

    }


    const sortedProjects =
        [...projects]
            .sort(
                (a, b) =>
                    getNumber(b.taskCount) -
                    getNumber(a.taskCount)
            );


    projectPerformance.innerHTML =
        sortedProjects.map(project => {

            const progress =
                Math.max(
                    0,
                    Math.min(
                        100,
                        getNumber(
                            project.progress
                        )
                    )
                );


            const taskCount =
                getNumber(
                    project.taskCount
                );


            const completedCount =
                getNumber(
                    project.completedTaskCount
                );


            return `

                <div class="project-row">

                    <div
                        class="project-name"
                        title="${escapeHtml(
                            project.name
                        )}"
                    >
                        ${escapeHtml(
                            project.name
                        )}
                    </div>


                    <div class="project-progress-track">

                        <div
                            class="project-progress-fill"
                            style="width: ${progress}%"
                        ></div>

                    </div>


                    <div class="project-progress-value">
                        ${progress}%
                    </div>

                </div>

            `;

        }).join("");

}


/* ========================================
   INSIGHTS
======================================== */

function renderInsights(metrics) {

    const insights = [];


    /* Completion */

    if (metrics.totalTasks === 0) {

        insights.push({

            title:
                "Start building your dataset",

            text:
                "Create a few tasks and projects. FlowOS will use them to generate meaningful productivity insights."

        });

    } else {

        insights.push({

            title:
                "Overall completion",

            text:
                `You have completed ${metrics.completedTasks} of ${metrics.totalTasks} tasks, giving you a ${metrics.completionRate}% completion rate.`

        });

    }


    /* Remaining workload */

    if (metrics.remainingMinutes > 0) {

        insights.push({

            title:
                "Remaining workload",

            text:
                `You currently have about ${formatHours(metrics.remainingMinutes)} of estimated work remaining across your unfinished tasks.`

        });

    } else if (metrics.totalTasks > 0) {

        insights.push({

            title:
                "No estimated work remaining",

            text:
                "All currently tracked task estimates belong to completed tasks."

        });

    }


    /* High priority */

    if (metrics.highPriorityTasks.length > 0) {

        insights.push({

            title:
                "High-priority focus",

            text:
                `${metrics.completedHighPriorityTasks.length} of ${metrics.highPriorityTasks.length} high-priority tasks are complete (${metrics.highPriorityRate}%).`

        });

    } else {

        insights.push({

            title:
                "Priority planning",

            text:
                "You currently have no high-priority tasks. Assign priority to important work so FlowOS can make better planning decisions later."

        });

    }


    /* Largest project */

    if (projects.length > 0) {

        const largestProject =
            [...projects]
                .sort(
                    (a, b) =>
                        getNumber(b.taskCount) -
                        getNumber(a.taskCount)
                )[0];


        if (
            largestProject &&
            getNumber(
                largestProject.taskCount
            ) > 0
        ) {

            insights.push({

                title:
                    "Largest workload",

                text:
                    `${largestProject.name} currently contains ${largestProject.taskCount} task${largestProject.taskCount === 1 ? "" : "s"}, making it your largest tracked project workload.`

            });

        }

    }


    /* Completed project */

    const completedProjects =
        projects.filter(
            project =>
                project.status === "completed"
        ).length;


    if (projects.length > 0) {

        insights.push({

            title:
                "Project progress",

            text:
                `${completedProjects} of ${projects.length} project${projects.length === 1 ? "" : "s"} currently have a completed status.`

        });

    }


    insightsList.innerHTML =
        insights
            .slice(0, 6)
            .map(insight => {

                return `

                    <div class="insight">

                        <div class="insight-title">
                            ${escapeHtml(
                                insight.title
                            )}
                        </div>

                        <div class="insight-text">
                            ${escapeHtml(
                                insight.text
                            )}
                        </div>

                    </div>

                `;

            })
            .join("");

}


/* ========================================
   RENDER EVERYTHING
======================================== */

function renderAnalytics() {

    const metrics =
        calculateMetrics();


    renderOverview(
        metrics
    );


    renderPriorityChart();


    renderProjectChart();


    renderProjectPerformance();


    renderInsights(
        metrics
    );

}


/* ========================================
   START
======================================== */

loadAnalytics();