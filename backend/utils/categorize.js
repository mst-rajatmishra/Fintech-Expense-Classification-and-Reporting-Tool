const categorizeTransaction = (description) => {
  const desc = description.toLowerCase().trim();

  const categoryKeywords = {
    'Groceries': ['grocery', 'supermarket', 'fruit', 'vegetable', 'market', 'bigbasket', 'blinkit', 'dunzo'],
    'Food & Dining': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'dining', 'swiggy', 'zomato', 'biriyan', 'chai', 'coffee'],
    'Travel': ['uber', 'ola', 'taxi', 'metro', 'bus', 'flight', 'train', 'travel', 'booking', 'hotel'],
    'Utilities': ['electricity', 'water', 'gas', 'phone', 'internet', 'mobile'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'amazon', 'prime', 'spotify', 'gaming', 'game'],
    'Shopping': ['amazon', 'flipkart', 'store', 'mall', 'clothes', 'fashion', 'apparels'],
    'Healthcare': ['hospital', 'doctor', 'medicine', 'pharmacy', 'health', 'clinic', 'medical'],
    'Bills & Payments': ['bill', 'payment', 'subscription', 'fee'],
    'Transfer': ['transfer', 'sent', 'atm'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

module.exports = { categorizeTransaction };
