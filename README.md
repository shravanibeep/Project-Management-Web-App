# Project Management Web Application

A Google Apps Script Web App backed by Google Sheets. Uses synthetic data only. No AI/ML/LLM functionality.

## Features
- Employee CRUD with validation, unique email, generated IDs, and version-based optimistic concurrency.
- Project CRUD with active Project Manager validation and date validation.
- Task CRUD, filters, overdue marking, and employee status updates.
- Employee dashboard and Project Manager dashboard.
- Project/employee summaries and CSV export.
- Script lock for writes and generated IDs.
- Plain-text date/timestamp columns.

## Setup
1. Create a new Google Sheet (or run `setupDatabase()` to create one automatically).
2. Open Extensions → Apps Script.
3. Create files matching `src/` (Apps Script files should be created without the `src/` prefix).
4. Copy each `.gs` and `Index.html` file into the Apps Script editor.
5. In Project Settings, enable `Show "appsscript.json" manifest file` and replace it with the provided manifest.
6. Set the project time zone to Asia/Kolkata.
7. Run `setupDatabase()` once and authorize the requested permissions. It creates Employees, Projects, Tasks and synthetic seed data. The spreadsheet URL is returned in the execution log.
8. Run `doGet` only through deployment: Deploy → New deployment → Web app.
9. For a reviewer demo, restrict access to the intended reviewer(s) where account settings allow. Do not expose the spreadsheet publicly.
10. Open the deployed URL and test the workflows.

## Important security limitation
The role dropdown is a demonstration-only role selector. The browser sends `actingRole` to Apps Script, so a user can modify that value. It is NOT authentication or authorization. For production, use Google identity / Workspace access controls and enforce permissions server-side based on verified identity and an explicit user-to-role mapping. The current prototype should only be shared with authorized reviewers.

## Concurrency
Every record has an integer `version`. On edit, the client must submit the version it originally loaded. The server compares it with the current row version while holding a script lock. A mismatch or missing version rejects the update. Successful edits increment the version. This is optimistic concurrency control; `LockService` also serializes writes and ID generation.

## Relationship and assignment rules
- Each project references an existing active Project Manager.
- Each task references an existing project and active employee at creation/update.
- Project Managers may also be assigned tasks because they are employees.
- Deactivating/demoting a Project Manager who manages a non-completed project is blocked.
- Existing tasks assigned to an employee who later becomes inactive remain linked; inactive employees cannot receive new assignments.
- Employees and projects are not deleted; tasks can be deleted after confirmation.

## Date and overdue rules
Dates are stored as `yyyy-MM-dd` text. Setup formats date and timestamp columns as plain text. Overdue means `due_date < today` AND `status != Completed`. The dashboard computes using the script's Asia/Kolkata date. Do not hardcode a historic overdue count.

## Limitations
- This is a low-volume prototype backed by Google Sheets.
- Role selection is simulated and not secure authentication.
- Employee self-service status updates verify the submitted employee ID, not a verified signed-in identity; do not treat this as production access control.
- A deployment set to execute as the owner runs spreadsheet operations with the owner's permissions. Restrict web app access appropriately.
