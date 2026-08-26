require("dotenv").config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: isProduction
                ? { rejectUnauthorized: false }
                : false
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT) || 5432
        }
);

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
         * ========================================
         * PROJECTS TABLE
         * ========================================
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
         * ========================================
         * TASKS TABLE
         * ========================================
         */

        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,

                title VARCHAR(200) NOT NULL,

                priority VARCHAR(20)
                    NOT NULL
                    DEFAULT 'medium',

                estimated_minutes INTEGER
                    NOT NULL,

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
         * ========================================
         * SAFETY MIGRATIONS
         * ========================================
         */

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS due_date DATE
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS project_id INTEGER
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS completed BOOLEAN
                NOT NULL DEFAULT FALSE
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER
        `);

        await client.query(`
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS priority VARCHAR(20)
                NOT NULL DEFAULT 'medium'
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS description TEXT
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS status VARCHAR(20)
                NOT NULL DEFAULT 'planning'
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS color VARCHAR(20)
                NOT NULL DEFAULT 'blue'
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS deadline DATE
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
                NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        await client.query(`
            ALTER TABLE projects
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
                NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        /*
         * ========================================
         * INDEXES
         * ========================================
         */

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tasks_project_id
            ON tasks(project_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tasks_due_date
            ON tasks(due_date)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tasks_completed
            ON tasks(completed)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_tasks_priority
            ON tasks(priority)
        `);

        await client.query("COMMIT");

        console.log("FlowOS database initialized successfully.");
        console.log("Projects table: ready");
        console.log("Tasks table: ready");
        console.log("Indexes: ready");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "FlowOS database initialization failed:",
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