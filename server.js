require("dotenv").config();

const path = require("path");
const express = require("express");

const pool = require("./db");

const {
    hashPassword,
    verifyPassword,
    createSessionToken,
    getSessionExpiry,
    setSessionCookie,
    clearSessionCookie,
    getAuthenticatedUser,
    requireAuth
} = require("./auth");

const app = express();

const PORT =
    process.env.PORT || 3000;


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

app.use(
    express.json()
);


/* ========================================
   HELPERS
======================================== */

function sendPage(
    res,
    filename
) {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            filename
        )
    );
}


function validateTaskInput({
    title,
    priority,
    estimatedMinutes,
    dueDate
}) {
    const errors = [];

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

    const estimatedTime =
        Number(estimatedMinutes);

    if (
        estimatedMinutes === undefined ||
        estimatedMinutes === null ||
        estimatedMinutes === "" ||
        !Number.isFinite(
            estimatedTime
        ) ||
        estimatedTime <= 0
    ) {
        errors.push(
            "Estimated time must be a number greater than 0."
        );
    }

    if (
        dueDate !== undefined &&
        dueDate !== null &&
        dueDate !== ""
    ) {
        const pattern =
            /^\d{4}-\d{2}-\d{2}$/;

        if (
            !pattern.test(
                String(dueDate)
            )
        ) {
            errors.push(
                "Due date must be a valid date."
            );
        }
    }

    return errors;
}


function validateProjectInput({
    name,
    description,
    status,
    color,
    deadline
}) {
    const errors = [];

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

    if (deadline) {
        const pattern =
            /^\d{4}-\d{2}-\d{2}$/;

        if (
            !pattern.test(
                String(deadline)
            )
        ) {
            errors.push(
                "Project deadline must be a valid date."
            );
        }
    }

    return errors;
}


async function validateProjectId(
    projectId,
    userId
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
              AND user_id = $2
            `,
            [
                numericProjectId,
                userId
            ]
        );

    if (
        result.rows.length === 0
    ) {
        return "Project not found.";
    }

    return null;
}


/* ========================================
   AUTH API
======================================== */


/*
REGISTER
*/

app.post(
    "/api/auth/register",
    async (req, res) => {
        try {
            const {
                name,
                email,
                password
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {
                return res.status(400).json({
                    message:
                        "Name, email and password are required."
                });
            }

            const cleanName =
                String(name).trim();

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            if (
                cleanName.length < 2
            ) {
                return res.status(400).json({
                    message:
                        "Name must contain at least 2 characters."
                });
            }

            if (
                password.length < 8
            ) {
                return res.status(400).json({
                    message:
                        "Password must contain at least 8 characters."
                });
            }

            const existing =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = $1
                    `,
                    [cleanEmail]
                );

            if (
                existing.rows.length > 0
            ) {
                return res.status(409).json({
                    message:
                        "An account with this email already exists."
                });
            }

            const passwordHash =
                hashPassword(password);

            const result =
                await pool.query(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password_hash
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING
                        id,
                        name,
                        email
                    `,
                    [
                        cleanName,
                        cleanEmail,
                        passwordHash
                    ]
                );

            const user =
                result.rows[0];

            /*
             * The first account becomes
             * the owner of the existing
             * pre-authentication data.
             */

            const countResult =
                await pool.query(
                    `
                    SELECT COUNT(*)::integer
                    AS count
                    FROM users
                    `
                );

            if (
                countResult.rows[0].count === 1
            ) {
                await pool.query(
                    `
                    UPDATE tasks
                    SET user_id = $1
                    WHERE user_id IS NULL
                    `,
                    [user.id]
                );

                await pool.query(
                    `
                    UPDATE projects
                    SET user_id = $1
                    WHERE user_id IS NULL
                    `,
                    [user.id]
                );
            }

            const token =
                createSessionToken();

            const expiresAt =
                getSessionExpiry();

            await pool.query(
                `
                INSERT INTO sessions
                (
                    id,
                    user_id,
                    expires_at
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,
                [
                    token,
                    user.id,
                    expiresAt
                ]
            );

            setSessionCookie(
                res,
                token,
                expiresAt
            );

            return res.status(201).json({
                user
            });

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to create account."
            });
        }
    }
);


/*
LOGIN
*/

app.post(
    "/api/auth/login",
    async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {
                return res.status(400).json({
                    message:
                        "Email and password are required."
                });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        name,
                        email,
                        password_hash
                    FROM users
                    WHERE email = $1
                    `,
                    [cleanEmail]
                );

            if (
                result.rows.length === 0
            ) {
                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });
            }

            const user =
                result.rows[0];

            const valid =
                verifyPassword(
                    password,
                    user.password_hash
                );

            if (!valid) {
                return res.status(401).json({
                    message:
                        "Invalid email or password."
                });
            }

            const token =
                createSessionToken();

            const expiresAt =
                getSessionExpiry();

            await pool.query(
                `
                INSERT INTO sessions
                (
                    id,
                    user_id,
                    expires_at
                )
                VALUES
                (
                    $1,
                    $2,
                    $3
                )
                `,
                [
                    token,
                    user.id,
                    expiresAt
                ]
            );

            setSessionCookie(
                res,
                token,
                expiresAt
            );

            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to log in."
            });
        }
    }
);


/*
LOGOUT
*/

app.post(
    "/api/auth/logout",
    async (req, res) => {
        try {
            const user =
                await getAuthenticatedUser(
                    req,
                    pool
                );

            if (user) {
                const cookies =
                    req.headers.cookie || "";

                const match =
                    cookies
                        .split(";")
                        .map(
                            item =>
                                item.trim()
                        )
                        .find(
                            item =>
                                item.startsWith(
                                    "flowos_session="
                                )
                        );

                if (match) {
                    const token =
                        decodeURIComponent(
                            match.substring(
                                "flowos_session="
                                    .length
                            )
                        );

                    await pool.query(
                        `
                        DELETE FROM sessions
                        WHERE id = $1
                        `,
                        [token]
                    );
                }
            }

            clearSessionCookie(res);

            return res.json({
                success: true
            });

        } catch (error) {
            clearSessionCookie(res);

            return res.json({
                success: true
            });
        }
    }
);


/*
CURRENT USER
*/

app.get(
    "/api/auth/me",
    async (req, res) => {
        try {
            const user =
                await getAuthenticatedUser(
                    req,
                    pool
                );

            if (!user) {
                return res.status(401).json({
                    message:
                        "Not authenticated."
                });
            }

            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error(
                "Auth check error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to check authentication."
            });
        }
    }
);


/* ========================================
   AUTH PAGES
======================================== */

app.get(
    "/login",
    (req, res) => {
        console.log("FLOWOS LOGIN ROUTE HIT");

        sendPage(
            res,
            "login.html"
        );
    }
);


app.get(
    "/register",
    (req, res) => {
        sendPage(
            res,
            "register.html"
        );
    }
);


/* ========================================
   PAGE ROUTES
======================================== */

async function protectedPage(
    req,
    res,
    filename
) {
    const user =
        await getAuthenticatedUser(
            req,
            pool
        );

    if (!user) {
        return res.redirect(
            "/login"
        );
    }

    return sendPage(
        res,
        filename
    );
}


app.get(
    "/",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "index.html"
        );
    }
);


app.get(
    "/tasks",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "tasks.html"
        );
    }
);


app.get(
    "/projects",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "projects.html"
        );
    }
);


app.get(
    "/calendar",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "calendar.html"
        );
    }
);


app.get(
    "/settings",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "settings.html"
        );
    }
);


app.get(
    "/analytics",
    async (req, res) => {
        await protectedPage(
            req,
            res,
            "analytics.html"
        );
    }
);


/* ========================================
   TASKS
======================================== */


/*
GET TASKS
*/

app.get(
    "/api/tasks",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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
                        AND p.user_id = $1
                    WHERE t.user_id = $1
                    ORDER BY t.id DESC
                    `,
                    [user.id]
                );

            return res.json(
                result.rows
            );

        } catch (error) {
            console.error(
                "Error fetching tasks:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to fetch tasks."
            });
        }
    }
);


/*
CREATE TASK
*/

app.post(
    "/api/tasks",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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

        if (errors.length > 0) {
            return res.status(400).json({
                message:
                    "Invalid task data.",
                errors
            });
        }

        try {
            const projectError =
                await validateProjectId(
                    projectId,
                    user.id
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

            const result =
                await pool.query(
                    `
                    INSERT INTO tasks
                    (
                        title,
                        priority,
                        estimated_minutes,
                        project_id,
                        due_date,
                        user_id
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
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
                        priority || "medium",
                        Number(
                            estimatedMinutes
                        ),
                        numericProjectId,
                        dueDate || null,
                        user.id
                    ]
                );

            const task =
                result.rows[0];

            if (task.projectId) {
                const project =
                    await pool.query(
                        `
                        SELECT name
                        FROM projects
                        WHERE id = $1
                          AND user_id = $2
                        `,
                        [
                            task.projectId,
                            user.id
                        ]
                    );

                task.projectName =
                    project.rows.length
                        ? project.rows[0].name
                        : null;
            } else {
                task.projectName = null;
            }

            return res.status(201).json(
                task
            );

        } catch (error) {
            console.error(
                "Error creating task:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to create task."
            });
        }
    }
);


/*
UPDATE TASK
*/

app.put(
    "/api/tasks/:id",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

        const taskId =
            Number(req.params.id);

        const {
            title,
            priority,
            estimatedMinutes,
            completed,
            projectId,
            dueDate
        } = req.body;

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

        if (errors.length > 0) {
            return res.status(400).json({
                message:
                    "Invalid task data.",
                errors
            });
        }

        if (
            typeof completed !==
            "boolean"
        ) {
            return res.status(400).json({
                message:
                    "Completed must be true or false."
            });
        }

        try {
            const projectError =
                await validateProjectId(
                    projectId,
                    user.id
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

            let result;

            if (
                dueDate === undefined
            ) {
                result =
                    await pool.query(
                        `
                        UPDATE tasks
                        SET
                            title = $1,
                            priority = $2,
                            estimated_minutes = $3,
                            completed = $4,
                            project_id = $5
                        WHERE id = $6
                          AND user_id = $7
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
                            taskId,
                            user.id
                        ]
                    );
            } else {
                result =
                    await pool.query(
                        `
                        UPDATE tasks
                        SET
                            title = $1,
                            priority = $2,
                            estimated_minutes = $3,
                            completed = $4,
                            project_id = $5,
                            due_date = $6
                        WHERE id = $7
                          AND user_id = $8
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
                            dueDate || null,
                            taskId,
                            user.id
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

            const task =
                result.rows[0];

            if (task.projectId) {
                const project =
                    await pool.query(
                        `
                        SELECT name
                        FROM projects
                        WHERE id = $1
                          AND user_id = $2
                        `,
                        [
                            task.projectId,
                            user.id
                        ]
                    );

                task.projectName =
                    project.rows.length
                        ? project.rows[0].name
                        : null;
            } else {
                task.projectName = null;
            }

            return res.json(task);

        } catch (error) {
            console.error(
                "Error updating task:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to update task."
            });
        }
    }
);


/*
DELETE TASK
*/

app.delete(
    "/api/tasks/:id",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

        const taskId =
            Number(req.params.id);

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
                      AND user_id = $2
                    RETURNING id
                    `,
                    [
                        taskId,
                        user.id
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res.status(404).json({
                    message:
                        "Task not found."
                });
            }

            return res.json({
                message:
                    "Task deleted successfully."
            });

        } catch (error) {
            console.error(
                "Error deleting task:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to delete task."
            });
        }
    }
);


/* ========================================
   PROJECTS
======================================== */


/*
GET PROJECTS
*/

app.get(
    "/api/projects",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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
                        AND t.user_id = $1

                    WHERE p.user_id = $1

                    GROUP BY p.id

                    ORDER BY p.id DESC
                    `,
                    [user.id]
                );

            const projects =
                result.rows.map(
                    project => {
                        const taskCount =
                            Number(
                                project.taskCount
                            ) || 0;

                        const completed =
                            Number(
                                project.completedTaskCount
                            ) || 0;

                        const progress =
                            taskCount === 0
                                ? 0
                                : Math.round(
                                    (
                                        completed /
                                        taskCount
                                    ) * 100
                                );

                        return {
                            ...project,
                            taskCount,
                            completedTaskCount:
                                completed,
                            progress
                        };
                    }
                );

            return res.json(
                projects
            );

        } catch (error) {
            console.error(
                "Error fetching projects:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to fetch projects."
            });
        }
    }
);


/*
CREATE PROJECT
*/

app.post(
    "/api/projects",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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

        if (errors.length > 0) {
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
                        deadline,
                        user_id
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
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
                        status || "planning",
                        color || "blue",
                        deadline || null,
                        user.id
                    ]
                );

            return res.status(201).json({
                ...result.rows[0],
                taskCount: 0,
                completedTaskCount: 0,
                progress: 0
            });

        } catch (error) {
            console.error(
                "Error creating project:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to create project."
            });
        }
    }
);


/* ========================================
   CALENDAR
======================================== */

app.get(
    "/api/calendar",
    async (req, res) => {
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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
                        AND p.user_id = $1

                    WHERE t.user_id = $1

                    ORDER BY
                        t.due_date ASC NULLS LAST,
                        t.id DESC
                    `,
                    [user.id]
                );

            return res.json(
                result.rows
            );

        } catch (error) {
            console.error(
                "Error fetching calendar:",
                error
            );

            return res.status(500).json({
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
        const user =
            await requireAuth(
                req,
                res,
                pool
            );

        if (!user) {
            return;
        }

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

                    WHERE user_id = $1
                    `,
                    [user.id]
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

                    WHERE user_id = $1
                    `,
                    [user.id]
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

            return res.json({
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

            return res.status(500).json({
                message:
                    "Failed to fetch dashboard summary."
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

            return res.json({
                status: "ok",
                message:
                    "FlowOS server is running."
            });

        } catch (error) {
            console.error(
                "Health check failed:",
                error
            );

            return res.status(500).json({
                status: "error",
                message:
                    "Database connection failed."
            });
        }
    }
);


/* ========================================
   STATIC FILES
======================================== */

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/* ========================================
   API 404
======================================== */

app.use(
    "/api",
    (req, res) => {
        return res.status(404).json({
            message:
                "API endpoint not found."
        });
    }
);


/* ========================================
   SERVER START
======================================== */

async function startServer() {
    try {
        /*
         * Clean expired sessions.
         */

        await pool.query(
            `
            DELETE FROM sessions
            WHERE expires_at <= NOW()
            `
        );

        console.log(
            "Database connection verified."
        );

        app.listen(
            PORT,
            () => {
                console.log(
                    `FlowOS server running on port ${PORT}`
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