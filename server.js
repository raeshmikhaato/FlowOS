const path = require("path");
const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 3000;


/* ========================================
   CONSTANTS
======================================== */

const VALID_PRIORITIES = [
    "low",
    "medium",
    "high"
];

const VALID_PROJECT_STATUSES = [
    "planning",
    "active",
    "completed",
    "archived"
];

const VALID_PROJECT_COLORS = [
    "blue",
    "purple",
    "green",
    "orange",
    "red"
];


/* ========================================
   MIDDLEWARE
======================================== */

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* ========================================
   DATABASE INITIALIZATION
======================================== */

async function initializeDatabase() {

    try {

        /*
         * Calendar tasks need a date.
         *
         * Add the column automatically if it
         * doesn't already exist.
         */

        await pool.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS due_date DATE
        `);


        console.log(
            "Database initialized successfully."
        );

    } catch (error) {

        console.error(
            "Database initialization failed:",
            error
        );

        throw error;

    }

}


/* ========================================
   TASK VALIDATION
======================================== */

function validateTaskInput({
    title,
    priority,
    estimatedMinutes,
    dueDate
}) {

    const errors = [];


    /*
     * TITLE
     */

    if (
        typeof title !== "string" ||
        title.trim().length === 0
    ) {

        errors.push(
            "Task title is required."
        );

    } else if (
        title.trim().length > 200
    ) {

        errors.push(
            "Task title must be 200 characters or less."
        );

    }


    /*
     * PRIORITY
     */

    if (
        priority &&
        !VALID_PRIORITIES.includes(
            priority
        )
    ) {

        errors.push(
            "Priority must be low, medium, or high."
        );

    }


    /*
     * ESTIMATED TIME
     */

    const estimatedTime =
        Number(estimatedMinutes);


    if (
        estimatedMinutes === undefined ||
        estimatedMinutes === null ||
        estimatedMinutes === "" ||
        !Number.isFinite(estimatedTime) ||
        estimatedTime <= 0
    ) {

        errors.push(
            "Estimated time must be a number greater than 0."
        );

    }


    /*
     * DUE DATE
     *
     * Optional for Tasks page.
     * Required only when Calendar creates
     * a task.
     */

    if (
        dueDate !== undefined &&
        dueDate !== null &&
        dueDate !== ""
    ) {

        const datePattern =
            /^\d{4}-\d{2}-\d{2}$/;


        if (
            !datePattern.test(
                String(dueDate)
            )
        ) {

            errors.push(
                "Due date must be a valid date."
            );

        } else {

            const parsedDate =
                new Date(
                    `${dueDate}T00:00:00`
                );


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                errors.push(
                    "Due date must be a valid date."
                );

            }

        }

    }


    return errors;

}


/* ========================================
   PROJECT VALIDATION
======================================== */

function validateProjectInput({
    name,
    description,
    status,
    color,
    deadline
}) {

    const errors = [];


    /*
     * PROJECT NAME
     */

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {

        errors.push(
            "Project name is required."
        );

    } else if (
        name.trim().length > 150
    ) {

        errors.push(
            "Project name must be 150 characters or less."
        );

    }


    /*
     * DESCRIPTION
     */

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {

        errors.push(
            "Project description must be text."
        );

    } else if (
        typeof description === "string" &&
        description.length > 1000
    ) {

        errors.push(
            "Project description must be 1000 characters or less."
        );

    }


    /*
     * STATUS
     */

    if (
        status &&
        !VALID_PROJECT_STATUSES.includes(
            status
        )
    ) {

        errors.push(
            "Project status is invalid."
        );

    }


    /*
     * COLOR
     */

    if (
        color &&
        !VALID_PROJECT_COLORS.includes(
            color
        )
    ) {

        errors.push(
            "Project color is invalid."
        );

    }


    /*
     * DEADLINE
     */

    if (deadline) {

        const deadlinePattern =
            /^\d{4}-\d{2}-\d{2}$/;


        if (
            !deadlinePattern.test(
                deadline
            )
        ) {

            errors.push(
                "Project deadline must be a valid date."
            );

        } else {

            const deadlineDate =
                new Date(
                    `${deadline}T00:00:00`
                );


            if (
                Number.isNaN(
                    deadlineDate.getTime()
                )
            ) {

                errors.push(
                    "Project deadline must be a valid date."
                );

            }

        }

    }


    return errors;

}


/* ========================================
   PROJECT ID VALIDATION
======================================== */

async function validateProjectId(
    projectId
) {

    if (
        projectId === undefined ||
        projectId === null ||
        projectId === ""
    ) {

        return null;

    }


    const numericProjectId =
        Number(projectId);


    if (
        !Number.isInteger(
            numericProjectId
        ) ||
        numericProjectId <= 0
    ) {

        return (
            "Project ID must be a valid positive integer."
        );

    }


    const result =
        await pool.query(
            `
            SELECT id
            FROM projects
            WHERE id = $1
            `,
            [numericProjectId]
        );


    if (
        result.rows.length === 0
    ) {

        return "Project not found.";

    }


    return null;

}


/* ========================================
   PAGE ROUTES
======================================== */


/*
 * Dashboard
 */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/*
 * Tasks
 */

app.get(
    "/tasks",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "tasks.html"
            )
        );

    }
);


/*
 * Projects
 */

app.get(
    "/projects",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "projects.html"
            )
        );

    }
);


/*
 * Calendar
 */

app.get(
    "/calendar",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "calendar.html"
            )
        );

    }
);
/* ========================================
   SETTINGS PAGE
======================================== */

app.get("/settings", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "settings.html"
        )
    );

});
/*
 * Analytics
 */

app.get(
    "/analytics",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "analytics.html"
            )
        );

    }
);


/* ========================================
   GET ALL TASKS
======================================== */

app.get(
    "/api/tasks",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT

                        t.id,

                        t.title,

                        t.priority,

                        t.estimated_minutes
                            AS "estimatedMinutes",

                        t.completed,

                        t.project_id
                            AS "projectId",

                        t.due_date
                            AS "dueDate",

                        p.name
                            AS "projectName"

                    FROM tasks t

                    LEFT JOIN projects p
                        ON t.project_id = p.id

                    ORDER BY t.id DESC
                    `
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching tasks:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch tasks."

            });

        }

    }
);


/* ========================================
   GET ALL PROJECTS
======================================== */

app.get(
    "/api/projects",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT

                        p.id,

                        p.name,

                        p.description,

                        p.status,

                        p.color,

                        p.deadline,

                        p.created_at
                            AS "createdAt",

                        p.updated_at
                            AS "updatedAt",

                        COUNT(t.id)::integer
                            AS "taskCount",

                        COUNT(t.id)
                            FILTER (
                                WHERE t.completed = true
                            )::integer
                            AS "completedTaskCount"

                    FROM projects p

                    LEFT JOIN tasks t
                        ON t.project_id = p.id

                    GROUP BY p.id

                    ORDER BY p.id DESC
                    `
                );


            const projects =
                result.rows.map(
                    project => {

                        const taskCount =
                            Number(
                                project.taskCount
                            ) || 0;


                        const completedTaskCount =
                            Number(
                                project.completedTaskCount
                            ) || 0;


                        const progress =
                            taskCount === 0
                                ? 0
                                : Math.round(
                                    (
                                        completedTaskCount /
                                        taskCount
                                    ) * 100
                                );


                        return {

                            ...project,

                            taskCount,

                            completedTaskCount,

                            progress

                        };

                    }
                );


            res.json(
                projects
            );

        } catch (error) {

            console.error(
                "Error fetching projects:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch projects."

            });

        }

    }
);


/* ========================================
   CALENDAR API
======================================== */

app.get(
    "/api/calendar",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    SELECT

                        t.id,

                        t.title,

                        t.priority,

                        t.estimated_minutes
                            AS "estimatedMinutes",

                        t.completed,

                        t.project_id
                            AS "projectId",

                        t.due_date
                            AS "dueDate",

                        p.name
                            AS "projectName"

                    FROM tasks t

                    LEFT JOIN projects p
                        ON t.project_id = p.id

                    ORDER BY
                        t.due_date ASC NULLS LAST,
                        t.id DESC
                    `
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching calendar:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch calendar."

            });

        }

    }
);


/* ========================================
   DASHBOARD SUMMARY
======================================== */

app.get(
    "/api/dashboard/summary",
    async (req, res) => {

        try {

            const taskResult =
                await pool.query(
                    `
                    SELECT

                        COUNT(*)::integer
                            AS "totalTasks",

                        COUNT(*)
                            FILTER (
                                WHERE completed = false
                            )::integer
                            AS "activeTasks",

                        COUNT(*)
                            FILTER (
                                WHERE completed = true
                            )::integer
                            AS "completedTasks"

                    FROM tasks
                    `
                );


            const projectResult =
                await pool.query(
                    `
                    SELECT

                        COUNT(*)::integer
                            AS "totalProjects",

                        COUNT(*)
                            FILTER (
                                WHERE status = 'active'
                            )::integer
                            AS "activeProjects",

                        COUNT(*)
                            FILTER (
                                WHERE status = 'completed'
                            )::integer
                            AS "completedProjects"

                    FROM projects
                    `
                );


            const taskSummary =
                taskResult.rows[0];


            const projectSummary =
                projectResult.rows[0];


            const totalTasks =
                Number(
                    taskSummary.totalTasks
                );


            const completedTasks =
                Number(
                    taskSummary.completedTasks
                );


            const completionRate =
                totalTasks === 0
                    ? 0
                    : Math.round(
                        (
                            completedTasks /
                            totalTasks
                        ) * 100
                    );


            res.json({

                tasks: {

                    total:
                        totalTasks,

                    active:
                        Number(
                            taskSummary.activeTasks
                        ),

                    completed:
                        completedTasks,

                    completionRate

                },

                projects: {

                    total:
                        Number(
                            projectSummary.totalProjects
                        ),

                    active:
                        Number(
                            projectSummary.activeProjects
                        ),

                    completed:
                        Number(
                            projectSummary.completedProjects
                        )

                }

            });

        } catch (error) {

            console.error(
                "Error fetching dashboard summary:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch dashboard summary."

            });

        }

    }
);


/* ========================================
   CREATE PROJECT
======================================== */

app.post(
    "/api/projects",
    async (req, res) => {

        const {
            name,
            description,
            status,
            color,
            deadline
        } = req.body;


        const errors =
            validateProjectInput({

                name,
                description,
                status,
                color,
                deadline

            });


        if (
            errors.length > 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid project data.",

                errors

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    INSERT INTO projects
                    (
                        name,
                        description,
                        status,
                        color,
                        deadline
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )

                    RETURNING

                        id,

                        name,

                        description,

                        status,

                        color,

                        deadline,

                        created_at
                            AS "createdAt",

                        updated_at
                            AS "updatedAt"
                    `,
                    [

                        name.trim(),

                        description
                            ? description.trim()
                            : null,

                        status ||
                            "planning",

                        color ||
                            "blue",

                        deadline ||
                            null

                    ]
                );


            const project = {

                ...result.rows[0],

                taskCount: 0,

                completedTaskCount: 0,

                progress: 0

            };


            res.status(201).json(
                project
            );

        } catch (error) {

            console.error(
                "Error creating project:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to create project."

            });

        }

    }
);


/* ========================================
   CREATE TASK
======================================== */

app.post(
    "/api/tasks",
    async (req, res) => {

        const {
            title,
            priority,
            estimatedMinutes,
            projectId,
            dueDate
        } = req.body;


        const errors =
            validateTaskInput({

                title,
                priority,
                estimatedMinutes,
                dueDate

            });


        if (
            errors.length > 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid task data.",

                errors

            });

        }


        try {

            /*
             * Check project.
             */

            const projectError =
                await validateProjectId(
                    projectId
                );


            if (projectError) {

                return res.status(400).json({

                    message:
                        projectError

                });

            }


            const numericProjectId =
                projectId === undefined ||
                projectId === null ||
                projectId === ""
                    ? null
                    : Number(projectId);


            /*
             * Insert task WITH due date.
             */

            const result =
                await pool.query(
                    `
                    INSERT INTO tasks
                    (
                        title,
                        priority,
                        estimated_minutes,
                        project_id,
                        due_date
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )

                    RETURNING

                        id,

                        title,

                        priority,

                        estimated_minutes
                            AS "estimatedMinutes",

                        completed,

                        project_id
                            AS "projectId",

                        due_date
                            AS "dueDate"
                    `,
                    [

                        title.trim(),

                        priority ||
                            "medium",

                        Number(
                            estimatedMinutes
                        ),

                        numericProjectId,

                        dueDate ||
                            null

                    ]
                );


            const createdTask =
                result.rows[0];


            /*
             * Get project name.
             */

            if (
                createdTask.projectId
            ) {

                const projectResult =
                    await pool.query(
                        `
                        SELECT name
                        FROM projects
                        WHERE id = $1
                        `,
                        [
                            createdTask.projectId
                        ]
                    );


                createdTask.projectName =
                    projectResult.rows.length > 0
                        ? projectResult.rows[0].name
                        : null;

            } else {

                createdTask.projectName =
                    null;

            }


            res.status(201).json(
                createdTask
            );

        } catch (error) {

            console.error(
                "Error creating task:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to create task."

            });

        }

    }
);


/* ========================================
   UPDATE TASK
======================================== */

app.put(
    "/api/tasks/:id",
    async (req, res) => {

        const { id } =
            req.params;


        const {
            title,
            priority,
            estimatedMinutes,
            completed,
            projectId,
            dueDate
        } = req.body;


        const taskId =
            Number(id);


        if (
            !Number.isInteger(taskId) ||
            taskId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid task ID."

            });

        }


        const errors =
            validateTaskInput({

                title,
                priority,
                estimatedMinutes,
                dueDate

            });


        if (
            errors.length > 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid task data.",

                errors

            });

        }


        if (
            typeof completed !== "boolean"
        ) {

            return res.status(400).json({

                message:
                    "Completed must be true or false."

            });

        }


        try {

            const projectError =
                await validateProjectId(
                    projectId
                );


            if (projectError) {

                return res.status(400).json({

                    message:
                        projectError

                });

            }


            const numericProjectId =
                projectId === undefined ||
                projectId === null ||
                projectId === ""
                    ? null
                    : Number(projectId);


            /*
             * IMPORTANT:
             *
             * If Tasks/Dashboard updates a task without
             * sending dueDate, keep the existing date.
             *
             * If Calendar sends dueDate, update it.
             */

            let result;


            if (
                dueDate === undefined
            ) {

                result =
                    await pool.query(
                        `
                        UPDATE tasks

                        SET

                            title =
                                $1,

                            priority =
                                $2,

                            estimated_minutes =
                                $3,

                            completed =
                                $4,

                            project_id =
                                $5

                        WHERE id = $6

                        RETURNING

                            id,

                            title,

                            priority,

                            estimated_minutes
                                AS "estimatedMinutes",

                            completed,

                            project_id
                                AS "projectId",

                            due_date
                                AS "dueDate"
                        `,
                        [

                            title.trim(),

                            priority,

                            Number(
                                estimatedMinutes
                            ),

                            completed,

                            numericProjectId,

                            taskId

                        ]
                    );

            } else {

                result =
                    await pool.query(
                        `
                        UPDATE tasks

                        SET

                            title =
                                $1,

                            priority =
                                $2,

                            estimated_minutes =
                                $3,

                            completed =
                                $4,

                            project_id =
                                $5,

                            due_date =
                                $6

                        WHERE id = $7

                        RETURNING

                            id,

                            title,

                            priority,

                            estimated_minutes
                                AS "estimatedMinutes",

                            completed,

                            project_id
                                AS "projectId",

                            due_date
                                AS "dueDate"
                        `,
                        [

                            title.trim(),

                            priority,

                            Number(
                                estimatedMinutes
                            ),

                            completed,

                            numericProjectId,

                            dueDate ||
                                null,

                            taskId

                        ]
                    );

            }


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Task not found."

                });

            }


            const updatedTask =
                result.rows[0];


            /*
             * Get project name.
             */

            if (
                updatedTask.projectId
            ) {

                const projectResult =
                    await pool.query(
                        `
                        SELECT name
                        FROM projects
                        WHERE id = $1
                        `,
                        [
                            updatedTask.projectId
                        ]
                    );


                updatedTask.projectName =
                    projectResult.rows.length > 0
                        ? projectResult.rows[0].name
                        : null;

            } else {

                updatedTask.projectName =
                    null;

            }


            res.json(
                updatedTask
            );

        } catch (error) {

            console.error(
                "Error updating task:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to update task."

            });

        }

    }
);


/* ========================================
   DELETE TASK
======================================== */

app.delete(
    "/api/tasks/:id",
    async (req, res) => {

        const { id } =
            req.params;


        const taskId =
            Number(id);


        if (
            !Number.isInteger(taskId) ||
            taskId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid task ID."

            });

        }


        try {

            const result =
                await pool.query(
                    `
                    DELETE FROM tasks

                    WHERE id = $1

                    RETURNING id
                    `,
                    [taskId]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "Task not found."

                });

            }


            res.json({

                message:
                    "Task deleted successfully."

            });

        } catch (error) {

            console.error(
                "Error deleting task:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to delete task."

            });

        }

    }
);


/* ========================================
   HEALTH CHECK
======================================== */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await pool.query(
                "SELECT 1"
            );


            res.json({

                status:
                    "ok",

                message:
                    "FlowOS server is running."

            });

        } catch (error) {

            console.error(
                "Health check failed:",
                error
            );


            res.status(500).json({

                status:
                    "error",

                message:
                    "Database connection failed."

            });

        }

    }
);


/* ========================================
   API 404
======================================== */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            message:
                "API endpoint not found."

        });

    }
);


/* ========================================
   START SERVER
======================================== */

async function startServer() {

    try {

        await initializeDatabase();


        app.listen(
            PORT,
            () => {

                console.log(
                    `FlowOS server running at http://localhost:${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "FlowOS could not start:",
            error
        );

        process.exit(1);

    }

}


startServer();