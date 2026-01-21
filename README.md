# Fintech Expense Classification and Reporting Tool

A comprehensive full-stack web application for automatic expense categorization, visualization, and reporting. Upload your bank statements as CSV files and get instant insights into your spending patterns.

## Features

- **Secure Authentication**: Sign up and login with JWT-based authentication
- **CSV File Upload**: Drag-and-drop interface for bank statement uploads
- **Auto-Categorization**: Intelligent keyword-based transaction categorization
- **Interactive Dashboard**: Real-time charts and spending visualizations
- **Data Export**: Download categorized data as CSV or PDF reports
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Data Privacy**: User-specific data isolation and secure encryption
- **Error Handling**: Comprehensive validation and meaningful error messages

## Project Structure

```
fintech-expense-tool/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models (User, Transaction, Upload, Category)
│   ├── controllers/        # Business logic (auth, transactions)
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, CORS, etc.
│   ├── utils/              # Helpers (CSV parsing, categorization, PDF)
│   ├── tests/              # Unit and integration tests
│   ├── server.js           # Express app entry point
│   ├── package.json        # Dependencies
│   └── .env.example        # Environment template
├── frontend/                # React.js web application
│   ├── src/
│   │   ├── pages/          # Auth, Dashboard, Home pages
│   │   ├── components/     # Reusable components (PrivateRoute)
│   │   ├── services/       # API client (axios)
│   │   ├── utils/          # Helpers (auth tokens)
│   │   ├── App.js          # Main app component
│   │   └── index.js        # React DOM entry
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── docs/                    # Documentation
│   ├── README.md           # Comprehensive guide
│   └── SELF_ASSESSMENT.md  # Project evaluation
├── docker-compose.yml      # Multi-container setup
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+ (or use Docker)
- Git

### Option 1: Docker (Recommended)

```bash
# Install Docker and Docker Compose, then:
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost, DB_USER=postgres, etc.

npm run dev    # Runs on http://localhost:5000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start      # Runs on http://localhost:3000
```

#### PostgreSQL Setup
```bash
# Create database
createdb fintech_expense

# Tables are auto-created by Sequelize on first run
```

## Sample CSV Format

Create a file named `sample.csv`:

```csv
date,description,amount,paymentMethod,remarks
2024-01-15,BigBasket Grocery Purchase,1500,Debit Card,Weekly groceries
2024-01-16,Swiggy Food Order,350,UPI,Lunch delivery
2024-01-17,NTPC Electricity Bill,1200,Net Banking,Monthly bill
2024-01-18,Uber Ride,250,Wallet,Office commute
2024-01-19,Amazon.in Electronics,3500,Credit Card,Laptop accessories
2024-01-20,Dominos Pizza,450,UPI,Dinner
2024-01-21,Netflix Subscription,199,Debit Card,Monthly plan
2024-01-22,PharmEasy Medicines,350,Online Banking,Medications
```

## Authentication

### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response includes JWT token for authenticated requests.

## API Endpoints

### Transactions
- `POST /api/transactions/upload` - Upload CSV file
- `GET /api/transactions/transactions` - Get user transactions
- `GET /api/transactions/dashboard` - Get dashboard summary
- `GET /api/transactions/export/csv` - Export as CSV
- `GET /api/transactions/export/pdf` - Export as PDF

All endpoints (except signup/login) require `Authorization: Bearer <token>` header.

## Testing

### Run Tests
```bash
cd backend
npm test
```

### Manual Testing
1. Navigate to http://localhost:3000
2. Sign up with test credentials
3. Upload the sample CSV file
4. View categorized transactions
5. Check charts and summaries
6. Export as CSV/PDF

## Dashboard Features

- **Total Expenses**: Summary of all spending
- **Category Breakdown**: Pie chart showing expenses by category
- **Monthly Spending**: Bar chart showing trends over time
- **Recent Transactions**: Table with latest 5 transactions
- **Export Options**: Download as CSV or PDF report

## 🏷️ Expense Categories

Transactions are automatically categorized into:
- 🛒 Groceries
- 🍔 Food & Dining
- 🚗 Travel
- 💡 Utilities
- 🎬 Entertainment
- 🛍️ Shopping
- 🏥 Healthcare
- 📱 Bills & Payments
- 💸 Transfer

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication (7-day expiration)
- CORS protection with Helmet
- SQL injection prevention via Sequelize ORM
- Input validation on all endpoints
- File upload validation (size, type)
- User data isolation

## Documentation

See [docs/README.md](docs/README.md) for:
- Detailed architecture diagram
- Database schema
- API specifications
- Edge cases handled
- Deployment guide
- Troubleshooting

See [docs/SELF_ASSESSMENT.md](docs/SELF_ASSESSMENT.md) for:
- Design decisions and trade-offs
- What worked well
- Areas for improvement
- Difficulties faced and solutions
- Testing conducted
- Recommended next steps

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or create database
createdb fintech_expense
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check backend is running: http://localhost:5000/api/health
- Check browser console for errors

## Deployment

### Deploy Backend
```bash
# Using Railway/Render/Heroku
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Deploy Frontend
```bash
# Using Vercel
npm install -g vercel
vercel --prod
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fintech_expense
DB_PORT=5432
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Use Cases

1. **Personal Finance Management**: Track daily expenses
2. **Family Budgeting**: Monitor family spending
3. **Tax Documentation**: Export data for filing
4. **Expense Analysis**: Identify spending patterns
5. **Budget Planning**: Set and track budgets

## Future Enhancements

- [ ] User-defined custom categories
- [ ] Budget tracking with alerts
- [ ] Recurring transaction detection
- [ ] Advanced analytics and trends
- [ ] Mobile app (React Native)
- [ ] Banking API integration
- [ ] Receipt scanning with OCR
- [ ] Multi-user accounts
- [ ] Data encryption at rest

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Check documentation in `/docs` folder
- Review troubleshooting section above

## Acknowledgments

- React.js team for amazing frontend framework
- Sequelize for elegant ORM
- Recharts for beautiful charts
- All open-source contributors

---

