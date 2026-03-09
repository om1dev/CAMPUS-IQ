import { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const role = localStorage.getItem("role");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    students: 1248,
    courses: 24,
    faculty: 56,
    attendance: 92.5
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-content">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          {trend && (
            <p className={`stat-card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ title, time, type }) => (
    <div className="activity-item">
      <div className={`activity-icon ${type}`}>
        {type === 'success' ? '✓' : type === 'warning' ? '!' : 'i'}
      </div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <p className="activity-time">{time}</p>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, color }) => (
    <button className="quick-action-btn">
      <div className="quick-action-content">
        <div className={`quick-action-icon ${color}`}>{icon}</div>
        <div>
          <p className="quick-action-title">{title}</p>
          <p className="quick-action-description">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-flex">
            <div>
              <h1 className="header-title">Campus IQ Dashboard</h1>
              <p className="header-subtitle">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="header-right">
              <div className="header-info hide-mobile">
                <p className="header-info-label">Role</p>
                <p className="header-info-value">{role || 'Guest'}</p>
              </div>
              <div className="header-info">
                <p className="header-info-label">Time</p>
                <p className="header-info-value">{currentTime.toLocaleTimeString()}</p>
              </div>
              <div className="user-avatar">
                {role ? role.charAt(0).toUpperCase() : 'G'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard 
            title="Total Students" 
            value={stats.students.toLocaleString()} 
            icon="👨‍🎓" 
            color="blue"
            trend={5.2}
          />
          <StatCard 
            title="Active Courses" 
            value={stats.courses} 
            icon="📚" 
            color="green"
            trend={2.1}
          />
          <StatCard 
            title="Faculty Members" 
            value={stats.faculty} 
            icon="👥" 
            color="purple"
            trend={-1.3}
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${stats.attendance}%`} 
            icon="📊" 
            color="orange"
            trend={3.8}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="main-grid">
          
          {/* Chart Section */}
          <div className="card">
            <h2 className="card-title">Performance Overview</h2>
            <div className="performance-bars">
              {[
                { label: 'Student Engagement', value: 85, color: 'blue' },
                { label: 'Course Completion', value: 72, color: 'green' },
                { label: 'Assignment Submission', value: 94, color: 'purple' },
                { label: 'Faculty Satisfaction', value: 88, color: 'orange' },
                { label: 'Resource Utilization', value: 76, color: 'pink' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="performance-item-header">
                    <span className="performance-label">{item.label}</span>
                    <span className="performance-value">{item.value}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="card-title">Recent Activity</h2>
            <div className="activity-list">
              <ActivityItem 
                title="New student registration" 
                time="5 minutes ago" 
                type="success"
              />
              <ActivityItem 
                title="Course materials updated" 
                time="15 minutes ago" 
                type="info"
              />
              <ActivityItem 
                title="Attendance below threshold" 
                time="1 hour ago" 
                type="warning"
              />
              <ActivityItem 
                title="Exam schedule published" 
                time="2 hours ago" 
                type="success"
              />
              <ActivityItem 
                title="New faculty member added" 
                time="3 hours ago" 
                type="success"
              />
              <ActivityItem 
                title="System maintenance scheduled" 
                time="5 hours ago" 
                type="info"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <QuickAction 
              title="Add Student" 
              description="Register new student" 
              icon="➕" 
              color="blue"
            />
            <QuickAction 
              title="Create Course" 
              description="Setup new course" 
              icon="📖" 
              color="green"
            />
            <QuickAction 
              title="View Reports" 
              description="Generate analytics" 
              icon="📈" 
              color="purple"
            />
            <QuickAction 
              title="Manage Users" 
              description="User administration" 
              icon="⚙️" 
              color="orange"
            />
          </div>
        </div>

        {/* Calendar and Announcements */}
        <div className="bottom-grid">
          
          {/* Upcoming Events */}
          <div className="card">
            <h2 className="card-title">📅 Upcoming Events</h2>
            <div className="events-list">
              {[
                { date: 'Feb 15', title: 'Mid-term Examinations Begin', color: 'red' },
                { date: 'Feb 18', title: 'Faculty Meeting', color: 'blue' },
                { date: 'Feb 20', title: 'Workshop: Modern Teaching Methods', color: 'green' },
                { date: 'Feb 25', title: 'Parent-Teacher Conference', color: 'purple' }
              ].map((event, index) => (
                <div key={index} className="event-item">
                  <div className="event-date">
                    <p className="event-month">Feb</p>
                    <p className="event-day">{event.date.split(' ')[1]}</p>
                  </div>
                  <div className="event-content">
                    <p className="event-title">{event.title}</p>
                    <span className={`event-badge ${event.color}`}>
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="card">
            <h2 className="card-title">📢 Announcements</h2>
            <div className="announcements-list">
              <div className="announcement-item yellow">
                <p className="announcement-title">Campus Safety Alert</p>
                <p className="announcement-text">New security protocols in effect from next week.</p>
                <p className="announcement-time">Posted today</p>
              </div>
              <div className="announcement-item blue">
                <p className="announcement-title">Library Hours Extended</p>
                <p className="announcement-text">Library will remain open until 10 PM during exam week.</p>
                <p className="announcement-time">Posted yesterday</p>
              </div>
              <div className="announcement-item green">
                <p className="announcement-title">New Online Learning Portal</p>
                <p className="announcement-text">Access the enhanced learning platform with new features.</p>
                <p className="announcement-time">Posted 2 days ago</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p className="footer-text">© 2026 Campus IQ. All rights reserved.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Help</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
