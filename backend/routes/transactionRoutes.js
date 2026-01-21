const express = require('express');
const {
  uploadCSV,
  getTransactions,
  getDashboardData,
  exportCSV,
  exportPDF,
} = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/upload', authenticateToken, uploadCSV);
router.get('/transactions', authenticateToken, getTransactions);
router.get('/dashboard', authenticateToken, getDashboardData);
router.get('/export/csv', authenticateToken, exportCSV);
router.get('/export/pdf', authenticateToken, exportPDF);

module.exports = router;
