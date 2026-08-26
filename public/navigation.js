/* ========================================
   FLOWOS NAVIGATION
======================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentPath =
            window.location.pathname;


        const navItems =
            document.querySelectorAll(
                ".nav-item"
            );


        navItems.forEach(
            item => {

                const href =
                    item.getAttribute(
                        "href"
                    );


                if (!href) {
                    return;
                }


                item.classList.remove(
                    "active"
                );


                if (
                    href === currentPath
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );


        /*
         * Dashboard uses "/"
         */

        if (
            currentPath === "/"
        ) {

            navItems.forEach(
                item => {

                    if (
                        item.getAttribute(
                            "href"
                        ) === "/"
                    ) {

                        item.classList.add(
                            "active"
                        );

                    }

                }
            );

        }

    }
);