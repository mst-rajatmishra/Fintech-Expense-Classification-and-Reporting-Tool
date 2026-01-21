const csv = require('csv-parser');
const fs = require('fs');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const validateCSVData = (data) => {
  const errors = [];
  const requiredFields = ['date', 'description', 'amount'];

  data.forEach((row, index) => {
    // Check for required fields
    requiredFields.forEach(field => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });

    // Validate amount
    if (row.amount && isNaN(parseFloat(row.amount))) {
      errors.push(`Row ${index + 1}: Invalid amount format`);
    }

    // Validate date format
    if (row.date && isNaN(new Date(row.date).getTime())) {
      errors.push(`Row ${index + 1}: Invalid date format`);
    }
  });

  return errors;
};

module.exports = { parseCSV, validateCSVData };
