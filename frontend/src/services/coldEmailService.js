import api from './api';

const coldEmailService = {
  /**
   * Dispatches a batch of up to 10 cold emails using saiyamrajput71@gmail.com
   * @param {{ recipients: Array<string|{email: string, org: string}>, subject: string, body: string, senderEmail?: string, attachResume?: boolean }} payload
   */
  sendBatch: (payload) => api.post('/cold-email/send', payload).then((r) => r.data),

  /**
   * Retrieves previous batch dispatch logs
   */
  getHistory: (limit = 10) => api.get('/cold-email/history', { params: { limit } }).then((r) => r.data),

  /**
   * Fetches overall delivery statistics
   */
  getStats: () => api.get('/cold-email/stats').then((r) => r.data),
};

export default coldEmailService;
