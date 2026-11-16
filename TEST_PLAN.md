# Test Plan

Run these checks against the deployed web app and record actual results/screenshots.

| ID | Test | Expected result |
|---|---|---|
| T1 | Run setupDatabase; inspect Employees, Projects, Tasks and Integrity_Checks | Seed data exists; every task project/assignee and every project manager reference resolves |
| T2 | Add valid employee | New EMP ID appears in Sheet and UI |
| T3 | Add employee with missing name/email | Field validation appears; no row added |
| T4 | Add duplicate email with different letter case | Rejected |
| T5 | Edit employee with current version | Changes persist and version increments |
| T6 | Edit employee with missing/stale version | Rejected; no overwrite |
| T7 | Demote/deactivate manager of open project | Rejected |
| T8 | Create project with end date before start date | Rejected |
| T9 | Create task with invalid project/assignee | Rejected |
| T10 | Assign task to Project Manager | Allowed |
| T11 | Assign new task to inactive employee | Rejected |
| T12 | Existing task assigned to later-inactive employee | Historical assignment remains linked |
| T13 | Overdue count | Counts only due dates before current Asia/Kolkata date and not Completed |
| T14 | Employee dashboard | Counts match that employee's assigned tasks |
| T15 | Project with zero tasks | Progress displays 0% |
| T16 | Delete task and confirm | Task removed; cancel leaves it unchanged |
| T17 | CSV export | Readable CSV contains filtered/source task data |

## Integrity_Checks sheet
The setup script creates the core entity sheets. For evidence, create an `Integrity_Checks` sheet with columns `check_name`, `issue_count`, `result`, `checked_at`. Add checks for:
- Tasks with missing project_id reference
- Tasks with missing assignee_id reference
- Projects with missing manager_id reference or manager role not Project Manager
Use zero issue count as PASS. Capture a screenshot after running the checks.
