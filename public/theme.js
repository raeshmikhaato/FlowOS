/* =========================================================
   FLOWOS GLOBAL THEME SYSTEM
   FINAL THEME + UI CONSISTENCY VERSION
   ========================================================= */

(function () {

    "use strict";


    /* =========================================================
       STORAGE
    ========================================================= */

    const THEME_KEY = "flowos-theme";
    const SETTINGS_KEY = "flowosSettings";


    /* =========================================================
       GET SAVED THEME
    ========================================================= */

    function getSavedTheme() {

        const savedTheme =
            localStorage.getItem(THEME_KEY);

        if (
            savedTheme === "dark" ||
            savedTheme === "light"
        ) {
            return savedTheme;
        }


        try {

            const settings =
                JSON.parse(
                    localStorage.getItem(
                        SETTINGS_KEY
                    )
                );


            if (
                settings &&
                (
                    settings.theme === "dark" ||
                    settings.theme === "light"
                )
            ) {

                return settings.theme;

            }

        } catch (error) {

            console.warn(
                "FlowOS: Could not read saved settings.",
                error
            );

        }


        return "light";

    }


    /* =========================================================
       FINAL GLOBAL UI STYLES
       ========================================================= */

    function injectFinalStyles() {

        if (
            document.getElementById(
                "flowos-final-theme-styles"
            )
        ) {

            return;

        }


        const style =
            document.createElement("style");


        style.id =
            "flowos-final-theme-styles";


        style.textContent = `

/* =========================================================
   FLOWOS FINAL VISUAL SYSTEM
   ========================================================= */


/* =========================================================
   1. GLOBAL LIGHT THEME
   ========================================================= */

html:not(.dark-theme),
body:not(.dark-theme) {

    background: #f7f8fa !important;

    color: #172033 !important;

}


/* =========================================================
   2. GLOBAL DARK THEME
   ========================================================= */

html.dark-theme,
body.dark-theme {

    background: #0f1117 !important;

    color: #eef2f7 !important;

}


body.dark-theme {

    color-scheme: dark;

}


/* =========================================================
   3. APP BACKGROUND
   ========================================================= */

html:not(.dark-theme) .app,
body:not(.dark-theme) .app,
html:not(.dark-theme) .main-content,
body:not(.dark-theme) .main-content,
html:not(.dark-theme) main,
body:not(.dark-theme) main {

    background: #f7f8fa !important;

}


html.dark-theme .app,
body.dark-theme .app,
html.dark-theme .main-content,
body.dark-theme .main-content,
html.dark-theme main,
body.dark-theme main {

    background: #0f1117 !important;

    color: #eef2f7 !important;

}


/* =========================================================
   4. DASHBOARD STAT CARDS — LIGHT
   ========================================================= */

html:not(.dark-theme) .dashboard-stat-card,
body:not(.dark-theme) .dashboard-stat-card {

    position: relative !important;

    background: #ffffff !important;

    border: 1px solid #dfe4eb !important;

    border-radius: 15px !important;

    box-shadow:
        0 2px 8px rgba(16, 24, 40, 0.035) !important;

    overflow: hidden !important;

}


/* Colored lines */

html:not(.dark-theme)
.dashboard-stat-card::before,

body:not(.dark-theme)
.dashboard-stat-card::before {

    height: 4px !important;

    top: 0 !important;

    left: 0 !important;

    right: 0 !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(1)::before,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(1)::before {

    background: #6366f1 !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(2)::before,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(2)::before {

    background: #f59e0b !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(3)::before,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(3)::before {

    background: #22c55e !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(4)::before,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(4)::before {

    background: #3b82f6 !important;

}


/* Text */

html:not(.dark-theme)
.dashboard-stat-card .stat-label,

body:not(.dark-theme)
.dashboard-stat-card .stat-label {

    color: #596b86 !important;

}


html:not(.dark-theme)
.dashboard-stat-card strong,

body:not(.dark-theme)
.dashboard-stat-card strong {

    color: #172033 !important;

}


/* Individual number colors */

html:not(.dark-theme)
.dashboard-stat-card:nth-child(1) strong,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(1) strong {

    color: #4f46e5 !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(2) strong,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(2) strong {

    color: #d97706 !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(3) strong,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(3) strong {

    color: #16a34a !important;

}


html:not(.dark-theme)
.dashboard-stat-card:nth-child(4) strong,

body:not(.dark-theme)
.dashboard-stat-card:nth-child(4) strong {

    color: #2563eb !important;

}


/* =========================================================
   5. DASHBOARD STAT CARDS — DARK
   ========================================================= */

html.dark-theme .dashboard-stat-card,
body.dark-theme .dashboard-stat-card {

    background: #171b24 !important;

    border: 1px solid #2a3240 !important;

    color: #eef2f7 !important;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.16) !important;

}


/* Colored lines */

html.dark-theme
.dashboard-stat-card::before,

body.dark-theme
.dashboard-stat-card::before {

    height: 4px !important;

}


html.dark-theme
.dashboard-stat-card:nth-child(1)::before,

body.dark-theme
.dashboard-stat-card:nth-child(1)::before {

    background: #6d70ff !important;

}


html.dark-theme
.dashboard-stat-card:nth-child(2)::before,

body.dark-theme
.dashboard-stat-card:nth-child(2)::before {

    background: #f5b942 !important;

}


html.dark-theme
.dashboard-stat-card:nth-child(3)::before,

body.dark-theme
.dashboard-stat-card:nth-child(3)::before {

    background: #35d08f !important;

}


html.dark-theme
.dashboard-stat-card:nth-child(4)::before,

body.dark-theme
.dashboard-stat-card:nth-child(4)::before {

    background: #5b8cff !important;

}


html.dark-theme
.dashboard-stat-card .stat-label,

body.dark-theme
.dashboard-stat-card .stat-label {

    color: #aeb8c9 !important;

}


html.dark-theme
.dashboard-stat-card strong,

body.dark-theme
.dashboard-stat-card strong {

    color: #f1f5f9 !important;

}


/* =========================================================
   6. DASHBOARD PROJECT SUMMARY — LIGHT
   ========================================================= */

html:not(.dark-theme)
.dashboard-project-stat-card,

body:not(.dark-theme)
.dashboard-project-stat-card {

    position: relative !important;

    background: #ffffff !important;

    border: 1px solid #dfe4eb !important;

    border-radius: 15px !important;

    box-shadow:
        0 2px 8px rgba(16, 24, 40, 0.035) !important;

    overflow: hidden !important;

}


html:not(.dark-theme)
.dashboard-project-stat-card::before,

body:not(.dark-theme)
.dashboard-project-stat-card::before {

    height: 4px !important;

}


html:not(.dark-theme)
.dashboard-project-stat-card:nth-child(1)::before,

body:not(.dark-theme)
.dashboard-project-stat-card:nth-child(1)::before {

    background: #6366f1 !important;

}


html:not(.dark-theme)
.dashboard-project-stat-card:nth-child(2)::before,

body:not(.dark-theme)
.dashboard-project-stat-card:nth-child(2)::before {

    background: #f59e0b !important;

}


html:not(.dark-theme)
.dashboard-project-stat-card:nth-child(3)::before,

body:not(.dark-theme)
.dashboard-project-stat-card:nth-child(3)::before {

    background: #22c55e !important;

}


/* =========================================================
   7. DASHBOARD PROJECT SUMMARY — DARK
   ========================================================= */

html.dark-theme
.dashboard-project-stat-card,

body.dark-theme
.dashboard-project-stat-card {

    background: #171b24 !important;

    border: 1px solid #2a3240 !important;

    color: #eef2f7 !important;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.16) !important;

}


html.dark-theme
.dashboard-project-stat-card::before,

body.dark-theme
.dashboard-project-stat-card::before {

    height: 5px !important;

}


html.dark-theme
.dashboard-project-stat-card:nth-child(1)::before,

body.dark-theme
.dashboard-project-stat-card:nth-child(1)::before {

    background: #6d70ff !important;

}


html.dark-theme
.dashboard-project-stat-card:nth-child(2)::before,

body.dark-theme
.dashboard-project-stat-card:nth-child(2)::before {

    background: #f5b942 !important;

}


html.dark-theme
.dashboard-project-stat-card:nth-child(3)::before,

body.dark-theme
.dashboard-project-stat-card:nth-child(3)::before {

    background: #35d08f !important;

}


/* =========================================================
   8. DASHBOARD PROJECT CARDS — LIGHT
   ========================================================= */

html:not(.dark-theme)
.dashboard-project-card,

body:not(.dark-theme)
.dashboard-project-card {

    background: #ffffff !important;

    border: 1px solid #dfe4eb !important;

    border-top: 5px solid #6366f1 !important;

    color: #172033 !important;

    box-shadow:
        0 3px 12px rgba(16, 24, 40, 0.035) !important;

}


/* =========================================================
   9. DASHBOARD PROJECT CARDS — DARK
   ========================================================= */

html.dark-theme
.dashboard-project-card,

body.dark-theme
.dashboard-project-card {

    background: #171b24 !important;

    border: 1px solid #2a3240 !important;

    border-top: 5px solid #6d70ff !important;

    color: #eef2f7 !important;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.16) !important;

}


/* =========================================================
   10. PROJECT PROGRESS BARS
   ========================================================= */

.dashboard-project-progress-track {

    width: 100% !important;

    height: 8px !important;

    background: #e7ebf0 !important;

    border-radius: 999px !important;

    overflow: hidden !important;

}


.dashboard-project-progress-bar {

    display: block !important;

    min-width: 0 !important;

    height: 100% !important;

    border-radius: 999px !important;

    transition:
        width 0.5s ease !important;

    background: #6366f1 !important;

}


/* Project colors */

.dashboard-project-card:has(
    .project-color.blue
)
.dashboard-project-progress-bar {

    background: #6366f1 !important;

}


.dashboard-project-card:has(
    .project-color.purple
)
.dashboard-project-progress-bar {

    background: #8b5cf6 !important;

}


.dashboard-project-card:has(
    .project-color.green
)
.dashboard-project-progress-bar {

    background: #22c55e !important;

}


.dashboard-project-card:has(
    .project-color.orange
)
.dashboard-project-progress-bar {

    background: #f59e0b !important;

}


.dashboard-project-card:has(
    .project-color.red
)
.dashboard-project-progress-bar {

    background: #ef4444 !important;

}


/* Dark track */

html.dark-theme
.dashboard-project-progress-track,

body.dark-theme
.dashboard-project-progress-track {

    background: #2b3240 !important;

}


/* =========================================================
   11. TODAY'S PROGRESS SPACING
   ========================================================= */

.dashboard-progress-card,
.dashboard-progress-section {

    margin-top: 28px !important;

    margin-bottom: 32px !important;

}


.dashboard-progress-card .section-heading,
.dashboard-progress-section .section-heading {

    margin-top: 0 !important;

    padding-top: 0 !important;

}


html:not(.dark-theme)
.dashboard-progress-card,

body:not(.dark-theme)
.dashboard-progress-card {

    color: #172033 !important;

}


html.dark-theme
.dashboard-progress-card,

body.dark-theme
.dashboard-progress-card {

    color: #eef2f7 !important;

}


/* =========================================================
   12. DASHBOARD MAIN PROGRESS BAR
   ========================================================= */

.dashboard-progress-track {

    height: 10px !important;

    background: #e5e9ef !important;

    border-radius: 999px !important;

    overflow: hidden !important;

}


.dashboard-progress-bar {

    height: 100% !important;

    background: #22c55e !important;

    border-radius: 999px !important;

}


html.dark-theme
.dashboard-progress-track,

body.dark-theme
.dashboard-progress-track {

    background: #2b3240 !important;

}


html.dark-theme
.dashboard-progress-bar,

body.dark-theme
.dashboard-progress-bar {

    background: #35d08f !important;

}


/* =========================================================
   13. DASHBOARD ACTIVE TASKS — LIGHT
   ========================================================= */

html:not(.dark-theme)
.dashboard-task,

body:not(.dark-theme)
.dashboard-task {

    background: #ffffff !important;

    border: 1px solid #dfe4eb !important;

    color: #172033 !important;

}


html:not(.dark-theme)
.dashboard-task-title,

body:not(.dark-theme)
.dashboard-task-title {

    color: #172033 !important;

}


html:not(.dark-theme)
.dashboard-task-meta,

body:not(.dark-theme)
.dashboard-task-meta {

    color: #718096 !important;

}


/* Priority accents */

html:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.high
),

body:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.high
) {

    border-left: 4px solid #ef4444 !important;

}


html:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.medium
),

body:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.medium
) {

    border-left: 4px solid #f59e0b !important;

}


html:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.low
),

body:not(.dark-theme)
.dashboard-task:has(
    .dashboard-task-priority.low
) {

    border-left: 4px solid #22c55e !important;

}


/* =========================================================
   14. DASHBOARD ACTIVE TASKS — DARK
   ========================================================= */

html.dark-theme
.dashboard-task,

body.dark-theme
.dashboard-task {

    background: #171b24 !important;

    border: 1px solid #2a3240 !important;

    color: #eef2f7 !important;

}


html.dark-theme
.dashboard-task-title,

body.dark-theme
.dashboard-task-title {

    color: #f1f5f9 !important;

}


html.dark-theme
.dashboard-task-meta,

body.dark-theme
.dashboard-task-meta {

    color: #8f9aae !important;

}


html.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.high
),

body.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.high
) {

    border-left: 4px solid #ef4444 !important;

}


html.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.medium
),

body.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.medium
) {

    border-left: 4px solid #f59e0b !important;

}


html.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.low
),

body.dark-theme
.dashboard-task:has(
    .dashboard-task-priority.low
) {

    border-left: 4px solid #35d08f !important;

}


/* =========================================================
   15. ANALYTICS — LIGHT
   ========================================================= */

html:not(.dark-theme) .analytics-card,
body:not(.dark-theme) .analytics-card,
html:not(.dark-theme) .secondary-card,
body:not(.dark-theme) .secondary-card,
html:not(.dark-theme) .stat-card,
body:not(.dark-theme) .stat-card {

    background: #ffffff !important;

    border: 1px solid #dfe4eb !important;

    color: #172033 !important;

    box-shadow:
        0 2px 8px rgba(16, 24, 40, 0.035) !important;

}


/* Analytics main stats */

html:not(.dark-theme) .stat-card .stat-label,
body:not(.dark-theme) .stat-card .stat-label {

    color: #596b86 !important;

}


html:not(.dark-theme) .stat-card .stat-value,
body:not(.dark-theme) .stat-card .stat-value,

html:not(.dark-theme) .stat-card strong,
body:not(.dark-theme) .stat-card strong {

    color: #172033 !important;

}


html:not(.dark-theme) .stat-card .stat-description,
body:not(.dark-theme) .stat-card .stat-description {

    color: #8190aa !important;

}


/* Analytics secondary cards */

html:not(.dark-theme) .secondary-label,
body:not(.dark-theme) .secondary-label {

    color: #596b86 !important;

}


html:not(.dark-theme) .secondary-value,
body:not(.dark-theme) .secondary-value {

    color: #172033 !important;

}


/* Analytics chart headings */

html:not(.dark-theme) .card-header h2,
body:not(.dark-theme) .card-header h2,

html:not(.dark-theme) .analytics-card h2,
body:not(.dark-theme) .analytics-card h2 {

    color: #172033 !important;

}


html:not(.dark-theme) .section-label,
body:not(.dark-theme) .section-label {

    color: #6f829f !important;

}


/* Analytics chart labels */

html:not(.dark-theme) .bar-label,
body:not(.dark-theme) .bar-label,

html:not(.dark-theme) .project-name,
body:not(.dark-theme) .project-name {

    color: #596579 !important;

}


html:not(.dark-theme) .bar-value,
body:not(.dark-theme) .bar-value,

html:not(.dark-theme) .project-progress-value,
body:not(.dark-theme) .project-progress-value {

    color: #172033 !important;

}


html:not(.dark-theme) .bar-track,
body:not(.dark-theme) .bar-track,

html:not(.dark-theme) .project-progress-track,
body:not(.dark-theme) .project-progress-track {

    background: #e7ebf0 !important;

}


/* Insights */

html:not(.dark-theme) .insight,
body:not(.dark-theme) .insight {

    background: #f8fafc !important;

    border-color: #e1e6ed !important;

}


html:not(.dark-theme) .insight-title,
body:not(.dark-theme) .insight-title {

    color: #172033 !important;

}


html:not(.dark-theme) .insight-text,
body:not(.dark-theme) .insight-text {

    color: #667085 !important;

}


/* Analytics note */

html:not(.dark-theme) .analytics-note,
body:not(.dark-theme) .analytics-note {

    background: #f1f4f8 !important;

    border-color: #dce2e9 !important;

}


html:not(.dark-theme) .analytics-note strong,
body:not(.dark-theme) .analytics-note strong {

    color: #344054 !important;

}


html:not(.dark-theme) .analytics-note p,
body:not(.dark-theme) .analytics-note p {

    color: #667085 !important;

}


/* =========================================================
   16. ANALYTICS — DARK
   ========================================================= */

html.dark-theme .stat-card,
body.dark-theme .stat-card,

html.dark-theme .secondary-card,
body.dark-theme .secondary-card,

html.dark-theme .analytics-card,
body.dark-theme .analytics-card {

    background: #171b24 !important;

    border: 1px solid #2a3240 !important;

    color: #eef2f7 !important;

    box-shadow:
        0 5px 18px rgba(0, 0, 0, 0.16) !important;

}


/* Main analytics values */

html.dark-theme .stat-label,
body.dark-theme .stat-label,

html.dark-theme .secondary-label,
body.dark-theme .secondary-label {

    color: #aeb8c9 !important;

}


html.dark-theme .stat-value,
body.dark-theme .stat-value,

html.dark-theme .secondary-value,
body.dark-theme .secondary-value,

html.dark-theme .stat-card strong,
body.dark-theme .stat-card strong {

    color: #f1f5f9 !important;

}


html.dark-theme .stat-description,
body.dark-theme .stat-description {

    color: #7f8aa0 !important;

}


/* Analytics headings */

html.dark-theme .analytics-card h2,
body.dark-theme .analytics-card h2,

html.dark-theme .analytics-card h3,
body.dark-theme .analytics-card h3,

html.dark-theme .card-header h2,
body.dark-theme .card-header h2 {

    color: #f1f5f9 !important;

}


html.dark-theme .section-label,
body.dark-theme .section-label {

    color: #8fa4c4 !important;

}


/* Chart labels */

html.dark-theme .bar-label,
body.dark-theme .bar-label,

html.dark-theme .project-name,
body.dark-theme .project-name {

    color: #aeb8c9 !important;

}


html.dark-theme .bar-value,
body.dark-theme .bar-value,

html.dark-theme .project-progress-value,
body.dark-theme .project-progress-value {

    color: #eef2f7 !important;

}


/* Chart tracks */

html.dark-theme .bar-track,
body.dark-theme .bar-track,

html.dark-theme .project-progress-track,
body.dark-theme .project-progress-track {

    background: #2b3240 !important;

}


/* Chart bars */

html.dark-theme .bar-fill,
body.dark-theme .bar-fill {

    background: #6d70ff !important;

}


html.dark-theme .project-progress-fill,
body.dark-theme .project-progress-fill {

    background: #35d08f !important;

}


/* Empty/loading text */

html.dark-theme .chart-empty,
body.dark-theme .chart-empty,

html.dark-theme .chart-loading,
body.dark-theme .chart-loading {

    color: #7f8aa0 !important;

}


/* =========================================================
   17. ANALYTICS SECONDARY ICONS — DARK
   ========================================================= */

html.dark-theme .completed-icon,
body.dark-theme .completed-icon {

    background: #17382b !important;

    color: #6ee7b7 !important;

}


html.dark-theme .remaining-icon,
body.dark-theme .remaining-icon {

    background: #1d2d4b !important;

    color: #7da7ff !important;

}


html.dark-theme .priority-icon,
body.dark-theme .priority-icon {

    background: #3a2c19 !important;

    color: #f5b942 !important;

}


/* =========================================================
   18. ANALYTICS INSIGHTS — DARK
   ========================================================= */

html.dark-theme .insight,
body.dark-theme .insight {

    background: #1b2029 !important;

    border-color: #303747 !important;

}


html.dark-theme .insight-title,
body.dark-theme .insight-title {

    color: #f1f5f9 !important;

}


html.dark-theme .insight-text,
body.dark-theme .insight-text {

    color: #9eabbf !important;

}


/* =========================================================
   19. ANALYTICS NOTE — DARK
   ========================================================= */

html.dark-theme .analytics-note,
body.dark-theme .analytics-note {

    background: #151921 !important;

    border-color: #2a3240 !important;

    color: #c5cedb !important;

}


html.dark-theme .analytics-note strong,
body.dark-theme .analytics-note strong {

    color: #eef2f7 !important;

}


html.dark-theme .analytics-note p,
body.dark-theme .analytics-note p {

    color: #9eabbf !important;

}


html.dark-theme .note-icon,
body.dark-theme .note-icon {

    background: #273044 !important;

    color: #b7c5df !important;

}


/* =========================================================
   20. ANALYTICS PAGE BACKGROUND
   ========================================================= */

html:not(.dark-theme)
body:has(.stats-grid) {

    background: #f7f8fa !important;

}


html.dark-theme
body:has(.stats-grid) {

    background: #0f1117 !important;

}


/* =========================================================
   21. SIDEBAR — LIGHT
   ========================================================= */

html:not(.dark-theme) .sidebar,
body:not(.dark-theme) .sidebar {

    background: #ffffff !important;

    border-right-color: #e1e5eb !important;

}


/* =========================================================
   22. SIDEBAR — DARK
   ========================================================= */

html.dark-theme .sidebar,
body.dark-theme .sidebar {

    background: #151922 !important;

    border-right-color: #292f3b !important;

}


html.dark-theme .logo,
body.dark-theme .logo {

    color: #f1f5f9 !important;

}


html.dark-theme .nav-item,
body.dark-theme .nav-item {

    color: #aeb8c9 !important;

}


html.dark-theme .nav-item:hover,
body.dark-theme .nav-item:hover {

    background: #1d222d !important;

    color: #f1f5f9 !important;

}


html.dark-theme .nav-item.active,
body.dark-theme .nav-item.active {

    background: #293852 !important;

    color: #f1f5f9 !important;

}


/* =========================================================
   23. PAGE HEADINGS — DARK
   ========================================================= */

html.dark-theme .page-header h1,
body.dark-theme .page-header h1,

html.dark-theme .dashboard-header h1,
body.dark-theme .dashboard-header h1 {

    color: #f1f5f9 !important;

}


html.dark-theme .page-header p,
body.dark-theme .page-header p,

html.dark-theme .dashboard-subtitle,
body.dark-theme .dashboard-subtitle {

    color: #9eabbf !important;

}


/* =========================================================
   24. DASHBOARD SECTION HEADINGS — DARK
   ========================================================= */

html.dark-theme .section-heading h2,
body.dark-theme .section-heading h2,

html.dark-theme .dashboard-section-title,
body.dark-theme .dashboard-section-title {

    color: #f1f5f9 !important;

}


html.dark-theme .section-eyebrow,
body.dark-theme .section-eyebrow,

html.dark-theme .dashboard-eyebrow,
body.dark-theme .dashboard-eyebrow {

    color: #91a5c5 !important;

}


/* =========================================================
   25. BUTTONS — LIGHT
   ========================================================= */

html:not(.dark-theme) .primary-button,
body:not(.dark-theme) .primary-button {

    background: #172033 !important;

    color: #ffffff !important;

}


html:not(.dark-theme) .primary-button:hover,
body:not(.dark-theme) .primary-button:hover {

    background: #263247 !important;

}


/* =========================================================
   26. BUTTONS — DARK
   ========================================================= */

html.dark-theme .primary-button,
body.dark-theme .primary-button {

    background: #2b426d !important;

    color: #f8fafc !important;

    border: 1px solid #385582 !important;

}


html.dark-theme .primary-button:hover,
body.dark-theme .primary-button:hover {

    background: #34527f !important;

}


/* =========================================================
   27. INPUTS — DARK
   ========================================================= */

html.dark-theme input,
body.dark-theme input,

html.dark-theme select,
body.dark-theme select,

html.dark-theme textarea,
body.dark-theme textarea {

    background: #12161e !important;

    color: #eef2f7 !important;

    border-color: #303747 !important;

}


html.dark-theme input::placeholder,
body.dark-theme input::placeholder,

html.dark-theme textarea::placeholder,
body.dark-theme textarea::placeholder {

    color: #707c91 !important;

}


/* =========================================================
   28. RESPONSIVE DASHBOARD
   ========================================================= */

@media (max-width: 900px) {

    .dashboard-stats {

        grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

    }

}


@media (max-width: 600px) {

    .dashboard-stats {

        grid-template-columns: 1fr !important;

    }


    .dashboard-project-stats {

        grid-template-columns: 1fr !important;

    }

}


/* =========================================================
   29. RESPONSIVE ANALYTICS
   ========================================================= */

@media (max-width: 800px) {

    .stats-grid {

        grid-template-columns: 1fr !important;

    }


    .secondary-stats {

        grid-template-columns: 1fr !important;

    }


    .chart-grid {

        grid-template-columns: 1fr !important;

    }


    .insights-list {

        grid-template-columns: 1fr !important;

    }

}

`;


        document.head.appendChild(style);

    }


    /* =========================================================
       APPLY DASHBOARD STAT STRUCTURE
       ========================================================= */

    function prepareDashboardStats() {

        const cards =
            document.querySelectorAll(
                ".dashboard-stat-card"
            );


        if (!cards.length) {
            return;
        }


        /*
         * The existing HTML doesn't need to be changed.
         * We identify the four cards by position.
         */

        cards.forEach(
            function (card, index) {

                card.classList.remove(
                    "flowos-stat-total",
                    "flowos-stat-active",
                    "flowos-stat-completed",
                    "flowos-stat-progress"
                );


                if (index === 0) {

                    card.classList.add(
                        "flowos-stat-total"
                    );

                }


                if (index === 1) {

                    card.classList.add(
                        "flowos-stat-active"
                    );

                }


                if (index === 2) {

                    card.classList.add(
                        "flowos-stat-completed"
                    );

                }


                if (index === 3) {

                    card.classList.add(
                        "flowos-stat-progress"
                    );

                }

            }
        );

    }


    /* =========================================================
       REPAIR PROJECT PROGRESS BARS
       ========================================================= */

    function refreshProjectProgressBars() {

        const bars =
            document.querySelectorAll(
                ".dashboard-project-progress-bar"
            );


        bars.forEach(
            function (bar) {

                /*
                 * The dashboard already supplies:
                 *
                 * style="width: XX%"
                 *
                 * We simply make sure the browser
                 * doesn't collapse the visual fill.
                 */

                const width =
                    bar.style.width;


                if (width) {

                    bar.style.width =
                        width;

                }

            }
        );

    }


    /* =========================================================
       APPLY THEME
       ========================================================= */

    function applyTheme(theme) {

        const selectedTheme =
            theme === "dark"
                ? "dark"
                : "light";


        injectFinalStyles();


        const root =
            document.documentElement;


        const body =
            document.body;


        if (selectedTheme === "dark") {

            root.classList.add(
                "dark-theme"
            );


            if (body) {

                body.classList.add(
                    "dark-theme"
                );


                body.classList.add(
                    "flowos-dark"
                );

            }

        } else {

            root.classList.remove(
                "dark-theme"
            );


            if (body) {

                body.classList.remove(
                    "dark-theme"
                );


                body.classList.remove(
                    "flowos-dark"
                );

            }

        }


        /*
         * Apply layout/color fixes after the theme
         * class is changed.
         */

        prepareDashboardStats();

        refreshProjectProgressBars();

    }


    /* =========================================================
       SAVE THEME
       ========================================================= */

    function saveTheme(theme) {

        const selectedTheme =
            theme === "dark"
                ? "dark"
                : "light";


        localStorage.setItem(
            THEME_KEY,
            selectedTheme
        );


        /*
         * Keep Settings synchronized.
         */

        try {

            const existingSettings =
                JSON.parse(
                    localStorage.getItem(
                        SETTINGS_KEY
                    )
                ) || {};


            existingSettings.theme =
                selectedTheme;


            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(
                    existingSettings
                )
            );

        } catch (error) {

            console.warn(
                "FlowOS: Could not synchronize settings.",
                error
            );

        }


        applyTheme(
            selectedTheme
        );

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    injectFinalStyles();


    const initialTheme =
        getSavedTheme();


    /*
     * If body already exists, apply immediately.
     */

    if (document.body) {

        applyTheme(
            initialTheme
        );

    } else {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                applyTheme(
                    initialTheme
                );

            },
            {
                once: true
            }
        );

    }


    /* =========================================================
       WATCH FOR DASHBOARD CONTENT
       ========================================================= */

    /*
     * Dashboard project cards are generated
     * dynamically by dashboard.js.
     *
     * This observer makes sure our visual fixes
     * also apply after those cards appear.
     */

    if (
        typeof MutationObserver !== "undefined"
    ) {

        const observer =
            new MutationObserver(
                function () {

                    prepareDashboardStats();

                    refreshProjectProgressBars();

                }
            );


        if (document.body) {

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );

        } else {

            document.addEventListener(
                "DOMContentLoaded",
                function () {

                    observer.observe(
                        document.body,
                        {
                            childList: true,
                            subtree: true
                        }
                    );

                },
                {
                    once: true
                }
            );

        }

    }


    /* =========================================================
       PUBLIC FLOWOS THEME API
       ========================================================= */

    window.FlowOSTheme = {

        setTheme: function (theme) {

            saveTheme(theme);

        },


        getTheme: function () {

            return getSavedTheme();

        },


        toggle: function () {

            const currentTheme =
                getSavedTheme();


            saveTheme(
                currentTheme === "dark"
                    ? "light"
                    : "dark"
            );

        }

    };


})();