function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Project Management')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }

function setupDatabase() {
  const props = PropertiesService.getScriptProperties();
  let ss;
  const existingId = props.getProperty('SPREADSHEET_ID');
  if (existingId) {
    try { ss = SpreadsheetApp.openById(existingId); } catch(e) {}
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Project Management App Database');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  Object.keys(CONFIG.SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1,1,1,CONFIG.SHEETS[name].length).setValues([CONFIG.SHEETS[name]]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,CONFIG.SHEETS[name].length).setFontWeight('bold');
    }
    // Keep date and timestamp columns as plain text to avoid locale-dependent reformatting.
    const headers = CONFIG.SHEETS[name];
    headers.forEach((h,i) => {
      if (h.indexOf('date') >= 0 || h.indexOf('_at') >= 0) sh.getRange(2,i+1,Math.max(sh.getMaxRows()-1,1),1).setNumberFormat('@');
    });
  });
  if (rows_('Employees').length === 0) seed_();
  return {spreadsheetId:ss.getId(), url:ss.getUrl(), message:'Database ready.'};
}
function seed_() {
  const t = now_();
  const employees = [
    ['EMP-001','Aarav Mehta','aarav.mehta@example.com','Project Manager',true],
    ['EMP-002','Priya Nair','priya.nair@example.com','IT Employee',true],
    ['EMP-003','Rohan Das','rohan.das@example.com','IT Employee',true],
    ['EMP-004','Sneha Reddy','sneha.reddy@example.com','IT Employee',true],
    ['EMP-005','Karthik Iyer','karthik.iyer@example.com','IT Employee',false],
    ['EMP-006','Meera Kapoor','meera.kapoor@example.com','Project Manager',true]
  ];
  employees.forEach(x => append_('Employees',{employee_id:x[0],full_name:x[1],email:x[2],role:x[3],is_active:x[4],created_at:t,updated_at:t,version:1}));
  [
    ['PRJ-001','Customer Portal Revamp','Redesign the customer portal.','EMP-001','2026-09-01','2026-12-15','Active'],
    ['PRJ-002','Cloud Migration','Move workloads to cloud infrastructure.','EMP-006','2026-10-01','2027-01-31','Active'],
    ['PRJ-003','Internal Wiki Setup','Create an internal knowledge base.','EMP-001','2026-11-15','2027-02-28','Planned']
  ].forEach(x => append_('Projects',{project_id:x[0],title:x[1],description:x[2],manager_id:x[3],start_date:x[4],end_date:x[5],status:x[6],created_at:t,updated_at:t,version:1}));
  const tasks = [
    ['TSK-001','PRJ-001','EMP-002','Design new login page','', 'High','Completed','2026-09-02','2026-09-20'],
    ['TSK-002','PRJ-001','EMP-003','Build user profile API','','High','In Progress','2026-09-02','2026-10-25'],
    ['TSK-003','PRJ-001','EMP-004','Migrate static assets to CDN','','Medium','To Do','2026-09-02','2026-11-30'],
    ['TSK-004','PRJ-001','EMP-002','Write UAT test cases','','Medium','In Progress','2026-09-02','2026-11-10'],
    ['TSK-005','PRJ-001','EMP-003','Fix accessibility issues','','Low','To Do','2026-09-02','2026-10-30'],
    ['TSK-006','PRJ-001','EMP-004','Prepare release notes','','Low','Completed','2026-09-02','2026-10-31'],
    ['TSK-007','PRJ-002','EMP-003','Inventory on-premise servers','','High','Completed','2026-10-02','2026-10-15'],
    ['TSK-008','PRJ-002','EMP-004','Set up cloud landing zone','','High','In Progress','2026-10-02','2026-11-20'],
    ['TSK-009','PRJ-002','EMP-002','Plan database migration','','High','To Do','2026-10-02','2026-11-25'],
    ['TSK-010','PRJ-002','EMP-004','Configure monitoring and alerts','','Medium','To Do','2026-10-02','2026-11-02'],
    ['TSK-011','PRJ-002','EMP-002','Document rollback procedure','','Medium','In Progress','2026-10-02','2026-12-05'],
    ['TSK-012','PRJ-002','EMP-003','Security review of network rules','','High','To Do','2026-10-02','2026-12-10'],
    ['TSK-013','PRJ-002','EMP-005','Legacy access audit','','Low','To Do','2026-10-02','2026-12-18']
  ];
  tasks.forEach(x => append_('Tasks',{task_id:x[0],project_id:x[1],assignee_id:x[2],title:x[3],description:x[4],priority:x[5],status:x[6],created_date:x[7],due_date:x[8],created_at:t,updated_at:t,version:1}));
}
function getBootstrap() {
  return {
    employees: publicRows_(rows_('Employees')),
    projects: publicRows_(rows_('Projects')),
    tasks: publicRows_(rows_('Tasks')),
    today: today_(),
    spreadsheetUrl: db_().getUrl()
  };
}
