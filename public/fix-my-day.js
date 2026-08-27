/* ========================================
   FLOWOS — FIX MY DAY
======================================== */


/* ========================================
   ELEMENTS
======================================== */

const focusTaskList =
    document.getElementById(
        "focus-task-list"
    );


const otherTaskList =
    document.getElementById(
        "other-task-list"
    );


const focusTaskCount =
    document.getElementById(
        "focus-task-count"
    );


const focusTime =
    document.getElementById(
        "focus-time"
    );


const dueTodayCount =
    document.getElementById(
        "due-today-count"
    );


const otherTasksSection =
    document.getElementById(
        "other-tasks-section"
    );


const emptyState =
    document.getElementById(
        "empty-state"
    );


const errorState =
    document.getElementById(
        "error-state"
    );


const errorMessage =
    document.getElementById(
        "error-message"
    );


const refreshButton =
    document.getElementById(
        "refresh-day-button"
    );


const retryButton =
    document.getElementById(
        "retry-button"
    );


/* ========================================
   AUTHENTICATION
======================================== */

async function checkAuthentication() {

    try {

        const response =
            await fetch(
                "/api/auth/me",
                {
                    credentials:
                        "include",

                    cache:
                        "no-store"
                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "/login";

            return false;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to verify authentication."
            );

        }


        return true;

    } catch (error) {

        console.error(
            "FlowOS authentication error:",
            error
        );

        window.location.href =
            "/login";

        return false;

    }

}


/* ========================================
   DATE HELPERS
======================================== */

function getToday() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


function parseDate(
    value
) {

    if (!value) {

        return null;

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function daysUntil(
    dueDate
) {

    const due =
        parseDate(
            dueDate
        );


    if (!due) {

        return null;

    }


    const today =
        parseDate(
            getToday()
        );


    return Math.round(
        (
            due.getTime() -
            today.getTime()
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


/* ========================================
   DEADLINE LABEL
======================================== */

function getDueLabel(
    dueDate
) {

    if (!dueDate) {

        return {
            text:
                "No deadline",

            type:
                "none"
        };

    }


    const days =
        daysUntil(
            dueDate
        );


    if (days === null) {

        return {
            text:
                "No deadline",

            type:
                "none"
        };

    }


    if (days < 0) {

        const count =
            Math.abs(
                days
            );


        return {

            text:
                count === 1
                    ? "Overdue by 1 day"
                    : `Overdue by ${count} days`,

            type:
                "overdue"

        };

    }


    if (days === 0) {

        return {

            text:
                "Due today",

            type:
                "today"

        };

    }


    if (days === 1) {

        return {

            text:
                "Due tomorrow",

            type:
                "tomorrow"

        };

    }


    if (days <= 7) {

        return {

            text:
                `Due in ${days} days`,

            type:
                "soon"

        };

    }


    const date =
        parseDate(
            dueDate
        );


    return {

        text:
            date.toLocaleDateString(
                "en-IN",
                {
                    day:
                        "numeric",

                    month:
                        "short"
                }
            ),

        type:
            "future"

    };

}


/* ========================================
   PRIORITY SCORE
======================================== */

function getPriorityScore(
    priority
) {

    switch (
        String(
            priority || ""
        ).toLowerCase()
    ) {

        case "high":

            return 30;


        case "medium":

            return 20;


        case "low":

            return 10;


        default:

            return 10;

    }

}


/* ========================================
   DEADLINE SCORE
======================================== */

function getDeadlineScore(
    dueDate
) {

    const days =
        daysUntil(
            dueDate
        );


    if (days === null) {

        return 0;

    }


    /*
     * Overdue tasks should always
     * receive the highest urgency.
     */

    if (days < 0) {

        return 100;

    }


    /*
     * Due today.
     */

    if (days === 0) {

        return 90;

    }


    /*
     * Due tomorrow.
     */

    if (days === 1) {

        return 70;

    }


    /*
     * Due within three days.
     */

    if (days <= 3) {

        return 50;

    }


    /*
     * Due within one week.
     */

    if (days <= 7) {

        return 30;

    }


    return 10;

}


/* ========================================
   TASK SCORE
======================================== */

function calculateTaskScore(
    task
) {

    return (
        getDeadlineScore(
            task.dueDate
        ) +
        getPriorityScore(
            task.priority
        )
    );

}


/* ========================================
   TIME FORMAT
======================================== */

function formatMinutes(
    minutes
) {

    const value =
        Number(
            minutes
        );


    if (
        !Number.isFinite(
            value
        ) ||
        value <= 0
    ) {

        return "Time not set";

    }


    if (value < 60) {

        return `${value} min`;

    }


    const hours =
        Math.floor(
            value / 60
        );


    const remaining =
        value % 60;


    if (
        remaining === 0
    ) {

        return (
            hours === 1
                ? "1 hour"
                : `${hours} hours`
        );

    }


    return (
        `${hours}h ${remaining}m`
    );

}


function formatTotalTime(
    minutes
) {

    const value =
        Number(
            minutes
        ) || 0;


    if (value <= 0) {

        return "0m";

    }


    const hours =
        Math.floor(
            value / 60
        );


    const remaining =
        value % 60;


    if (hours === 0) {

        return `${remaining}m`;

    }


    if (
        remaining === 0
    ) {

        return (
            hours === 1
                ? "1h"
                : `${hours}h`
        );

    }


    return (
        `${hours}h ${remaining}m`
    );

}


/* ========================================
   HTML SAFETY
======================================== */

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


/* ========================================
   TASK CARD
======================================== */

function createTaskCard(
    task,
    index = null
) {

    const due =
        getDueLabel(
            task.dueDate
        );


    const priority =
        String(
            task.priority ||
            "medium"
        ).toLowerCase();


    const number =
        index !== null

            ? index + 1

            : "•";


    const project =
        task.projectName

            ? `
                <span class="fix-project">
                    ${escapeHtml(
                        task.projectName
                    )}
                </span>
            `

            : "";


    return `

        <article
            class="fix-task-card"
            data-task-id="${task.id}"
        >


            <div
                class="fix-task-number"
            >
                ${number}
            </div>


            <div
                class="fix-task-content"
            >

                <div
                    class="fix-task-title"
                >
                    ${escapeHtml(
                        task.title
                    )}
                </div>


                <div
                    class="fix-task-meta"
                >


                    <span
                        class="
                            fix-priority
                            priority-${priority}
                        "
                    >
                        ${escapeHtml(
                            priority
                        )}
                    </span>


                    <span
                        class="
                            fix-due
                            fix-due-${due.type}
                        "
                    >
                        ${escapeHtml(
                            due.text
                        )}
                    </span>


                    <span
                        class="fix-duration"
                    >
                        ${formatMinutes(
                            task.estimatedMinutes
                        )}
                    </span>


                    ${project}


                </div>

            </div>


            <button
                type="button"
                class="fix-complete-button"
                data-complete-task="${task.id}"
            >
                Complete
            </button>


        </article>

    `;

}


/* ========================================
   COMPLETE TASK
======================================== */

async function markTaskComplete(
    task
) {

    try {

        const response =
            await fetch(
                `/api/tasks/${task.id}`,
                {

                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            title:
                                task.title,

                            priority:
                                task.priority,

                            estimatedMinutes:
                                task.estimatedMinutes,

                            completed:
                                true,

                            projectId:
                                task.projectId,

                            dueDate:
                                task.dueDate

                        })

                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "/login";

            return;

        }


        if (!response.ok) {

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                data.message ||
                "Unable to complete task."
            );

        }


        await loadFixMyDay();

    } catch (error) {

        console.error(
            "FlowOS task completion error:",
            error
        );


        alert(
            error.message ||
            "Unable to complete task."
        );

    }

}


/* ========================================
   BUTTON ACTIONS
======================================== */

function attachTaskActions(
    tasks
) {

    const buttons =
        document.querySelectorAll(
            "[data-complete-task]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const taskId =
                        Number(
                            button.dataset
                                .completeTask
                        );


                    const task =
                        tasks.find(
                            item =>
                                Number(
                                    item.id
                                ) ===
                                taskId
                        );


                    if (!task) {

                        return;

                    }


                    button.disabled =
                        true;


                    button.textContent =
                        "Completing...";


                    await markTaskComplete(
                        task
                    );

                }
            );

        }
    );

}


/* ========================================
   RENDER TASKS
======================================== */

function renderTasks(
    tasks
) {

    focusTaskList.innerHTML =
        "";

    otherTaskList.innerHTML =
        "";


    emptyState.hidden =
        true;


    errorState.hidden =
        true;


    /*
     * Only unfinished tasks should
     * appear on Fix My Day.
     */

    const incompleteTasks =
        tasks.filter(
            task =>
                task.completed !== true
        );


    /*
     * No unfinished tasks.
     */

    if (
        incompleteTasks.length === 0
    ) {

        emptyState.hidden =
            false;


        otherTasksSection.hidden =
            true;


        focusTaskCount.textContent =
            "0";


        focusTime.textContent =
            "0m";


        dueTodayCount.textContent =
            "0";


        return;

    }


    otherTasksSection.hidden =
        false;


    /*
     * Score every unfinished task.
     */

    const scoredTasks =
        incompleteTasks

            .map(
                task => ({

                    ...task,

                    fixScore:
                        calculateTaskScore(
                            task
                        )

                })
            )

            .sort(
                (
                    first,
                    second
                ) => {

                    /*
                     * Highest score first.
                     */

                    if (
                        second.fixScore !==
                        first.fixScore
                    ) {

                        return (
                            second.fixScore -
                            first.fixScore
                        );

                    }


                    /*
                     * If two tasks have
                     * equal urgency, put
                     * the shorter one first.
                     */

                    return (
                        Number(
                            first.estimatedMinutes
                        ) -
                        Number(
                            second.estimatedMinutes
                        )
                    );

                }
            );


    /*
     * Top five tasks become
     * Today's Focus.
     */

    const focusTasks =
        scoredTasks.slice(
            0,
            5
        );


    const otherTasks =
        scoredTasks.slice(
            5
        );


    /*
     * Calculate total focus time.
     */

    const totalFocusMinutes =
        focusTasks.reduce(
            (
                total,
                task
            ) => {

                return (
                    total +
                    (
                        Number(
                            task.estimatedMinutes
                        ) || 0
                    )
                );

            },
            0
        );


    /*
     * Calculate tasks due today.
     */

    const today =
        getToday();


    const todayTasks =
        incompleteTasks.filter(
            task =>
                task.dueDate ===
                today
        );


    /*
     * Update summary.
     */

    focusTaskCount.textContent =
        focusTasks.length;


    focusTime.textContent =
        formatTotalTime(
            totalFocusMinutes
        );


    dueTodayCount.textContent =
        todayTasks.length;


    /*
     * Render focus tasks.
     */

    focusTaskList.innerHTML =
        focusTasks
            .map(
                (
                    task,
                    index
                ) =>
                    createTaskCard(
                        task,
                        index
                    )
            )
            .join("");


    /*
     * Render remaining tasks.
     */

    otherTaskList.innerHTML =
        otherTasks
            .map(
                task =>
                    createTaskCard(
                        task
                    )
            )
            .join("");


    /*
     * Activate complete buttons.
     */

    attachTaskActions(
        [
            ...focusTasks,
            ...otherTasks
        ]
    );

}


/* ========================================
   LOAD USER TASKS
======================================== */

async function loadFixMyDay() {

    try {

        emptyState.hidden =
            true;


        errorState.hidden =
            true;


        focusTaskList.innerHTML =

            `
                <div
                    class="fix-day-loading"
                >
                    Loading your day...
                </div>
            `;


        const response =
            await fetch(
                "/api/tasks",
                {

                    credentials:
                        "include",

                    cache:
                        "no-store"

                }
            );


        /*
         * If the session has expired,
         * send the user to login.
         */

        if (
            response.status === 401
        ) {

            window.location.href =
                "/login";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load your tasks."
            );

        }


        const tasks =
            await response.json();


        renderTasks(
            Array.isArray(
                tasks
            )
                ? tasks
                : []
        );


    } catch (error) {

        console.error(
            "FlowOS Fix My Day error:",
            error
        );


        focusTaskList.innerHTML =
            "";


        otherTaskList.innerHTML =
            "";


        otherTasksSection.hidden =
            true;


        emptyState.hidden =
            true;


        errorState.hidden =
            false;


        errorMessage.textContent =
            error.message ||
            "Something went wrong while loading your tasks.";

    }

}


/* ========================================
   EVENTS
======================================== */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        () => {

            loadFixMyDay();

        }
    );

}


if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            loadFixMyDay();

        }
    );

}


/* ========================================
   INITIALIZE
======================================== */

(async function initializeFixMyDay() {

    const authenticated =
        await checkAuthentication();


    if (!authenticated) {

        return;

    }


    await loadFixMyDay();

})();