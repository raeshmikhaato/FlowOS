require("dotenv").config();

const pool = require("./db");

async function initializeDatabase() {
    const client =
        await pool.connect();

    try {
        await client.query(
            "BEGIN"
        );

        /*
        ========================================
        PROJECTS TABLE
        ========================================
        */

        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,

                name VARCHAR(150) NOT NULL,

                description TEXT,

                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'planning',

                color VARCHAR(20)
                    NOT NULL
                    DEFAULT 'blue',

                deadline DATE,

                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            )
        `);

        /*
        ========================================
        TASKS TABLE
        ========================================
        */

        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,

                title VARCHAR(200) NOT NULL,

                priority VARCHAR(20)
                    NOT NULL
                    DEFAULT 'medium',

                estimated_minutes INTEGER,

                completed BOOLEAN
                    NOT NULL
                    DEFAULT FALSE,

                project_id INTEGER
                    REFERENCES projects(id)
                    ON DELETE SET NULL,

                due_date DATE
            )
        `);

        /*
        ========================================
        USERS TABLE
        ========================================
        */

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,

                name VARCHAR(100)
                    NOT NULL,

                email VARCHAR(255)
                    NOT NULL
                    UNIQUE,

                password_hash TEXT
                    NOT NULL,

                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            )
        `);

        /*
        ========================================
        SESSIONS TABLE
        ========================================
        */

        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(64) PRIMARY KEY,

                user_id INTEGER
                    NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                expires_at TIMESTAMP
                    NOT NULL,

                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            )
        `);

        /*
        ========================================
        EXISTING TASK COLUMNS
        ========================================
        */

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            due_date DATE
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            project_id INTEGER
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            completed BOOLEAN
            NOT NULL
            DEFAULT FALSE
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            estimated_minutes INTEGER
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            priority VARCHAR(20)
            NOT NULL
            DEFAULT 'medium'
        `);

        /*
        ========================================
        EXISTING PROJECT COLUMNS
        ========================================
        */

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            description TEXT
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            status VARCHAR(20)
            NOT NULL
            DEFAULT 'planning'
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            color VARCHAR(20)
            NOT NULL
            DEFAULT 'blue'
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            deadline DATE
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            created_at TIMESTAMP
            NOT NULL
            DEFAULT CURRENT_TIMESTAMP
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            updated_at TIMESTAMP
            NOT NULL
            DEFAULT CURRENT_TIMESTAMP
        `);

        /*
        ========================================
        USER OWNERSHIP COLUMNS
        ========================================
        */

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS
            user_id INTEGER
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS
            user_id INTEGER
        `);

        /*
        ========================================
        INDEXES
        ========================================
        */

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_tasks_user_id
            ON tasks(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_projects_user_id
            ON projects(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_tasks_project_id
            ON tasks(project_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_tasks_due_date
            ON tasks(due_date)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_tasks_completed
            ON tasks(completed)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_tasks_priority
            ON tasks(priority)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_sessions_user_id
            ON sessions(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS
            idx_sessions_expires_at
            ON sessions(expires_at)
        `);

        /*
        ========================================
        FOREIGN KEYS
        ========================================
        */

        const taskUserConstraint =
            await client.query(`
                SELECT 1
                FROM pg_constraint
                WHERE conname =
                    'tasks_user_id_fkey'
            `);

        if (
            taskUserConstraint.rows.length === 0
        ) {
            await client.query(`
                ALTER TABLE tasks
                ADD CONSTRAINT
                tasks_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            `);
        }

        const projectUserConstraint =
            await client.query(`
                SELECT 1
                FROM pg_constraint
                WHERE conname =
                    'projects_user_id_fkey'
            `);

        if (
            projectUserConstraint.rows.length === 0
        ) {
            await client.query(`
                ALTER TABLE projects
                ADD CONSTRAINT
                projects_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            `);
        }

        await client.query(
            "COMMIT"
        );

        console.log(
            "FlowOS database initialized successfully."
        );

        console.log(
            "Projects table: ready"
        );

        console.log(
            "Tasks table: ready"
        );

        console.log(
            "Users table: ready"
        );

        console.log(
            "Sessions table: ready"
        );

        console.log(
            "User ownership columns: ready"
        );

        console.log(
            "Indexes: ready"
        );

    } catch (error) {
        await client.query(
            "ROLLBACK"
        );

        console.error(
            "Database initialization failed:",
            error
        );

        throw error;
    } finally {
        client.release();

        await pool.end();
    }
}

initializeDatabase()
    .then(() => {
        process.exit(0);
    })
    .catch(() => {
        process.exit(1);
    });