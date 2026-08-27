/* ========================================
   FLOWOS NAVIGATION
======================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ========================================
           ADD FIX MY DAY TO EXISTING NAVIGATION
        ======================================== */

        const navigation =
            document.querySelector(
                ".navigation"
            );


        if (navigation) {

            const existingFixMyDay =
                navigation.querySelector(
                    'a[href="/fix-my-day.html"]'
                );


            if (!existingFixMyDay) {

                const analyticsLink =
                    navigation.querySelector(
                        'a[href="/analytics"]'
                    );


                const fixMyDayLink =
                    document.createElement(
                        "a"
                    );


                fixMyDayLink.href =
                    "/fix-my-day.html";


                fixMyDayLink.className =
                    "nav-item";


                fixMyDayLink.textContent =
                    "Fix My Day";


                /*
                 * Put Fix My Day immediately
                 * before Analytics.
                 */

                if (analyticsLink) {

                    navigation.insertBefore(
                        fixMyDayLink,
                        analyticsLink
                    );

                } else {

                    navigation.appendChild(
                        fixMyDayLink
                    );

                }

            }

        }


        /* ========================================
           ACTIVE NAVIGATION
        ======================================== */

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


                /*
                 * Fix My Day is a static HTML page.
                 */

                if (
                    href ===
                    "/fix-my-day.html"
                ) {

                    if (
                        currentPath ===
                        "/fix-my-day.html"
                    ) {

                        item.classList.add(
                            "active"
                        );

                    }

                    return;

                }


                if (
                    href ===
                    currentPath
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );


        /* ========================================
           DASHBOARD ACTIVE STATE
        ======================================== */

        if (
            currentPath ===
            "/"
        ) {

            navItems.forEach(
                item => {

                    if (
                        item.getAttribute(
                            "href"
                        ) ===
                        "/"
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