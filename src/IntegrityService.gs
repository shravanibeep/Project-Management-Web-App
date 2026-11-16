function runIntegrityChecks() {
  const ss=db_();
  let sh=ss.getSheetByName('Integrity_Checks');
  if(!sh)sh=ss.insertSheet('Integrity_Checks');
  sh.clear();
  sh.getRange(1,1,1,4).setValues([['check_name','issue_count','result','checked_at']]);
  const employees=rows_('Employees'),projects=rows_('Projects'),tasks=rows_('Tasks');
  const checks=[
    ['Tasks with missing project references',tasks.filter(t=>!projects.some(p=>p.project_id===t.project_id)).length],
    ['Tasks with missing assignee references',tasks.filter(t=>!employees.some(e=>e.employee_id===t.assignee_id)).length],
    ['Projects with invalid manager references',projects.filter(p=>!employees.some(e=>e.employee_id===p.manager_id&&e.role==='Project Manager')).length]
  ];
  const stamp=now_();
  sh.getRange(2,1,checks.length,4).setValues(checks.map(x=>[x[0],x[1],x[1]===0?'PASS':'FAIL',stamp]));
  return {url:ss.getUrl(),checks:checks};
}
