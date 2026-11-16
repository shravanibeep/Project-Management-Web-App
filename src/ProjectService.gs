function saveProject(data, actingRole) {
  try {
    requireManager_(actingRole);
    return withLock_(() => {
      data = data || {};
      const all = rows_('Projects'), editing = !!clean_(data.project_id);
      const old = editing ? all.find(x => x.project_id === clean_(data.project_id)) : null;
      if (editing && !old) return result_(false,null,'Project not found.');
      if (editing && (!data.version || Number(data.version) !== old.version)) return result_(false,null,'Project changed. Reload before saving.');
      const errors = {}, title=clean_(data.title), manager=clean_(data.manager_id);
      const employees=rows_('Employees');
      const m=employees.find(e=>e.employee_id===manager && e.role==='Project Manager' && e.is_active);
      if (title.length<3 || title.length>100) errors.title='Title must be 3–100 characters.';
      if (!m) errors.manager_id='Select an active Project Manager.';
      if (!validDate_(data.start_date) || !validDate_(data.end_date)) errors.start_date='Enter valid dates (yyyy-MM-dd).';
      else if (data.end_date < data.start_date) errors.end_date='End date cannot be before start date.';
      if (!CONFIG.PROJECT_STATUSES.includes(data.status)) errors.status='Select a valid project status.';
      if (Object.keys(errors).length) return result_(false,null,'Please correct the highlighted fields.',errors);
      const stamp=now_(), rec={project_id:editing?old.project_id:nextId_('Projects'),title,description:clean_(data.description),manager_id:manager,start_date:data.start_date,end_date:data.end_date,status:data.status,created_at:editing?old.created_at:stamp,updated_at:stamp,version:editing?old.version+1:1};
      if(editing) update_('Projects',old._row,rec); else append_('Projects',rec);
      return result_(true,rec,editing?'Project updated.':'Project created.');
    });
  } catch(e){return result_(false,null,e.message);}
}
