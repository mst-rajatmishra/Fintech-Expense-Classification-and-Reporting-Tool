const Transaction = require('../models/Transaction');
const Upload = require('../models/Upload');
const { parseCSV, validateCSVData } = require('../utils/csvParser');
const { categorizeTransaction } = require('../utils/categorize');
const { generatePDFReport } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const uploadId = uuidv4();
    const fileName = `${req.user.id}_${uploadId}.csv`;
    const uploadDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);

    // Create upload record
    const upload = await Upload.create({
      userId: req.user.id,
      fileName: file.name,
      filePath: fileName,
      status: 'processing',
    });

    // Parse CSV
    let csvData = [];
    try {
      csvData = await parseCSV(filePath);
    } catch (error) {
      await upload.update({ status: 'failed', errorMessage: 'Invalid CSV format' });
      return res.status(400).json({ error: 'Invalid CSV format', details: error.message });
    }

    if (csvData.length === 0) {
      await upload.update({ status: 'failed', errorMessage: 'CSV is empty' });
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Validate data
    const validationErrors = validateCSVData(csvData);
    if (validationErrors.length > 0) {
      await upload.update({ status: 'failed', errorMessage: validationErrors.join('; ') });
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Process and store transactions
    const transactions = [];
    for (const row of csvData) {
      try {
        const transaction = await Transaction.create({
          userId: req.user.id,
          uploadId: upload.id,
          date: new Date(row.date),
          description: row.description,
          amount: parseFloat(row.amount),
          category: categorizeTransaction(row.description),
          paymentMethod: row.paymentMethod || null,
          remarks: row.remarks || null,
        });
        transactions.push(transaction);
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }

    await upload.update({
      status: 'success',
      transactionCount: transactions.length,
    });

    res.status(201).json({
      message: 'File uploaded and processed successfully',
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file', details: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let whereClause = { userId: req.user.id };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    if (category) {
      whereClause.category = category;
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
    });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions', details: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
    });

    if (transactions.length === 0) {
      return res.json({
        totalExpenses: 0,
        byCategory: {},
        byMonth: {},
        recentTransactions: [],
      });
    }

    // Total expenses
    const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // By category
    const byCategory = {};
    transactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + parseFloat(t.amount);
    });

    // By month
    const byMonth = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + parseFloat(t.amount);
    });

    // Recent transactions
    const recentTransactions = transactions.slice(-10).reverse();

    res.json({
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      byCategory,
      byMonth,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard data', details: error.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });

    if (transactions.length === 0) {
      return res.status(400).json({ error: 'No transactions to export' });
    }

    const csv = 'Date,Description,Amount,Category,Payment Method\n' +
      transactions.map(t =>
        `"${new Date(t.date).toISOString().split('T')[0]}","${t.description}","${t.amount}","${t.category}","${t.paymentMethod || ''}"`
      ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Error exporting CSV', details: error.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });

    if (transactions.length === 0) {
      return res.status(400).json({ error: 'No transactions to export' });
    }

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const fileName = `report_${req.user.id}_${Date.now()}`;
    const pdfPath = await generatePDFReport(transactions, fileName);

    res.download(pdfPath, 'expense_report.pdf', () => {
      fs.unlink(pdfPath, () => {});
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
};
