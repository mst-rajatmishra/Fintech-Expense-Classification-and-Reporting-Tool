import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService, authService } from '../services/api';
import { removeToken } from '../utils/auth';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30b0fe'];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await transactionService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await transactionService.uploadCSV(file);
      setMessage('File uploaded successfully!');
      setFile(null);
      setTimeout(() => {
        fetchDashboardData();
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await (format === 'csv' 
        ? transactionService.exportCSV() 
        : transactionService.exportPDF());

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      setMessage('Export failed');
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="navbar-content">
          <h1>💰 Expense Tracker</h1>
          <div className="navbar-right">
            {user && <span className="user-name">Hello, {user.name}</span>}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload Bank Statement</h2>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : 'Drag & drop CSV file here or click to select'}
            </label>
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-btn"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
        </section>

        {dashboardData && (
          <>
            {/* Summary Section */}
            <section className="summary-section">
              <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="total-amount">₹{dashboardData.totalExpenses?.toFixed(2) || '0.00'}</p>
              </div>
            </section>

            {/* Charts Section */}
            {Object.keys(dashboardData.byCategory || {}).length > 0 && (
              <section className="charts-section">
                <div className="chart-container">
                  <h3>Expenses by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardData.byCategory).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(dashboardData.byCategory).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3>Monthly Spending</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(dashboardData.byMonth || {}).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                      <Bar dataKey="value" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Category Breakdown */}
            {Object.keys(dashboardData.byCategory || {}).length > 0 && (
              <section className="category-section">
                <h3>Category Breakdown</h3>
                <div className="category-list">
                  {Object.entries(dashboardData.byCategory).map(([category, amount]) => (
                    <div key={category} className="category-item">
                      <span className="category-name">{category}</span>
                      <span className="category-amount">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Transactions */}
            {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 && (
              <section className="transactions-section">
                <h3>Recent Transactions</h3>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTransactions.slice(-5).reverse().map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>{t.description}</td>
                        <td><span className="badge">{t.category}</span></td>
                        <td className="amount">₹{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Export Section */}
            <section className="export-section">
              <h3>Export Data</h3>
              <div className="export-buttons">
                <button onClick={() => handleExport('csv')} className="export-btn csv">Export CSV</button>
                <button onClick={() => handleExport('pdf')} className="export-btn pdf">Export PDF</button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
