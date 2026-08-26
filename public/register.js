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
            // Stay on register page.
        }

        const form =
            document.getElementById(
                "registerForm"
            );

        const errorElement =
            document.getElementById(
                "registerError"
            );

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                errorElement.hidden =
                    true;

                const name =
                    document
                        .getElementById(
                            "name"
                        )
                        .value
                        .trim();

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
                            "/api/auth/register",
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
                                        name,
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
                            "Unable to create account."
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