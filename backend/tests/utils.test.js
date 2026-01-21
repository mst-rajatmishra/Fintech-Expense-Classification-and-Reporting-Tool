const { parseCSV, validateCSVData } = require('../../utils/csvParser');
const { categorizeTransaction } = require('../../utils/categorize');

describe('CSV Parser', () => {
  describe('validateCSVData', () => {
    it('should validate correct CSV data', () => {
      const data = [
        { date: '2024-01-15', description: 'Grocery Store', amount: '1500' },
        { date: '2024-01-16', description: 'Swiggy Order', amount: '350' },
      ];

      const errors = validateCSVData(data);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data = [
        { date: '2024-01-15', description: 'Grocery Store' }, // Missing amount
      ];

      const errors = validateCSVData(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('amount');
    });

    it('should detect invalid amount format', () => {
      const data = [
        { date: '2024-01-15', description: 'Grocery Store', amount: 'invalid' },
      ];

      const errors = validateCSVData(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('amount');
    });

    it('should detect invalid date format', () => {
      const data = [
        { date: 'invalid-date', description: 'Grocery Store', amount: '1500' },
      ];

      const errors = validateCSVData(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('date');
    });

    it('should handle empty array', () => {
      const errors = validateCSVData([]);
      expect(errors).toHaveLength(0);
    });
  });
});

describe('Transaction Categorization', () => {
  it('should categorize grocery transactions', () => {
    const category = categorizeTransaction('BigBasket Grocery Purchase');
    expect(category).toBe('Groceries');
  });

  it('should categorize food delivery', () => {
    const category = categorizeTransaction('Swiggy Food Order');
    expect(category).toBe('Food & Dining');
  });

  it('should categorize travel', () => {
    const category = categorizeTransaction('Uber Cab Booking');
    expect(category).toBe('Travel');
  });

  it('should categorize utilities', () => {
    const category = categorizeTransaction('Electricity Bill Payment');
    expect(category).toBe('Utilities');
  });

  it('should categorize entertainment', () => {
    const category = categorizeTransaction('Netflix Subscription');
    expect(category).toBe('Entertainment');
  });

  it('should categorize shopping', () => {
    const category = categorizeTransaction('Amazon Purchase');
    expect(category).toBe('Shopping');
  });

  it('should categorize healthcare', () => {
    const category = categorizeTransaction('Medicine Purchase Pharmacy');
    expect(category).toBe('Healthcare');
  });

  it('should be case insensitive', () => {
    const category1 = categorizeTransaction('AMAZON PURCHASE');
    const category2 = categorizeTransaction('amazon purchase');
    expect(category1).toBe(category2);
  });

  it('should return Other for unknown transactions', () => {
    const category = categorizeTransaction('Xyz Unknown Transaction');
    expect(category).toBe('Other');
  });
});
