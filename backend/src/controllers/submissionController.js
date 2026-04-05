const submissionService = require('../services/submissionService');

async function submit(req, res) {
  const data = await submissionService.createSubmission(req.params.tableName, req.body, req.user);
  return res.json({ success: true, message: 'Submission created', submission: data });
}

async function list(req, res) {
  const data = await submissionService.listSubmissions(req.user, req.query);
  return res.json({ success: true, submissions: data });
}

async function getById(req, res) {
  const data = await submissionService.getSubmissionById(req.params.id, req.user);
  return res.json({ success: true, submission: data });
}

async function approve(req, res) {
  const data = await submissionService.approveSubmission(req.params.id, req.user, req.body.remarks);
  return res.json({ success: true, message: 'Submission approved', submission: data });
}

async function reject(req, res) {
  const data = await submissionService.rejectSubmission(req.params.id, req.user, req.body.remarks);
  return res.json({ success: true, message: 'Submission rejected', submission: data });
}

module.exports = {
  submit,
  list,
  getById,
  approve,
  reject
};
