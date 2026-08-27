# 🚀 FlowOS

> A full-stack personal productivity workspace designed to help users plan, organize, and understand their work.

### 🌐 Live Demo

https://flowos-wome.onrender.com

---

## 📌 Overview

FlowOS is a full-stack productivity application that brings tasks, projects, deadlines, calendar planning, analytics, and daily prioritization into one workspace.

Instead of treating task management as simply a checklist, FlowOS helps users answer a more useful question:

> **"What should I focus on right now?"**

The application provides a personalized workspace for each authenticated user, ensuring that tasks, projects, deadlines, calendar data, and analytics remain isolated between accounts.

---

## ✨ Features

### 🔐 Authentication & User Isolation

* User registration and login
* Secure session-based authentication
* Protected application routes
* Logout functionality
* User-specific tasks and projects
* Account-level data isolation

### ✅ Task Management

* Create and manage tasks
* Priority levels
* Estimated completion time
* Completion tracking
* Deadline management
* Overdue task handling
* Project association

### 📁 Project Management

* Create and organize projects
* Associate tasks with projects
* Track project progress
* View project-specific work

### 📅 Calendar

* Visualize deadlines and scheduled work
* Connect task deadlines with calendar planning
* View upcoming work in a centralized interface

### 📊 Analytics

* Personalized productivity statistics
* Task completion insights
* Project progress
* Productivity trends
* User-specific analytics

### 🧠 Fix My Day

Fix My Day is FlowOS's prioritization feature.

It analyzes unfinished tasks and ranks them according to factors such as:

* Deadline urgency
* Overdue status
* Task priority
* Estimated effort

The result is a focused list of the work that deserves attention first.

### 🎨 UI & Experience

* Clean productivity-focused interface
* Light and dark themes
* Responsive layouts
* Consistent navigation
* Empty states and error handling
* User-focused dashboard

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive UI
* Client-side API integration

### Backend

* Node.js
* Express.js
* REST APIs
* Session-based authentication

### Database

* PostgreSQL

### Deployment

* GitHub
* Render

---

## 🏗️ Architecture

FlowOS follows a straightforward full-stack architecture:

```text
┌─────────────────────────────┐
│          Browser            │
│                             │
│ HTML / CSS / JavaScript     │
└──────────────┬──────────────┘
               │
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│       Node.js + Express     │
│                             │
│ Authentication              │
│ Task APIs                   │
│ Project APIs                │
│ Calendar APIs               │
│ Analytics APIs              │
│ Authorization               │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│ Users                       │
│ Tasks                       │
│ Projects                    │
│ Deadlines                   │
│ Productivity data           │
└─────────────────────────────┘
```

---

## 🔒 User Data Isolation

A key requirement of FlowOS is that each account has its own workspace.

Authenticated requests are associated with the current user, and user-specific resources are filtered using the authenticated user's identity.

Conceptually:

```text
User A
  │
  ├── Tasks
  ├── Projects
  ├── Calendar
  └── Analytics

User B
  │
  ├── Tasks
  ├── Projects
  ├── Calendar
  └── Analytics
```

User A cannot access User B's productivity data.

---

## 🧠 Fix My Day

The Fix My Day feature converts a large collection of unfinished tasks into a smaller prioritized workload.

The prioritization considers:

```text
Deadline urgency
       +
Task priority
       +
Estimated effort
       ↓
Priority score
       ↓
Today's Focus
```

This gives users a practical starting point instead of requiring them to manually decide which task to work on first.

---

## 🎯 Project Goals

FlowOS was built with three main goals:

1. **Reduce planning friction**

   Keep tasks, projects, deadlines, and planning in one workspace.

2. **Make priorities clearer**

   Help users understand what deserves attention instead of simply displaying a large task list.

3. **Build a production-style full-stack application**

   Apply real-world concepts including authentication, authorization, database persistence, REST APIs, user isolation, responsive UI, and cloud deployment.

---

## 💻 Running Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd FlowOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

Do not commit the `.env` file to GitHub.

### 4. Start the application

```bash
npm start
```

The application should then be available at:

```text
http://localhost:3000
```

---

## ☁️ Deployment

FlowOS is deployed using Render.

The deployment flow is:

```text
Local Development
       │
       ▼
     GitHub
       │
       ▼
     Render
       │
       ▼
Production Application
```

Pushing changes to the configured GitHub branch triggers a new deployment on Render.

---

## ⚙️ Engineering Highlights

Some of the main engineering concepts demonstrated by this project include:

* Full-stack application architecture
* REST API design
* Session-based authentication
* Authorization and protected routes
* PostgreSQL data persistence
* User-specific data isolation
* CRUD operations
* Client-server communication
* Deadline and priority logic
* Productivity analytics
* Responsive UI design
* Theme management
* Production deployment
* Git/GitHub workflow

---

## 🔮 Future Improvements

Potential future improvements include:

* More advanced task scheduling
* Drag-and-drop planning
* Recurring tasks
* Smarter productivity recommendations
* Notifications and reminders
* Collaborative projects
* More detailed productivity insights
* Mobile application support

---

## 📌 Status

**Current status: Production-ready portfolio project**

FlowOS currently provides a complete authenticated productivity workflow from task creation through planning, calendar visualization, analytics, and daily prioritization.

---

## 👤 Author

Built as a full-stack web development project focused on practical software engineering, product thinking, and user experience.
