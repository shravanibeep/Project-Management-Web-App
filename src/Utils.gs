function db_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Database not configured. Run setupDatabase() first.');
  return SpreadsheetApp.openById(id);
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}
function today_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
}
function result_(ok, data, message, errors) {
  return {ok:ok, data:data || null, message:message || '', errors:errors || {}};
}
function rows_(name) {
  const sh = db_().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet: ' + name);
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row, i) => {
    const obj = {_row:i+2};
    headers.forEach((h,j) => obj[h] = row[j]);
    if ('is_active' in obj) obj.is_active = String(obj.is_active).toUpperCase() === 'TRUE';
    if ('version' in obj) obj.version = Number(obj.version || 1);
    return obj;
  }).filter(o => o[CONFIG.ID_FIELD[name]]);
}
function append_(name, obj) {
  const sh = db_().getSheetByName(name);
  const headers = CONFIG.SHEETS[name];
  sh.appendRow(headers.map(h => obj[h] === undefined ? '' : obj[h]));
}
function update_(name, rowNum, obj) {
  const sh = db_().getSheetByName(name);
  const headers = CONFIG.SHEETS[name];
  sh.getRange(rowNum, 1, 1, headers.length).setValues([headers.map(h => obj[h] === undefined ? '' : obj[h])]);
}
function nextId_(name) {
  const field = CONFIG.ID_FIELD[name], prefix = CONFIG.PREFIX[name];
  const max = rows_(name).reduce((m,r) => {
    const match = String(r[field] || '').match(/-(\d+)$/);
    return match ? Math.max(m, Number(match[1])) : m;
  }, 0);
  return prefix + '-' + String(max + 1).padStart(3,'0');
}
function requireManager_(role) {
  if (role !== 'Project Manager') throw new Error('This action requires the Project Manager role.');
}
function clean_(v) { return String(v == null ? '' : v).trim(); }
function validDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !isNaN(new Date(s + 'T00:00:00').getTime()); }
function publicRows_(list) { return list.map(({_row, ...x}) => x); }
