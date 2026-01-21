# Fintech Expense Classification and Reporting Tool - Project Files Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Root Files](#root-files)
3. [Backend Files](#backend-files)
4. [Frontend Files](#frontend-files)
5. [Data Flow](#data-flow)
6. [Architecture Overview](#architecture-overview)

---

## Project Overview

This is a full-stack web application for automatic expense categorization, visualization, and reporting. It allows users to upload bank statements in CSV format, automatically categorize transactions, view spending analytics through interactive dashboards, and export reports in CSV or PDF formats.

**Tech Stack:**
- **Backend:** Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend:** React.js, React Router, Recharts
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Docker Compose support

---

## Root Files

### 1. `package.json`
**Purpose:** Root-level package configuration for managing the monorepo.

**Key Features:**
- Defines scripts for installing dependencies across frontend and backend
- Scripts for running development and production modes
- Docker compose commands for containerized deployment
- Uses `concurrently` to run both frontend and backend simultaneously

**Key Scripts:**
- `install:all` - Installs dependencies for both frontend and backend
- `start:dev` - Runs both servers in development mode
- `docker:up` - Starts all services using Docker Compose

---

### 2. `docker-compose.yml`
**Purpose:** Orchestrates multi-container Docker application setup.

**Services Defined:**
1. **postgres:** PostgreSQL 15 database
   - Port: 5432
   - Includes health checks to ensure database is ready
   - Uses persistent volume for data storage

2. **backend:** Node.js Express server
   - Port: 5000
   - Waits for postgres to be healthy before starting
   - Environment variables configured for database connection
   - Auto-reloads using nodemon in development

3. **frontend:** React development server
   - Port: 3000
   - Configured to communicate with backend API
   - Hot-reload enabled for development

---

### 3. `README.md`
**Purpose:** Project documentation and user guide.

**Contents:**
- Feature overview
- Installation instructions (Docker & local)
- API endpoint documentation
- Sample CSV format
- Deployment guides
- Troubleshooting tips
- Environment variable configuration

---

### 4. `.gitignore`
**Purpose:** Specifies files and directories to exclude from version control.

**Key Exclusions:**
- Environment files (.env)
- Dependencies (node_modules)
- Build outputs (dist, build)
- Uploaded files (uploads/, reports/)
- Log files
- OS-specific files

---

## Backend Files

### Configuration

#### `backend/config/database.js`
**Purpose:** Database connection and initialization.

**Functionality:**
- Creates Sequelize instance with PostgreSQL configuration
- Reads database credentials from environment variables
- Configures connection pooling (max 5 connections)
- `connectDB()` function:
  - Authenticates database connection
  - Syncs database schema (creates/updates tables)
  - Implements retry logic with 5-second delay on failure
  - Disables SQL query logging for cleaner output

**Key Configuration:**
- Pool settings: max 5 connections, acquire timeout 30s, idle timeout 10s
- Auto-sync with `{ alter: true }` - updates schema without data loss

---

### Models (Database Schema)

#### `backend/models/User.js`
**Purpose:** User account model.

**Fields:**
- `id` (UUID, Primary Key) - Unique user identifier
- `name` (String, Required) - User's full name
- `email` (String, Required, Unique) - Login email
- `password` (String, Required) - Hashed password
- `createdAt` (Date) - Registration timestamp

**Relationships:**
- Has many Transactions
- Has many Uploads
- Has many Categories

---

#### `backend/models/Transaction.js`
**Purpose:** Individual expense transaction model.

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key) - Owner of transaction
- `uploadId` (UUID) - Reference to upload batch
- `date` (Date, Required) - Transaction date
- `description` (Text, Required) - Transaction description
- `amount` (Decimal 12,2, Required) - Transaction amount
- `category` (String, Default: 'Other') - Auto-assigned category
- `paymentMethod` (String, Optional) - Payment type
- `remarks` (Text, Optional) - Additional notes

**Relationships:**
- Belongs to User

---

#### `backend/models/Upload.js`
**Purpose:** Tracks CSV file upload history.

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key) - File uploader
- `fileName` (String, Required) - Original file name
- `filePath` (String) - Stored file path
- `transactionCount` (Integer) - Number of transactions processed
- `status` (String) - 'processing', 'success', or 'failed'
- `errorMessage` (Text) - Error details if failed
- `uploadedAt` (Date) - Upload timestamp

**Validation:**
- Status must be one of: ['success', 'failed', 'processing']

---

#### `backend/models/Category.js`
**Purpose:** User-defined custom categories (currently pre-defined).

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `name` (String, Required) - Category name
- `keywords` (Array of Strings) - Keywords for classification
- `color` (String) - Hex color code for visualization

**Note:** Currently, categories are hardcoded in categorize.js, but this model allows for future user customization.

---

### Controllers (Business Logic)

#### `backend/controllers/authController.js`
**Purpose:** Authentication and user management logic.

**Functions:**

1. **`signup(req, res)`**
   - Validates required fields (name, email, password)
   - Checks if email already exists
   - Hashes password using bcrypt (10 salt rounds)
   - Creates user in database
   - Generates JWT token with user id and email
   - Returns user info and token

2. **`login(req, res)`**
   - Validates credentials
   - Finds user by email
   - Compares password hash using bcrypt
   - Generates JWT token on success
   - Returns user info and token

3. **`logout(req, res)`**
   - Simple confirmation response
   - Token invalidation handled client-side

4. **`getUserProfile(req, res)`**
   - Fetches user details by ID from JWT
   - Returns user information (id, name, email)

---

#### `backend/controllers/transactionController.js`
**Purpose:** Transaction management and file processing.

**Functions:**

1. **`uploadCSV(req, res)`**
   - Validates file upload
   - Generates unique filename with userId_uploadId format
   - Creates uploads directory if missing
   - Saves file to server
   - Creates Upload record with 'processing' status
   - Parses CSV using csvParser utility
   - Validates CSV data format
   - Creates Transaction records for each row
   - Auto-categorizes each transaction
   - Updates Upload status to 'success' or 'failed'
   - Returns upload summary

2. **`getTransactions(req, res)`**
   - Supports filtering by:
     - Date range (startDate, endDate)
     - Category
   - Returns user's transactions ordered by date DESC

3. **`getDashboardData(req, res)`**
   - Fetches all user transactions
   - Calculates:
     - Total expenses (sum of amounts)
     - Expenses by category (grouped)
     - Expenses by month (grouped by YYYY-MM)
     - Recent 10 transactions
   - Returns empty data structure if no transactions

4. **`exportCSV(req, res)`**
   - Fetches all user transactions
   - Generates CSV format with headers
   - Sets proper Content-Type and Content-Disposition headers
   - Returns CSV file for download

5. **`exportPDF(req, res)`**
   - Fetches all user transactions
   - Calls PDF generator utility
   - Returns PDF file for download
   - Deletes temporary file after download

---

### Middleware

#### `backend/middleware/authenticateToken.js`
**Purpose:** JWT authentication middleware.

**Functionality:**
- Extracts token from Authorization header (Bearer token)
- Returns 401 if no token provided
- Verifies token signature using JWT_SECRET
- Returns 403 if token invalid or expired
- Attaches decoded user data to req.user
- Calls next() to continue to route handler

**Usage:** Applied to all protected routes (transactions, profile, etc.)

---

### Routes (API Endpoints)

#### `backend/routes/authRoutes.js`
**Purpose:** Authentication endpoint definitions.

**Endpoints:**
- `POST /api/auth/signup` - User registration (public)
- `POST /api/auth/login` - User login (public)
- `POST /api/auth/logout` - Logout confirmation (protected)
- `GET /api/auth/profile` - Get user profile (protected)

---

#### `backend/routes/transactionRoutes.js`
**Purpose:** Transaction and file upload endpoints.

**Endpoints:**
- `POST /api/transactions/upload` - Upload CSV file (protected)
- `GET /api/transactions/transactions` - Get transactions with filters (protected)
- `GET /api/transactions/dashboard` - Get dashboard analytics (protected)
- `GET /api/transactions/export/csv` - Export as CSV (protected)
- `GET /api/transactions/export/pdf` - Export as PDF (protected)

---

### Utilities

#### `backend/utils/csvParser.js`
**Purpose:** CSV file parsing and validation.

**Functions:**

1. **`parseCSV(filePath)`**
   - Returns a Promise
   - Uses csv-parser library
   - Creates read stream from file
   - Parses CSV rows into JavaScript objects
   - Resolves with array of parsed rows
   - Rejects on parsing errors

2. **`validateCSVData(data)`**
   - Validates required fields: date, description, amount
   - Checks amount is numeric
   - Validates date format
   - Returns array of error messages
   - Empty array if validation passes

**Required CSV Fields:**
- `date` - Must be valid date format
- `description` - Transaction description
- `amount` - Must be numeric

---

#### `backend/utils/categorize.js`
**Purpose:** Automatic transaction categorization.

**Function:**

**`categorizeTransaction(description)`**
- Converts description to lowercase
- Matches against keyword dictionaries
- Returns first matching category
- Returns 'Other' if no match

**Categories & Keywords:**
- **Groceries:** grocery, supermarket, bigbasket, blinkit, dunzo
- **Food & Dining:** restaurant, pizza, food, swiggy, zomato
- **Travel:** uber, ola, taxi, metro, flight, train, hotel
- **Utilities:** electricity, water, gas, phone, internet
- **Entertainment:** movie, netflix, amazon prime, spotify, gaming
- **Shopping:** amazon, flipkart, store, clothes, fashion
- **Healthcare:** hospital, doctor, medicine, pharmacy, clinic
- **Bills & Payments:** bill, payment, subscription, fee
- **Transfer:** transfer, sent, atm

**Logic:** First keyword match wins, case-insensitive matching

---

#### `backend/utils/pdfGenerator.js`
**Purpose:** Generate PDF expense reports.

**Function:**

**`generatePDFReport(transactions, fileName)`**
- Returns Promise with file path
- Uses PDFKit library
- Creates PDF document with:
  - **Title:** "Expense Report" with generation date
  - **Summary Section:**
    - Total expenses
    - Total transaction count
  - **Category Breakdown:**
    - Amount spent per category
  - **Transactions Table:**
    - Columns: Date, Description, Category, Amount
    - Handles pagination (new page after 750px)
    - Truncates descriptions to 30 characters
- Saves to `./reports/` directory
- Returns file path on completion

---

### Tests

#### `backend/tests/utils.test.js`
**Purpose:** Unit tests for utility functions.

**Test Suites:**

1. **CSV Parser Tests:**
   - Validates correct CSV data
   - Detects missing required fields
   - Detects invalid amount format
   - Detects invalid date format
   - Handles empty arrays

2. **Transaction Categorization Tests:**
   - Tests all category types
   - Verifies case insensitivity
   - Tests fallback to 'Other' category
   - Validates keyword matching accuracy

**Framework:** Jest with expect assertions

---

### Server Entry Point

#### `backend/server.js`
**Purpose:** Express application setup and initialization.

**Functionality:**
1. **Environment Setup:**
   - Loads .env variables
   - Imports dependencies

2. **Middleware Configuration:**
   - Helmet for security headers
   - CORS with configurable origin
   - JSON body parser (50mb limit)
   - URL-encoded parser (50mb limit)
   - Express file upload

3. **Database:**
   - Calls connectDB() to initialize connection
   - Imports all models

4. **Routes:**
   - `/api/auth/*` - Authentication routes
   - `/api/transactions/*` - Transaction routes
   - `/api/health` - Health check endpoint

5. **Error Handling:**
   - 404 handler for unknown routes
   - Global error middleware
   - Detailed errors in development mode

6. **Server Start:**
   - Listens on PORT from env (default 5000)
   - Logs server startup

---

### Configuration Files

#### `backend/.env.example`
**Purpose:** Template for environment variables.

**Variables:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port (default: 5432)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration (default: 7d)

---

#### `backend/package.json`
**Purpose:** Backend dependencies and scripts.

**Key Dependencies:**
- **express** - Web framework
- **sequelize** - ORM for PostgreSQL
- **pg** - PostgreSQL driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **csv-parser** - CSV file parsing
- **pdfkit** - PDF generation
- **helmet** - Security headers
- **cors** - CORS handling
- **express-fileupload** - File upload middleware
- **dotenv** - Environment variables

**Scripts:**
- `start` - Production server
- `dev` - Development with nodemon
- `test` - Run Jest tests

---

## Frontend Files

### Entry Points

#### `frontend/src/index.js`
**Purpose:** React application entry point.

**Functionality:**
- Imports React and ReactDOM
- Creates root element
- Renders App component in StrictMode
- Mounts to #root div in index.html

---

#### `frontend/src/App.js`
**Purpose:** Main application component with routing.

**Functionality:**
- Sets up React Router
- Defines application routes:
  - `/` - Home page (public)
  - `/login` - Login page (public)
  - `/signup` - Signup page (public)
  - `/dashboard` - Dashboard page (protected)
- Uses PrivateRoute component for protected routes
- Imports and applies global styles from App.css

---

#### `frontend/public/index.html`
**Purpose:** HTML template for React app.

**Contents:**
- Meta tags for responsive design
- Theme color configuration
- SEO description
- Title: "Expense Tracker"
- Root div for React mounting
- NoScript warning

---

### Components

#### `frontend/src/components/PrivateRoute.js`
**Purpose:** Route protection for authenticated users.

**Functionality:**
- Checks authentication status using isAuthenticated()
- Renders children if authenticated
- Redirects to /login if not authenticated
- Uses React Router's Navigate component

**Usage:** Wraps protected routes like Dashboard

---

### Pages

#### `frontend/src/pages/Home.js`
**Purpose:** Landing page for non-authenticated users.

**Sections:**

1. **Hero Section:**
   - App title and tagline
   - Login and Signup buttons
   - Navigation to auth pages

2. **Features Grid:**
   - **Easy CSV Upload** - Drag-and-drop interface
   - **Auto-Categorization** - Intelligent transaction sorting
   - **Interactive Dashboards** - Charts and visualizations
   - **Export Reports** - CSV and PDF downloads
   - **Secure Authentication** - JWT protection
   - **Responsive Design** - Mobile-friendly

**Styling:** Uses Home.css for layout and design

---

#### `frontend/src/pages/Auth.js`
**Purpose:** Login and Signup page components.

**Components:**

1. **Login Component:**
   - Email and password form
   - Form validation (required fields)
   - Calls authService.login()
   - Saves JWT token on success
   - Redirects to dashboard
   - Displays error messages
   - Loading state during submission
   - Link to signup page

2. **Signup Component:**
   - Name, email, and password form
   - Form validation
   - Calls authService.signup()
   - Saves JWT token on success
   - Redirects to dashboard
   - Error handling with detailed messages
   - Loading state
   - Link to login page

**State Management:**
- Form field states (name, email, password)
- Error message state
- Loading state for async operations

**Styling:** Uses Auth.css

---

#### `frontend/src/pages/Dashboard.js`
**Purpose:** Main application dashboard (protected route).

**State Variables:**
- `dashboardData` - Analytics and transaction data
- `file` - Selected CSV file
- `uploading` - Upload progress state
- `message` - User feedback messages
- `loading` - Initial data loading state
- `user` - Current user profile
- `dragActive` - Drag-and-drop UI state

**Sections:**

1. **Navigation Bar:**
   - App logo/title
   - User greeting (name)
   - Logout button

2. **Upload Section:**
   - Drag-and-drop zone for CSV files
   - File input (hidden, triggered by click)
   - Upload button (disabled when no file)
   - Status messages (success/error)
   - Visual feedback for drag events

3. **Summary Section:**
   - Total expenses card
   - Formatted currency display (₹)

4. **Charts Section:**
   - **Pie Chart:** Expenses by category
     - Shows category names and amounts
     - Color-coded segments
     - Interactive tooltips
   - **Bar Chart:** Monthly spending trends
     - X-axis: Month (YYYY-MM)
     - Y-axis: Amount
     - Tooltip with formatted amounts

5. **Category Breakdown:**
   - List view of all categories
   - Shows category name and total amount
   - Sorted display

6. **Recent Transactions Table:**
   - Displays last 5 transactions
   - Columns: Date, Description, Category, Amount
   - Formatted dates and currency
   - Category badges

7. **Export Section:**
   - CSV export button
   - PDF export button
   - Triggers file download

**Functions:**

- `fetchDashboardData()` - Loads analytics from API
- `fetchUserProfile()` - Gets current user info
- `handleDrag(e)` - Manages drag-and-drop states
- `handleDrop(e)` - Handles file drop
- `handleFileChange(e)` - Handles file input change
- `handleUpload()` - Uploads CSV to backend
- `handleExport(format)` - Downloads CSV/PDF reports
- `handleLogout()` - Clears token and redirects

**Visualizations:** Uses Recharts library
- PieChart with custom colors
- BarChart with grid and tooltips
- Responsive containers

---

### Services

#### `frontend/src/services/api.js`
**Purpose:** Centralized API communication layer.

**Configuration:**
- Base URL from environment variable or localhost:5000
- Axios instance with JSON content-type
- Request interceptor: Adds JWT token to headers
- Response interceptor: Logs errors

**Services:**

1. **authService:**
   - `signup(name, email, password)` - User registration
   - `login(email, password)` - User authentication
   - `logout()` - Logout confirmation
   - `getProfile()` - Fetch user profile

2. **transactionService:**
   - `uploadCSV(file)` - Upload CSV with FormData
   - `getTransactions(filters)` - Fetch filtered transactions
   - `getDashboard()` - Fetch dashboard analytics
   - `exportCSV()` - Download CSV (blob response)
   - `exportPDF()` - Download PDF (blob response)

**Features:**
- Automatic token injection
- Error handling with console logging
- Multipart/form-data for file uploads
- Blob response handling for downloads

---

### Utilities

#### `frontend/src/utils/auth.js`
**Purpose:** Authentication token management.

**Functions:**

1. **`saveToken(token)`**
   - Stores JWT in localStorage
   - Key: 'token'

2. **`getToken()`**
   - Retrieves JWT from localStorage
   - Returns token string or null

3. **`removeToken()`**
   - Removes JWT from localStorage
   - Called on logout

4. **`isAuthenticated()`**
   - Checks if token exists
   - Returns boolean
   - Used by PrivateRoute

**Storage:** Uses browser's localStorage API

---

### Configuration Files

#### `frontend/package.json`
**Purpose:** Frontend dependencies and build configuration.

**Key Dependencies:**
- **react** - UI library (v18.2.0)
- **react-dom** - React rendering
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **recharts** - Chart library
- **react-dropzone** - Drag-and-drop files
- **react-icons** - Icon components
- **react-scripts** - Build tooling

**Scripts:**
- `start` - Development server
- `build` - Production build
- `test` - Run tests
- `eject` - Eject from Create React App

**Proxy:** Configured to proxy API requests to localhost:5000

---

## Data Flow

### 1. User Registration/Login Flow
```
User fills form → Auth.js
  ↓
authService.signup/login() → api.js
  ↓
POST /api/auth/signup or /api/auth/login → authRoutes.js
  ↓
authController.signup/login() → authController.js
  ↓
- Validate credentials
- Hash password (signup only)
- Check database → User model
- Generate JWT token
  ↓
Return { token, user } → Frontend
  ↓
saveToken() stores in localStorage → auth.js
  ↓
Redirect to /dashboard
```

### 2. CSV Upload Flow
```
User selects/drops CSV file → Dashboard.js
  ↓
handleUpload() → transactionService.uploadCSV()
  ↓
POST /api/transactions/upload → transactionRoutes.js
  ↓
uploadCSV() controller → transactionController.js
  ↓
1. Save file to uploads/ directory
2. Create Upload record (status: processing)
3. parseCSV() reads file → csvParser.js
4. validateCSVData() checks format
5. For each row:
   - categorizeTransaction() → categorize.js
   - Create Transaction record → Transaction model
6. Update Upload status to 'success'
  ↓
Return upload summary → Frontend
  ↓
Refresh dashboard data
```

### 3. Dashboard Data Flow
```
Dashboard loads → useEffect()
  ↓
fetchDashboardData() → transactionService.getDashboard()
  ↓
GET /api/transactions/dashboard → transactionRoutes.js
  ↓
getDashboardData() controller → transactionController.js
  ↓
Query all user transactions → Transaction model
  ↓
Calculate:
- Total expenses (sum)
- By category (grouping)
- By month (grouping)
- Recent transactions (last 10)
  ↓
Return dashboard data → Frontend
  ↓
Update dashboardData state
  ↓
Recharts renders:
- PieChart (by category)
- BarChart (by month)
- Table (recent transactions)
```

### 4. Export Flow
```
User clicks Export CSV/PDF → Dashboard.js
  ↓
handleExport(format) → transactionService.exportCSV/PDF()
  ↓
GET /api/transactions/export/csv or /pdf → transactionRoutes.js
  ↓
exportCSV() or exportPDF() controller
  ↓
Query user transactions → Transaction model
  ↓
CSV: Format as CSV string
PDF: generatePDFReport() → pdfGenerator.js
  ↓
Return file (blob) → Frontend
  ↓
Create download link
Trigger browser download
```

---

## Architecture Overview

### Application Layers

```
┌─────────────────────────────────────────┐
│          Frontend (React)               │
│  ┌─────────────────────────────────┐   │
│  │  Pages: Home, Auth, Dashboard   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Services: API Client (Axios)   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Utils: Auth, Components        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓ HTTP/REST
┌─────────────────────────────────────────┐
│       Backend (Express/Node.js)         │
│  ┌─────────────────────────────────┐   │
│  │  Routes: Auth, Transactions     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Middleware: Auth, CORS, etc    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Controllers: Business Logic    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Utils: CSV, PDF, Categorize    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓ Sequelize ORM
┌─────────────────────────────────────────┐
│      Database (PostgreSQL)              │
│  ┌─────────────────────────────────┐   │
│  │  Tables: users, transactions,   │   │
│  │  uploads, categories            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Security Features

1. **Authentication:**
   - JWT tokens with 7-day expiration
   - bcrypt password hashing (10 rounds)
   - Token verification middleware

2. **Authorization:**
   - User-specific data isolation
   - All sensitive endpoints require authentication

3. **Input Validation:**
   - Required field validation
   - Format validation (dates, amounts)
   - File type validation

4. **Security Headers:**
   - Helmet middleware for HTTP headers
   - CORS configuration
   - Content-Type restrictions

5. **Data Protection:**
   - SQL injection prevention via Sequelize ORM
   - No raw SQL queries
   - Parameterized queries

### File Processing Pipeline

```
CSV Upload
   ↓
File Validation
   ↓
Save to uploads/
   ↓
Create Upload Record
   ↓
Parse CSV → Array of Objects
   ↓
Validate Data Format
   ↓
For Each Row:
   ↓
Categorize Transaction
   ↓
Create Transaction Record
   ↓
Update Upload Status
   ↓
Return Success/Error
```

### Database Schema Relationships

```
User (1) ──────→ (Many) Transaction
  │
  ├─────────→ (Many) Upload
  │
  └─────────→ (Many) Category

Upload (1) ──────→ (Many) Transaction
```

---

## Key Features Summary

1. **User Management:**
   - Signup with email validation
   - Login with credential verification
   - JWT-based session management
   - User profile access

2. **File Processing:**
   - CSV upload with drag-and-drop
   - Real-time parsing and validation
   - Batch transaction creation
   - Upload history tracking

3. **Auto-Categorization:**
   - Keyword-based classification
   - 9 predefined categories
   - Case-insensitive matching
   - Fallback to 'Other' category

4. **Data Visualization:**
   - Pie chart for category distribution
   - Bar chart for monthly trends
   - Summary cards for totals
   - Recent transactions table

5. **Export Functionality:**
   - CSV export with formatted data
   - PDF reports with charts and tables
   - Browser-triggered downloads
   - Temporary file cleanup

6. **Responsive Design:**
   - Mobile-friendly layouts
   - Adaptive charts
   - Touch-friendly interfaces
   - Cross-browser compatibility

---

## Development Workflow

1. **Setup:**
   ```bash
   npm run install:all  # Install all dependencies
   ```

2. **Development:**
   ```bash
   npm run start:dev    # Run both servers
   # OR
   docker-compose up    # Run with Docker
   ```

3. **Testing:**
   ```bash
   cd backend && npm test
   ```

4. **Building:**
   ```bash
   npm run build        # Build frontend for production
   ```

---

## Environment Setup

1. **Backend (.env):**
   - Copy from .env.example
   - Set database credentials
   - Configure JWT secret
   - Set CORS origin

2. **Frontend:**
   - Set REACT_APP_API_URL for API endpoint

3. **Database:**
   - Create PostgreSQL database
   - Tables auto-created by Sequelize

---

## Troubleshooting Guide

1. **Database Connection Issues:**
   - Check PostgreSQL is running
   - Verify credentials in .env
   - Check port availability (5432)

2. **Authentication Errors:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear localStorage and re-login

3. **File Upload Failures:**
   - Check CSV format matches template
   - Verify uploads/ directory permissions
   - Check file size limits (50mb)

4. **Chart Not Rendering:**
   - Ensure transactions exist
   - Check console for errors
   - Verify Recharts installation

---

## Future Enhancements

1. Custom category creation
2. Budget tracking and alerts
3. Recurring transaction detection
4. Advanced filtering and search
5. Data encryption at rest
6. Multi-currency support
7. Receipt OCR scanning
8. Mobile app version
9. Banking API integration
10. Export scheduling

---

## Conclusion

This application demonstrates a complete full-stack development approach with:
- Clean separation of concerns
- RESTful API design
- Secure authentication
- Responsive user interface
- Automated testing
- Docker deployment support
- Comprehensive error handling

Each file plays a specific role in the overall architecture, working together to provide a seamless expense tracking and reporting experience.
