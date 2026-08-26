/* ========================================
   FLOWOS SETTINGS
======================================== */


/* ========================================
   DEFAULT SETTINGS
======================================== */

const DEFAULT_SETTINGS = {

    theme: "light",

    priority: "medium",

    weekStart: "sunday",

    notifications: false

};


/* ========================================
   LOAD SETTINGS
======================================== */

function loadSettings() {

    const savedSettings =
        localStorage.getItem(
            "flowosSettings"
        );


    if (!savedSettings) {

        return {
            ...DEFAULT_SETTINGS
        };

    }


    try {

        const parsedSettings =
            JSON.parse(savedSettings);


        return {

            ...DEFAULT_SETTINGS,

            ...parsedSettings

        };

    } catch (error) {

        console.error(
            "Failed to load settings:",
            error
        );


        return {
            ...DEFAULT_SETTINGS
        };

    }

}


/* ========================================
   SAVE SETTINGS
======================================== */

function saveSettings(settings) {

    localStorage.setItem(
        "flowosSettings",
        JSON.stringify(settings)
    );


    showSavedMessage();

}


/* ========================================
   APPLY THEME
======================================== */

function applyTheme(theme) {

    /*
     * Use the GLOBAL FlowOS theme system.
     *
     * This is the important fix.
     *
     * Previously Settings used:
     *
     *     flowos-dark
     *
     * while the rest of FlowOS used:
     *
     *     dark-theme
     *
     * Now everything uses FlowOSTheme.
     */

    if (
        window.FlowOSTheme &&
        typeof window.FlowOSTheme.setTheme === "function"
    ) {

        window.FlowOSTheme.setTheme(
            theme
        );

        return;

    }


    /*
     * Fallback in case theme.js hasn't loaded.
     */

    const root =
        document.documentElement;


    const body =
        document.body;


    if (theme === "dark") {

        root.classList.add(
            "dark-theme"
        );

        body.classList.add(
            "dark-theme"
        );

        body.classList.add(
            "flowos-dark"
        );

    } else {

        root.classList.remove(
            "dark-theme"
        );

        body.classList.remove(
            "dark-theme"
        );

        body.classList.remove(
            "flowos-dark"
        );

    }


    localStorage.setItem(
        "flowos-theme",
        theme === "dark"
            ? "dark"
            : "light"
    );

}


/* ========================================
   SAVED MESSAGE
======================================== */

let savedMessageTimeout = null;


function showSavedMessage() {

    const message =
        document.getElementById(
            "settings-saved"
        );


    if (!message) {
        return;
    }


    message.classList.add(
        "visible"
    );


    clearTimeout(
        savedMessageTimeout
    );


    savedMessageTimeout =
        setTimeout(() => {

            message.classList.remove(
                "visible"
            );

        }, 1800);

}


/* ========================================
   INITIALIZE SETTINGS
======================================== */

function initializeSettings() {

    const settings =
        loadSettings();


    const themeSetting =
        document.getElementById(
            "theme-setting"
        );


    const prioritySetting =
        document.getElementById(
            "priority-setting"
        );


    const weekStartSetting =
        document.getElementById(
            "week-start-setting"
        );


    const notificationsSetting =
        document.getElementById(
            "notifications-setting"
        );


    /*
     * Safety check.
     */

    if (
        !themeSetting ||
        !prioritySetting ||
        !weekStartSetting ||
        !notificationsSetting
    ) {

        console.error(
            "FlowOS Settings: required elements were not found."
        );

        return;

    }


    /* ====================================
       APPLY SAVED VALUES
    ==================================== */

    themeSetting.value =
        settings.theme;


    prioritySetting.value =
        settings.priority;


    weekStartSetting.value =
        settings.weekStart;


    notificationsSetting.checked =
        settings.notifications;


    /*
     * Apply theme immediately.
     */
    applyTheme(
        settings.theme
    );


    /* ====================================
       THEME
    ==================================== */

    themeSetting.addEventListener(
        "change",
        () => {

            const current =
                loadSettings();


            current.theme =
                themeSetting.value;


            saveSettings(
                current
            );


            applyTheme(
                current.theme
            );

        }
    );


    /* ====================================
       DEFAULT PRIORITY
    ==================================== */

    prioritySetting.addEventListener(
        "change",
        () => {

            const current =
                loadSettings();


            current.priority =
                prioritySetting.value;


            saveSettings(
                current
            );

        }
    );


    /* ====================================
       WEEK START
    ==================================== */

    weekStartSetting.addEventListener(
        "change",
        () => {

            const current =
                loadSettings();


            current.weekStart =
                weekStartSetting.value;


            saveSettings(
                current
            );

        }
    );


    /* ====================================
       NOTIFICATIONS
    ==================================== */

    notificationsSetting.addEventListener(
        "change",
        () => {

            const current =
                loadSettings();


            current.notifications =
                notificationsSetting.checked;


            saveSettings(
                current
            );

        }
    );


    /* ====================================
       RESET SETTINGS
    ==================================== */

    const resetButton =
        document.getElementById(
            "reset-settings-button"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Reset all FlowOS preferences?"
                    );


                if (!confirmed) {

                    return;

                }


                /*
                 * Remove both theme/settings
                 * storage values.
                 */

                localStorage.removeItem(
                    "flowosSettings"
                );


                localStorage.removeItem(
                    "flowos-theme"
                );


                /*
                 * Restore defaults.
                 */

                const defaults =
                    {
                        ...DEFAULT_SETTINGS
                    };


                themeSetting.value =
                    defaults.theme;


                prioritySetting.value =
                    defaults.priority;


                weekStartSetting.value =
                    defaults.weekStart;


                notificationsSetting.checked =
                    defaults.notifications;


                applyTheme(
                    defaults.theme
                );


                /*
                 * Save the default settings
                 * again so all pages stay
                 * synchronized.
                 */

                saveSettings(
                    defaults
                );


                showSavedMessage();

            }
        );

    }

}


/* ========================================
   START SETTINGS
======================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSettings
    );

} else {

    initializeSettings();

}