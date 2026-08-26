document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {
            const response =
                await fetch(
                    "/api/auth/me",
                    {
                        credentials:
                            "include"
                    }
                );

            if (response.ok) {
                window.location.href =
                    "/";
                return;
            }
        } catch {
            // Stay on login page.
        }

        const form =
            document.getElementById(
                "loginForm"
            );

        const errorElement =
            document.getElementById(
                "loginError"
            );

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                errorElement.hidden =
                    true;

                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim();

                const password =
                    document
                        .getElementById(
                            "password"
                        )
                        .value;

                try {
                    const response =
                        await fetch(
                            "/api/auth/login",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials:
                                    "include",

                                body:
                                    JSON.stringify({
                                        email,
                                        password
                                    })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Unable to log in."
                        );
                    }

                    window.location.href =
                        "/";

                } catch (error) {
                    errorElement.textContent =
                        error.message;

                    errorElement.hidden =
                        false;
                }
            }
        );
    }
);