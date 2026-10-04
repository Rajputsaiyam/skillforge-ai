const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, description, meta = {}) => {
  try {
    await ActivityLog.create({ user: userId, action, description, meta });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = logActivity;
