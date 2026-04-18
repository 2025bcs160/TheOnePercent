import { useState } from "react";
import { Home, FileText, BarChart3, Calculator, Settings, ChevronLeft, LogOut, TrendingUp, BookOpen, Zap, MessageCircle } from "lucide-react";

export default function Sidebar({ page, setPage, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { label: "Dashboard", key: "Dashboard", icon: Home },
    { label: "Journal", key: "Journal", icon: FileText },
    { label: "Analytics", key: "Analytics", icon: BarChart3 },
    { label: "Calculator", key: "Calculator", icon: Calculator },
    { label: "Settings", key: "Settings", icon: Settings },
    { label: "Backtesting", key: "Backtesting", icon: TrendingUp },
    { label: "University", key: "University", icon: BookOpen },
    { label: "Signals", key: "Signals", icon: Zap },
    { label: "Community", key: "Community", icon: MessageCircle },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="brand-block">
          <div className="brand-icon">1%</div>
          {!collapsed && (
            <div>
              <p className="brand-name">TheOnePercent</p>
              <p className="brand-tag">Trade like the top 1%</p>
            </div>
          )}
        </div>
        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          type="button"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="nav-group">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => setPage(item.key)}
              title={item.label}
            >
              <Icon size={20} className="nav-icon" />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {!collapsed && (
          <div>
            <p className="sidebar-user">{user?.name}</p>
            <p className="sidebar-role">Premium trader</p>
          </div>
        )}
        <button className="logout-button" onClick={onLogout} type="button" title="Sign Out">
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}