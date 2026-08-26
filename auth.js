const crypto = require("crypto");

const SESSION_COOKIE = "flowos_session";
const SESSION_DAYS = 30;

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    try {
        const parts = storedHash.split(":");

        if (parts.length !== 2) {
            return false;
        }

        const salt = parts[0];
        const originalHash = parts[1];

        const derivedHash = crypto
            .scryptSync(password, salt, 64)
            .toString("hex");

        const originalBuffer =
            Buffer.from(originalHash, "hex");

        const derivedBuffer =
            Buffer.from(derivedHash, "hex");

        if (
            originalBuffer.length !==
            derivedBuffer.length
        ) {
            return false;
        }

        return crypto.timingSafeEqual(
            originalBuffer,
            derivedBuffer
        );
    } catch (error) {
        return false;
    }
}

function createSessionToken() {
    return crypto
        .randomBytes(32)
        .toString("hex");
}

function getSessionExpiry() {
    const date = new Date();

    date.setDate(
        date.getDate() + SESSION_DAYS
    );

    return date;
}

function parseCookies(cookieHeader) {
    const cookies = {};

    if (!cookieHeader) {
        return cookies;
    }

    cookieHeader
        .split(";")
        .forEach(cookie => {
            const separator =
                cookie.indexOf("=");

            if (separator === -1) {
                return;
            }

            const key =
                cookie
                    .slice(0, separator)
                    .trim();

            const value =
                cookie
                    .slice(separator + 1)
                    .trim();

            try {
                cookies[key] =
                    decodeURIComponent(value);
            } catch {
                cookies[key] = value;
            }
        });

    return cookies;
}

function setSessionCookie(
    res,
    token,
    expiresAt
) {
    const production =
        process.env.NODE_ENV ===
        "production";

    const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
        "Path=/",
        `Expires=${expiresAt.toUTCString()}`,
        "HttpOnly",
        "SameSite=Lax"
    ];

    if (production) {
        parts.push("Secure");
    }

    res.setHeader(
        "Set-Cookie",
        parts.join("; ")
    );
}

function clearSessionCookie(res) {
    res.setHeader(
        "Set-Cookie",
        [
            `${SESSION_COOKIE}=`,
            "Path=/",
            "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "HttpOnly",
            "SameSite=Lax"
        ].join("; ")
    );
}

async function getAuthenticatedUser(
    req,
    pool
) {
    const cookies =
        parseCookies(
            req.headers.cookie
        );

    const token =
        cookies[SESSION_COOKIE];

    if (!token) {
        return null;
    }

    const result =
        await pool.query(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                s.expires_at
            FROM sessions s
            INNER JOIN users u
                ON u.id = s.user_id
            WHERE s.id = $1
              AND s.expires_at > NOW()
            `,
            [token]
        );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

async function requireAuth(
    req,
    res,
    pool
) {
    try {
        const user =
            await getAuthenticatedUser(
                req,
                pool
            );

        if (!user) {
            res.status(401).json({
                message:
                    "Authentication required."
            });

            return null;
        }

        req.user = user;

        return user;
    } catch (error) {
        console.error(
            "Authentication error:",
            error
        );

        res.status(500).json({
            message:
                "Authentication failed."
        });

        return null;
    }
}

module.exports = {
    hashPassword,
    verifyPassword,
    createSessionToken,
    getSessionExpiry,
    setSessionCookie,
    clearSessionCookie,
    getAuthenticatedUser,
    requireAuth
};