require("dotenv").config();

const { Pool } = require("pg");

const isProduction =
    process.env.NODE_ENV ===
    "production";

const pool =
    process.env.DATABASE_URL
        ? new Pool({
            connectionString:
                process.env.DATABASE_URL,

            ssl: isProduction
                ? {
                    rejectUnauthorized:
                        false
                }
                : false
        })
        : new Pool({
            user:
                process.env.DB_USER,

            host:
                process.env.DB_HOST,

            database:
                process.env.DB_NAME,

            password:
                process.env.DB_PASSWORD,

            port:
                Number(
                    process.env.DB_PORT
                ) || 5432
        });

pool.on(
    "error",
    error => {
        console.error(
            "Unexpected PostgreSQL error:",
            error
        );
    }
);

module.exports = pool;