let currentDate = new Date();

let selectedDate = new Date();

let tasks = [];

let projects = [];


/* ========================================
   FLOWOS USER PREFERENCES
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

        const parsed =
            JSON.parse(saved);

        return {
            ...defaults,
            ...parsed
        };

    } catch (error) {

        console.error(
            "FlowOS: Could not read user preferences.",
            error
        );

        return defaults;

    }

}


function getCalendarWeekStart() {

    const settings =
        getFlowOSSettings();

    return settings.weekStart === "monday"
        ? 1
        : 0;

}


function getCalendarDefaultPriority() {

    const settings =
        getFlowOSSettings();

    const validPriorities = [
        "low",
        "medium",
        "high"
    ];

    return validPriorities.includes(
        settings.priority
    )
        ? settings.priority
        : "medium";

}


function applyCalendarDefaultPriority() {

    const prioritySelect =
        document.getElementById(
            "task-priority"
        );

    if (!prioritySelect) {
        return;
    }

    prioritySelect.value =
        getCalendarDefaultPriority();

}


/* ========================================
   DOM
======================================== */

const calendarTitle =
    document.getElementById("calendar-title");

const calendarGrid =
    document.getElementById("calendar-grid");

const selectedDateTitle =
    document.getElementById("selected-date-title");

const selectedDateContent =
    document.getElementById("selected-date-content");

const upcomingList =
    document.getElementById("upcoming-list");

const upcomingCount =
    document.getElementById("upcoming-count");

const errorMessage =
    document.getElementById("error-message");

const taskModal =
    document.getElementById("task-modal");

const taskForm =
    document.getElementById("task-form");

const taskDateInput =
    document.getElementById("task-date");

const taskProjectSelect =
    document.getElementById("task-project");

const formError =
    document.getElementById("form-error");

const saveTaskButton =
    document.getElementById("save-task");


/* ========================================
   DATE HELPERS
======================================== */

function pad(value) {

    return String(value).padStart(2, "0");

}


function formatDateKey(date) {

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}`
    );

}


function parseDateKey(value) {

    if (!value) {
        return null;
    }


    const parts =
        String(value)
            .slice(0, 10)
            .split("-");


    if (parts.length !== 3) {
        return null;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    if (!year || !month || !day) {
        return null;
    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {

        return null;

    }


    return date;

}


function formatLongDate(date) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    ).format(date);

}


function formatMonthYear(date) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    ).format(date);

}


function formatShortMonth(date) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short"
        }
    ).format(date);

}


function isSameDate(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}


/* ========================================
   HTML SAFETY
======================================== */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* ========================================
   ERROR HANDLING
======================================== */

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}


/* ========================================
   DATA HELPERS
======================================== */

function getTasksForDate(date) {

    const dateKey =
        formatDateKey(date);


    return tasks.filter(task => {

        return (
            task.dueDate &&
            String(task.dueDate)
                .slice(0, 10) === dateKey
        );

    });

}


function getProjectsForDate(date) {

    const dateKey =
        formatDateKey(date);


    return projects.filter(project => {

        return (
            project.deadline &&
            String(project.deadline)
                .slice(0, 10) === dateKey
        );

    });

}


/* ========================================
   LOAD DATA
======================================== */

async function loadData() {

    hideError();


    calendarGrid.innerHTML = `

        <div class="calendar-loading">
            Loading calendar...
        </div>

    `;


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
                "Failed to load tasks."
            );

        }


        if (!projectsResponse.ok) {

            throw new Error(
                "Failed to load projects."
            );

        }


        tasks =
            await tasksResponse.json();


        projects =
            await projectsResponse.json();


        renderCalendar();

        renderSelectedDate();

        renderUpcoming();


    } catch (error) {

        console.error(
            "Calendar load error:",
            error
        );


        showError(
            error.message ||
            "Failed to load calendar."
        );


        calendarGrid.innerHTML = `

            <div class="calendar-loading">
                Failed to load calendar.
            </div>

        `;

    }

}


/* ========================================
   CALENDAR RENDERING
======================================== */

function renderCalendar() {

    calendarTitle.textContent =
        formatMonthYear(
            currentDate
        );


    calendarGrid.innerHTML =
        "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const weekStart =
        getCalendarWeekStart();


    const rawFirstWeekday =
        firstDay.getDay();


    const firstWeekday =
        (
            rawFirstWeekday -
            weekStart +
            7
        ) % 7;


    const previousMonthLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    const totalCells =
        Math.ceil(
            (
                firstWeekday +
                daysInMonth
            ) / 7
        ) * 7;


    /*
     * Keep the weekday headings synchronized
     * with the actual date grid.
     */

    const weekdayRow =
        document.querySelector(
            ".weekday-row"
        );


    if (weekdayRow) {

        const weekdays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];


        const orderedWeekdays =
            weekdays
                .slice(weekStart)
                .concat(
                    weekdays.slice(
                        0,
                        weekStart
                    )
                );


        weekdayRow.innerHTML =
            orderedWeekdays
                .map(
                    day =>
                        `<div>${day}</div>`
                )
                .join("");

    }


    for (
        let cellIndex = 0;
        cellIndex < totalCells;
        cellIndex++
    ) {

        let cellDate;

        let dayNumber;

        let isOtherMonth =
            false;


        if (
            cellIndex <
            firstWeekday
        ) {

            dayNumber =
                previousMonthLastDay -
                firstWeekday +
                cellIndex +
                1;


            cellDate =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );


            isOtherMonth =
                true;

        } else if (
            cellIndex >=
            firstWeekday +
            daysInMonth
        ) {

            dayNumber =
                cellIndex -
                firstWeekday -
                daysInMonth +
                1;


            cellDate =
                new Date(
                    year,
                    month + 1,
                    dayNumber
                );


            isOtherMonth =
                true;

        } else {

            dayNumber =
                cellIndex -
                firstWeekday +
                1;


            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );

        }


        calendarGrid.appendChild(

            createCalendarDay(
                cellDate,
                dayNumber,
                isOtherMonth
            )

        );

    }

}


/* ========================================
   CALENDAR DAY
======================================== */

function createCalendarDay(
    date,
    dayNumber,
    isOtherMonth
) {

    const element =
        document.createElement("div");


    element.className =
        "calendar-day";


    if (isOtherMonth) {

        element.classList.add(
            "other-month"
        );

    }


    const today =
        new Date();


    if (
        isSameDate(
            date,
            today
        )
    ) {

        element.classList.add(
            "today"
        );

    }


    if (
        isSameDate(
            date,
            selectedDate
        )
    ) {

        element.classList.add(
            "selected"
        );

    }


    const dayTasks =
        getTasksForDate(
            date
        );


    const dayProjects =
        getProjectsForDate(
            date
        );


    const events = [

        ...dayProjects.map(
            project => ({

                type: "project",

                title:
                    project.name

            })
        ),

        ...dayTasks.map(
            task => ({

                type: "task",

                title:
                    task.title,

                completed:
                    task.completed

            })
        )

    ];


    const visibleEvents =
        events.slice(
            0,
            3
        );


    const remainingEvents =
        events.length -
        visibleEvents.length;


    element.innerHTML = `

        <div class="day-header">

            <div class="day-number">
                ${dayNumber}
            </div>

        </div>


        <div class="day-events">

            ${visibleEvents.map(
                event => `

                    <div
                        class="
                            calendar-event
                            ${
                                event.type === "project"
                                    ? "project-event"
                                    : "task-event"
                            }
                            ${
                                event.completed
                                    ? "completed-event"
                                    : ""
                            }
                        "
                    >

                        <span class="event-marker"></span>

                        <span class="event-title">
                            ${escapeHtml(
                                event.title
                            )}
                        </span>

                    </div>

                `
            ).join("")}


            ${
                remainingEvents > 0
                    ? `
                        <div class="more-events">
                            +${remainingEvents} more
                        </div>
                    `
                    : ""
            }

        </div>

    `;


    element.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );


            if (
                isOtherMonth
            ) {

                currentDate =
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1
                    );

                renderCalendar();

            }


            renderSelectedDate();

        }
    );


    return element;

}


/* ========================================
   SELECTED DATE
======================================== */

function renderSelectedDate() {

    selectedDateTitle.textContent =
        formatLongDate(
            selectedDate
        );


    const dayTasks =
        getTasksForDate(
            selectedDate
        );


    const dayProjects =
        getProjectsForDate(
            selectedDate
        );


    if (
        dayTasks.length === 0 &&
        dayProjects.length === 0
    ) {

        selectedDateContent.innerHTML = `

            <div class="empty-state">
                No tasks or project deadlines
                for this day.
            </div>

        `;

        return;

    }


    selectedDateContent.innerHTML = `

        <div class="selected-day-list">

            ${dayProjects.map(
                project => `

                    <div class="day-item">

                        <div class="day-item-marker project-marker"></div>

                        <div>

                            <div class="day-item-title">
                                ${escapeHtml(
                                    project.name
                                )}
                            </div>

                            <div class="day-item-meta">
                                Project deadline
                            </div>

                        </div>

                    </div>

                `
            ).join("")}


            ${dayTasks.map(
                task => `

                    <div class="day-item">

                        <div class="day-item-marker task-marker"></div>

                        <div>

                            <div
                                class="
                                    day-item-title
                                    ${
                                        task.completed
                                            ? "completed-task"
                                            : ""
                                    }
                                "
                            >
                                ${escapeHtml(
                                    task.title
                                )}
                            </div>

                            <div class="day-item-meta">

                                ${
                                    capitalize(
                                        task.priority ||
                                        "medium"
                                    )
                                }

                                ·

                                ${
                                    task.estimatedMinutes ||
                                    0
                                } min

                            </div>

                        </div>

                    </div>

                `
            ).join("")}

        </div>

    `;

}


/* ========================================
   UPCOMING
======================================== */

function renderUpcoming() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcomingTasks =
        tasks
            .filter(task => {

                if (!task.dueDate) {
                    return false;
                }


                const date =
                    parseDateKey(
                        task.dueDate
                    );


                if (!date) {
                    return false;
                }


                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return (
                    date >= today &&
                    !task.completed
                );

            })
            .sort(
                (a, b) => {

                    return (
                        String(
                            a.dueDate
                        )
                        .localeCompare(
                            String(
                                b.dueDate
                            )
                        )
                    );

                }
            )
            .slice(
                0,
                8
            );


    upcomingCount.textContent =
        upcomingTasks.length;


    if (
        upcomingTasks.length === 0
    ) {

        upcomingList.innerHTML = `

            <div class="empty-state">
                No upcoming tasks.
            </div>

        `;

        return;

    }


    upcomingList.innerHTML =
        upcomingTasks
            .map(
                task => {

                    const date =
                        parseDateKey(
                            task.dueDate
                        );


                    return `

                        <div class="upcoming-item">

                            <div class="upcoming-date">

                                <div class="upcoming-day">
                                    ${date.getDate()}
                                </div>

                                <div class="upcoming-month">
                                    ${formatShortMonth(date)}
                                </div>

                            </div>


                            <div class="upcoming-content">

                                <div class="upcoming-title">

                                    ${escapeHtml(
                                        task.title
                                    )}

                                </div>


                                <div class="upcoming-meta">

                                    ${
                                        capitalize(
                                            task.priority ||
                                            "medium"
                                        )
                                    }

                                    ·

                                    ${
                                        task.estimatedMinutes ||
                                        0
                                    } min

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ========================================
   PROJECT SELECT
======================================== */

function populateProjectSelect() {

    taskProjectSelect.innerHTML = `

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


            taskProjectSelect.appendChild(
                option
            );

        }
    );

}


/* ========================================
   MODAL
======================================== */

function openTaskModal(
    date = selectedDate
) {

    taskForm.reset();


    applyCalendarDefaultPriority();


    taskDateInput.value =
        formatDateKey(
            date
        );


    formError.classList.add(
        "hidden"
    );


    formError.textContent =
        "";


    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "task-title"
                )
                .focus();

        },
        0
    );

}


function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );

}


function showFormError(message) {

    formError.textContent =
        message;

    formError.classList.remove(
        "hidden"
    );

}


document
    .getElementById(
        "add-task-button"
    )
    .addEventListener(
        "click",
        () => {

            openTaskModal(
                selectedDate
            );

        }
    );


document
    .getElementById(
        "close-modal"
    )
    .addEventListener(
        "click",
        closeTaskModal
    );


document
    .getElementById(
        "cancel-task"
    )
    .addEventListener(
        "click",
        closeTaskModal
    );


document
    .querySelector(
        ".modal-overlay"
    )
    .addEventListener(
        "click",
        closeTaskModal
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !taskModal.classList.contains(
                "hidden"
            )
        ) {

            closeTaskModal();

        }

    }
);


/* ========================================
   CREATE TASK
======================================== */

taskForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        formError.classList.add(
            "hidden"
        );


        const title =
            document
                .getElementById(
                    "task-title"
                )
                .value
                .trim();


        const priority =
            document
                .getElementById(
                    "task-priority"
                )
                .value ||
            getCalendarDefaultPriority();


        const estimatedMinutes =
            document
                .getElementById(
                    "task-time"
                )
                .value;


        const dueDate =
            taskDateInput.value;


        const projectId =
            taskProjectSelect.value;


        if (!title) {

            showFormError(
                "Task title is required."
            );

            return;

        }


        if (!dueDate) {

            showFormError(
                "Please choose a due date."
            );

            return;

        }


        if (
            !estimatedMinutes ||
            Number(estimatedMinutes) <= 0
        ) {

            showFormError(
                "Estimated time must be greater than 0."
            );

            return;

        }


        saveTaskButton.disabled =
            true;


        saveTaskButton.textContent =
            "Creating...";


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

                                projectId:
                                    projectId
                                        ? Number(
                                            projectId
                                        )
                                        : null,

                                dueDate

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

                    data.errors
                        ? data.errors.join(
                            "\n"
                        )
                        : data.message ||
                          "Failed to create task."

                );

            }


            selectedDate =
                parseDateKey(
                    dueDate
                ) ||
                new Date();


            currentDate =
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1
                );


            closeTaskModal();


            await loadData();


        } catch (error) {

            console.error(
                "Task creation error:",
                error
            );


            showFormError(
                error.message
            );

        } finally {

            saveTaskButton.disabled =
                false;


            saveTaskButton.textContent =
                "Create Task";

        }

    }
);


/* ========================================
   MONTH NAVIGATION
======================================== */

document
    .getElementById(
        "previous-month"
    )
    .addEventListener(
        "click",
        () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                );


            renderCalendar();

        }
    );


document
    .getElementById(
        "next-month"
    )
    .addEventListener(
        "click",
        () => {

            currentDate =
                new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                );


            renderCalendar();

        }
    );


document
    .getElementById(
        "today-button"
    )
    .addEventListener(
        "click",
        () => {

            const today =
                new Date();


            currentDate =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );


            selectedDate =
                today;


            renderCalendar();

            renderSelectedDate();

        }
    );


/* ========================================
   SYNC SETTINGS CHANGES
======================================== */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            "flowosSettings"
        ) {

            return;

        }


        renderCalendar();

        applyCalendarDefaultPriority();

    }
);


/* ========================================
   INITIALIZE
======================================== */

loadData();