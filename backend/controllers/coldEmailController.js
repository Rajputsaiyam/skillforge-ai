const asyncHandler = require('express-async-handler');
const {
  sendColdEmailBatch,
  getBatchHistory,
  getOutreachStats,
  DEFAULT_SENDER,
} = require('../services/coldEmailService');
const logActivity = require('../utils/activityLogger');

/**
 * @desc Dispatch cold email batch (up to 10 recipients)
 * @route POST /api/cold-email/send
 * @access Private
 */
const sendBatch = asyncHandler(async (req, res) => {
  const { recipients, subject, body, senderEmail, attachResume } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    res.status(400);
    throw new Error('Please provide a valid list of recipient email addresses (1 to 10 recipients).');
  }

  if (recipients.length > 10) {
    res.status(400);
    throw new Error('Maximum batch size is 10 recipients to maintain deliverability and prevent spam.');
  }

  if (!subject || !subject.trim()) {
    res.status(400);
    throw new Error('Email subject line cannot be empty.');
  }

  if (!body || !body.trim()) {
    res.status(400);
    throw new Error('Email body content cannot be empty.');
  }

  const result = await sendColdEmailBatch({
    userId: req.user._id,
    senderEmail: senderEmail || DEFAULT_SENDER,
    recipients,
    subject,
    body,
    attachResume: attachResume !== false,
  });

  // Log activity
  try {
    await logActivity(
      req.user._id,
      'COLD_EMAIL_BATCH_SENT',
      `Sent cold outreach batch of ${result.deliveredCount} emails via ${result.senderEmail}`,
      { batchId: result.batchId, total: result.totalCount, delivered: result.deliveredCount }
    );
  } catch (err) {
    // Non-blocking activity logging
  }

  res.status(200).json(result);
});

/**
 * @desc Get cold email outreach history
 * @route GET /api/cold-email/history
 * @access Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const history = await getBatchHistory(req.user._id, limit);

  res.json({
    success: true,
    count: history.length,
    history,
  });
});

/**
 * @desc Get cold email stats & deliverability overview
 * @route GET /api/cold-email/stats
 * @access Private
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await getOutreachStats(req.user._id);

  res.json({
    success: true,
    stats,
  });
});

module.exports = {
  sendBatch,
  getHistory,
  getStats,
};
