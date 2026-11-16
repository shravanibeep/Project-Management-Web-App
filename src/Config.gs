const CONFIG = {
  SHEETS: {
    Employees: ['employee_id','full_name','email','role','is_active','created_at','updated_at','version'],
    Projects: ['project_id','title','description','manager_id','start_date','end_date','status','created_at','updated_at','version'],
    Tasks: ['task_id','project_id','assignee_id','title','description','priority','status','created_date','due_date','created_at','updated_at','version']
  },
  ROLES: ['Project Manager', 'IT Employee'],
  PROJECT_STATUSES: ['Planned', 'Active', 'On Hold', 'Completed'],
  TASK_PRIORITIES: ['Low', 'Medium', 'High'],
  TASK_STATUSES: ['To Do', 'In Progress', 'Completed'],
  PREFIX: {Employees:'EMP', Projects:'PRJ', Tasks:'TSK'},
  ID_FIELD: {Employees:'employee_id', Projects:'project_id', Tasks:'task_id'}
};
