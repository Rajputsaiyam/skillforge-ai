const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession,
  sendMessage,
  rateMessage,
  clearChat,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Session management routes
router.get('/sessions', protect, getSessions);
router.post('/sessions', protect, createSession);
router.get('/sessions/:id/messages', protect, getSessionMessages);
router.post('/sessions/:id/messages', protect, sendMessage);
router.delete('/sessions/:id', protect, deleteSession);

// Feedback telemetry route
router.post('/messages/:id/feedback', protect, rateMessage);

// Legacy single-endpoint compatibility
router.post('/message', protect, sendMessage);
router.post('/clear', protect, clearChat);

module.exports = router;
