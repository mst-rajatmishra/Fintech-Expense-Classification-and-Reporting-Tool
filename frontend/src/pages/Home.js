import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-content">
          <h1>💰 Smart Expense Tracker</h1>
          <p>Categorize, analyze, and manage your spending effortlessly</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/login')} className="btn btn-primary">Login</button>
            <button onClick={() => navigate('/signup')} className="btn btn-secondary">Sign Up</button>
          </div>
        </div>
      </header>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📤 Easy CSV Upload</h3>
            <p>Upload your bank statements as CSV files with drag-and-drop support.</p>
          </div>
          <div className="feature-card">
            <h3>🏷️ Auto-Categorization</h3>
            <p>Transactions are automatically categorized based on descriptions.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Interactive Dashboards</h3>
            <p>Visualize spending patterns with charts and interactive dashboards.</p>
          </div>
          <div className="feature-card">
            <h3>📥 Export Reports</h3>
            <p>Export your data as CSV or PDF for offline analysis.</p>
          </div>
          <div className="feature-card">
            <h3>🔐 Secure Authentication</h3>
            <p>Your data is protected with JWT-based secure authentication.</p>
          </div>
          <div className="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Works seamlessly on desktop, tablet, and mobile devices.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
