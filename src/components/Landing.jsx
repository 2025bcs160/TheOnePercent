import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [hoveredBroker, setHoveredBroker] = useState(null);
  const navigate = useNavigate();

  const brokers = [
    { name: "Exness", icon: "🔷", url: "https://www.exness.com" },
    { name: "IC Markets", icon: "📊", url: "https://www.icmarkets.com" },
    { name: "Pepperstone", icon: "🌊", url: "https://www.pepperstone.com" },
    { name: "FTMO", icon: "🔥", url: "https://ftmo.com" },
  ];

  const features = [
    {
      icon: "📈",
      title: "Advanced Trade Analytics",
      description: "Gain deep insights into your trading performance with detailed metrics.",
    },
    {
      icon: "💹",
      title: "Equity Curve Tracking",
      description: "Monitor your account balance growth over time to identify trends.",
    },
    {
      icon: "🛡️",
      title: "Risk Management Tools",
      description: "Analyze drawdowns, win rates, and optimize your risk-reward ratios.",
    },
    {
      icon: "🧠",
      title: "Smart Insights & Alerts",
      description: "Receive actionable insights to optimize your trading strategy.",
    },
  ];

  return (
    <div className="landing-page">
      {/* Header / Navigation */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TheOnePercent</span>
          </div>
          <nav className="landing-nav">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Trade Like the Top 1%</h1>
            <p className="hero-subtitle">
              Connect your broker and unlock powerful analytics to improve your trading performance.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" type="button" onClick={() => navigate("/analytics")}>Start Free Trial</button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate("/analytics")}>Connect Broker</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-label">Trading Dashboard</div>
              <div className="hero-card-chart">
                <div className="chart-bars">
                  <div className="bar" style={{ height: "40%" }}></div>
                  <div className="bar" style={{ height: "60%" }}></div>
                  <div className="bar" style={{ height: "50%" }}></div>
                  <div className="bar" style={{ height: "75%" }}></div>
                  <div className="bar" style={{ height: "85%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">20M+</div>
            <div className="stat-label">Trades Analyzed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5,500+</div>
            <div className="stat-label">Successful Traders</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Trading Focused</div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="landing-value-prop">
        <div className="value-content">
          <div className="value-text">
            <h2>
              85% of traders fail.
              <br />
              <span className="highlight">Be the 1% that succeed.</span>
            </h2>
            <p>Unlock the analytics that separate winners from the rest.</p>
            <button className="btn btn-primary" type="button" onClick={() => navigate("/analytics")}>Get Started Today</button>
          </div>
          <div className="value-visual">
            <div className="value-card">
              <div className="value-card-header">Trading spiedates</div>
              <div className="value-metrics">
                <div className="metric">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value">62.5%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Profit Factor</span>
                  <span className="metric-value">2.1</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Max Drawdown</span>
                  <span className="metric-value">-8.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Broker Integration */}
      <section className="landing-brokers">
        <div className="brokers-container">
          <h2>Connect Your Broker</h2>
          <p className="brokers-subtitle">Securely connect your trading account and view real-time analytics.</p>
          <div className="brokers-grid">
            {brokers.map((broker) => (
              <a
                key={broker.name}
                className="broker-card"
                href={broker.url}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setHoveredBroker(broker.name)}
                onMouseLeave={() => setHoveredBroker(null)}
              >
                <div className="broker-icon">{broker.icon}</div>
                <div className="broker-name">{broker.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="features-container">
          <div className="features-header">
            <h2>Exclusive Features for Serious Traders</h2>
            <p>Level up your trading performance</p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA */}
      <section className="landing-trial">
        <div className="trial-content">
          <h2>Start Your Free 30-Day Trial</h2>
          <p>No credit card required. Full access to premium analytics.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/analytics")}>Start Free Trial</button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="landing-trust">
        <div className="trust-content">
          <h2>
            See Why Traders Love <span className="highlight">TheOnePercent</span>
          </h2>
          <p className="trust-subtitle">Save 40% On Your First Month! Limited Time Offer</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/analytics")}>Start Trading Smarter</button>
          <div className="trust-partners">
            <p>Trusted by traders from:</p>
            <div className="partners-logos">
              <span>Funded Trader</span>
              <span>MTS</span>
              <span>FTMO</span>
              <span>ICL Markets</span>
            </div>
          </div>
        </div>
      </section>

      {/* Motivation Section */}
      <section className="landing-motivation">
        <h2>
          Join <span className="highlight">TheOnePercent</span> & Elevate Your Trading Journey
        </h2>
        <p className="motivation-subtitle">Advanced analytics, real-time insights, and the tools to succeed.</p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span>TheOnePercent</span>
            </div>
            <p className="footer-tagline">Trading analytics for the top 1%</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#dashboard">Dashboard</a>
              <a href="#analytics">Analytics</a>
              <a href="#settings">Settings</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 TheOnePercent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
