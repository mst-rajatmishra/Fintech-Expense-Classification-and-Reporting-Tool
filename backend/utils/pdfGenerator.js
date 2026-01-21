const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePDFReport = (transactions, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = `./reports/${fileName}.pdf`;

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Title
      doc.fontSize(20).text('Expense Report', { align: 'center' });
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Summary
      const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      doc.fontSize(14).text('Summary');
      doc.fontSize(11).text(`Total Expenses: ₹${totalAmount.toFixed(2)}`);
      doc.text(`Total Transactions: ${transactions.length}`);
      doc.moveDown();

      // Category breakdown
      const byCategory = {};
      transactions.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + parseFloat(t.amount);
      });

      doc.fontSize(14).text('Expenses by Category');
      Object.entries(byCategory).forEach(([category, amount]) => {
        doc.fontSize(11).text(`${category}: ₹${amount.toFixed(2)}`);
      });
      doc.moveDown();

      // Transactions table
      doc.fontSize(14).text('Detailed Transactions');
      doc.fontSize(10);

      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 150;
      const col3X = 300;
      const col4X = 400;

      doc.text('Date', col1X, tableTop);
      doc.text('Description', col2X, tableTop);
      doc.text('Category', col3X, tableTop);
      doc.text('Amount', col4X, tableTop);

      doc.moveTo(col1X, tableTop + 20).lineTo(520, tableTop + 20).stroke();

      let yPosition = tableTop + 30;
      transactions.forEach(transaction => {
        if (yPosition > 750) {
          doc.addPage();
          yPosition = 50;
        }
        doc.text(new Date(transaction.date).toLocaleDateString(), col1X, yPosition);
        doc.text(transaction.description.substring(0, 30), col2X, yPosition);
        doc.text(transaction.category, col3X, yPosition);
        doc.text(`₹${transaction.amount}`, col4X, yPosition);
        yPosition += 20;
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePDFReport };
