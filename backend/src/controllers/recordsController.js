const { RD_TABLES } = require('../config/rdTables');
const recordService = require('../services/recordService');

function parsePayload(req) {
  if (req.is('multipart/form-data')) {
    return {
      title: req.body.title,
      year: req.body.year,
      department_id: req.body.department_id,
      data: req.body.data ? JSON.parse(req.body.data) : {}
    };
  }
  return {
    title: req.body.title,
    year: req.body.year,
    department_id: req.body.department_id,
    data: req.body.data || {}
  };
}

async function meta(req, res) {
  return res.json({
    success: true,
    tables: RD_TABLES
  });
}

async function list(req, res) {
  const data = await recordService.listRecords(req.params.tableName, req.user, req.query);
  return res.json({ success: true, records: data });
}

async function getById(req, res) {
  const data = await recordService.getRecordById(req.params.tableName, req.params.id, req.user);
  return res.json({ success: true, record: data });
}

async function create(req, res) {
  const payload = parsePayload(req);
  const data = await recordService.createRecord(req.params.tableName, payload, req.file, req.user);
  return res.json({ success: true, message: 'Record created', record: data });
}

async function update(req, res) {
  const payload = parsePayload(req);
  const data = await recordService.updateRecord(req.params.tableName, req.params.id, payload, req.file, req.user);
  return res.json({ success: true, message: 'Record updated', record: data });
}

async function remove(req, res) {
  await recordService.deleteRecord(req.params.tableName, req.params.id, req.user);
  return res.json({ success: true, message: 'Record deleted' });
}

module.exports = {
  meta,
  list,
  getById,
  create,
  update,
  remove
};
