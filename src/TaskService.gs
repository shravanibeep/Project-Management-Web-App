function saveTask(data, actingRole) {
  try {
    requireManager_(actingRole);
    return withLock_(() => {
      data=data||{};
      const all=rows_('Tasks'), editing=!!clean_(data.task_id);
      const old=editing?all.find(x=>x.task_id===clean_(data.task_id)):null;
      if(editing&&!old)return result_(false,null,'Task not found.');
      if(editing&&(!data.version||Number(data.version)!==old.version))return result_(false,null,'Task changed. Reload before saving.');
      const errors={}, project=rows_('Projects').find(x=>x.project_id===clean_(data.project_id));
      const employee=rows_('Employees').find(x=>x.employee_id===clean_(data.assignee_id) && x.is_active);
      if(!project)errors.project_id='Select an existing project.';
      if(!employee)errors.assignee_id='Select an active employee.';
      if(clean_(data.title).length<3||clean_(data.title).length>100)errors.title='Task title must be 3–100 characters.';
      if(!CONFIG.TASK_PRIORITIES.includes(data.priority))errors.priority='Select a valid priority.';
      if(!CONFIG.TASK_STATUSES.includes(data.status))errors.status='Select a valid status.';
      if(!validDate_(data.due_date))errors.due_date='Enter a valid due date.';
      const createdDate=editing?old.created_date:today_();
      if(validDate_(data.due_date)&&data.due_date<createdDate)errors.due_date='Due date cannot be before creation date.';
      if(Object.keys(errors).length)return result_(false,null,'Please correct the highlighted fields.',errors);
      const stamp=now_(),rec={task_id:editing?old.task_id:nextId_('Tasks'),project_id:data.project_id,assignee_id:data.assignee_id,title:clean_(data.title),description:clean_(data.description),priority:data.priority,status:data.status,created_date:createdDate,due_date:data.due_date,created_at:editing?old.created_at:stamp,updated_at:stamp,version:editing?old.version+1:1};
      if(editing)update_('Tasks',old._row,rec);else append_('Tasks',rec);
      return result_(true,rec,editing?'Task updated.':'Task created.');
    });
  }catch(e){return result_(false,null,e.message);}
}
function deleteTask(id, actingRole) {
  try {
    requireManager_(actingRole);
    return withLock_(()=>{
      const x=rows_('Tasks').find(r=>r.task_id===id);
      if(!x)return result_(false,null,'Task not found.');
      db_().getSheetByName('Tasks').deleteRow(x._row);
      return result_(true,null,'Task deleted.');
    });
  }catch(e){return result_(false,null,e.message);}
}
function updateAssignedTaskStatus(taskId, employeeId, status) {
  return withLock_(()=>{
    const x=rows_('Tasks').find(r=>r.task_id===taskId && r.assignee_id===employeeId);
    if(!x)return result_(false,null,'Assigned task not found.');
    if(!CONFIG.TASK_STATUSES.includes(status))return result_(false,null,'Invalid status.');
    x.status=status;x.updated_at=now_();x.version++;
    update_('Tasks',x._row,x);
    return result_(true,{task_id:x.task_id,status:x.status},'Task status updated.');
  });
}
