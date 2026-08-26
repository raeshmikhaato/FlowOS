async function getCurrentUser() {
    try {
        const response =
            await fetch(
                "/api/auth/me",
                {
                    credentials:
                        "include"
                }
            );

        if (!response.ok) {
            return null;
        }

        const data =
            await response.json();

        return data.user || null;

    } catch {
        return null;
    }
}


async function logoutFlowOS() {
    try {
        await fetch(
            "/api/auth/logout",
            {
                method:
                    "POST",

                credentials:
                    "include"
            }
        );
    } finally {
        window.location.href =
            "/login";
    }
}


async function protectFlowOSPage() {
    const user =
        await getCurrentUser();

    if (!user) {
        window.location.href =
            "/login";

        return null;
    }

    return user;
}