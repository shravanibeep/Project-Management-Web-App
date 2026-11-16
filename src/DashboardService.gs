function getEmployeeDashboard(employeeId) {
  const tasks=rows_('Tasks').filter(t=>t.assignee_id===employeeId);
  const overdue=tasks.filter(t=>t.due_date<today_()&&t.status!=='Completed');
  return {tasks:publicRows_(tasks),counts:{pending:tasks.filter(t=>t.status==='To Do').length,inProgress:tasks.filter(t=>t.status==='In Progress').length,completed:tasks.filter(t=>t.status==='Completed').length,overdue:overdue.length}};
}
function getManagerDashboard(projectId) {
  const projects=rows_('Projects'), tasks=rows_('Tasks');
  const selected=projectId?projects.filter(p=>p.project_id===projectId):projects;
  const relevant=tasks.filter(t=>selected.some(p=>p.project_id===t.project_id));
  const projectStats=selected.map(p=>{
    const ts=tasks.filter(t=>t.project_id===p.project_id),done=ts.filter(t=>t.status==='Completed').length;
    return {project_id:p.project_id,title:p.title,total:ts.length,completed:done,inProgress:ts.filter(t=>t.status==='In Progress').length,pending:ts.filter(t=>t.status==='To Do').length,progress:ts.length?Math.round(done/ts.length*100):0};
  });
  const workload=rows_('Employees').map(e=>({employee_id:e.employee_id,name:e.full_name,total:relevant.filter(t=>t.assignee_id===e.employee_id&&t.status!=='Completed').length})).filter(x=>x.total>0);
  const overdue=relevant.filter(t=>t.due_date<today_()&&t.status!=='Completed');
  return {projects:projectStats,workload,overdue:publicRows_(overdue),counts:{total:relevant.length,completed:relevant.filter(t=>t.status==='Completed').length,inProgress:relevant.filter(t=>t.status==='In Progress').length,pending:relevant.filter(t=>t.status==='To Do').length}};
}
function getReports() {
  const tasks=rows_('Tasks'), projects=rows_('Projects'), employees=rows_('Employees');
  return {byProject:projects.map(p=>({label:p.title,total:tasks.filter(t=>t.project_id===p.project_id).length})),byEmployee:employees.map(e=>({label:e.full_name,total:tasks.filter(t=>t.assignee_id===e.employee_id).length})),byStatus:['To Do','In Progress','Completed'].map(s=>({label:s,total:tasks.filter(t=>t.status===s).length})),tasks:publicRows_(tasks)};
}
