const { getAdminAnalytics } = require('../services/analyticsService');

async function summary(req, res) {
  const data = await getAdminAnalytics();
  return res.json({ success: true, analytics: data });
}

module.exports = { summary };
