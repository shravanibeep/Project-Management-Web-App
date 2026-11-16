function getEmployees(role) {
  return publicRows_(rows_('Employees'));
}
function saveEmployee(data, actingRole) {
  try {
    requireManager_(actingRole);
    return withLock_(() => {
      data = data || {};
      const all = rows_('Employees'), editing = !!clean_(data.employee_id);
      const old = editing ? all.find(x => x.employee_id === clean_(data.employee_id)) : null;
      if (editing && !old) return result_(false,null,'Employee not found.');
      if (editing && (!data.version || Number(data.version) !== old.version))
        return result_(false,null,'This record has changed. Reload the employee and try again.');
      const name = clean_(data.full_name).replace(/\s+/g,' ');
      const email = clean_(data.email).toLowerCase();
      const roleValue = clean_(data.role);
      const active = data.is_active === true || data.is_active === 'true';
      const errors = {};
      if (name.length < 2 || name.length > 80) errors.full_name = 'Name must be 2–80 characters.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid work email.';
      if (all.some(x => x.email.toLowerCase() === email && x.employee_id !== (old && old.employee_id))) errors.email = 'Email already exists.';
      if (!CONFIG.ROLES.includes(roleValue)) errors.role = 'Choose a valid role.';
      if (editing && old.role === 'Project Manager' && (roleValue !== 'Project Manager' || !active)) {
        const managed = rows_('Projects').some(p => p.manager_id === old.employee_id && p.status !== 'Completed');
        if (managed) errors.role = 'This Project Manager manages an open project and cannot be demoted or deactivated.';
      }
      if (Object.keys(errors).length) return result_(false,null,'Please correct the highlighted fields.',errors);
      const stamp = now_();
      const record = {
        employee_id: editing ? old.employee_id : nextId_('Employees'),
        full_name:name,email,role:roleValue,is_active:active,
        created_at:editing ? old.created_at : stamp, updated_at:stamp,
        version:editing ? old.version+1 : 1
      };
      if (editing) update_('Employees',old._row,record); else append_('Employees',record);
      return result_(true,record,editing?'Employee updated.':'Employee added.');
    });
  } catch(e) { return result_(false,null,e.message); }
}
function getEmployee(id) {
  const x = rows_('Employees').find(r => r.employee_id === id);
  return x ? publicRows_([x])[0] : null;
}
