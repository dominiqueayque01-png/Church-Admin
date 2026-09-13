import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  ShieldCheck,
  FileBarChart,
  LogOut,
  Church,
} from 'lucide-react';
import './Layout.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: ShieldCheck, label: 'Users', path: '/users' },
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
];

type User = {
  id: string;
  name: string;
  role: string;
  username: string;
};

type Props = {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
};

export default function Layout({ children, currentUser, onLogout }: Props) {
  // Sidebar starts collapsed/minimized on login as requested
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogoutModal(false);
      }
    };
    if (showLogoutModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name[0]?.toUpperCase() ?? '?';
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { background: 'rgba(231, 76, 60, 0.2)', color: '#ff7675', border: '1px solid rgba(231, 76, 60, 0.35)' };
      case 'usher':
        return { background: 'rgba(39, 174, 96, 0.2)', color: '#55efc4', border: '1px solid rgba(39, 174, 96, 0.35)' };
      default:
        return { background: 'rgba(181, 151, 58, 0.2)', color: '#ffeaa7', border: '1px solid rgba(181, 151, 58, 0.35)' };
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="layout">
      {/* Sidebar - starts minimized */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar__top">
          {sidebarOpen && (
            <div className="sidebar__church" onClick={() => navigate('/dashboard')}>
              <div className="sidebar__church-emblem">
                <Church size={20} strokeWidth={2} />
              </div>
              <div className="sidebar__church-text">
                <p className="sidebar__church-name">Grace Sanctuary</p>
                <p className="sidebar__church-sub">Admin Portal</p>
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            className={`sidebar__toggle ${sidebarOpen ? 'sidebar__toggle--open' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <span className="sidebar__burger-line" />
            <span className="sidebar__burger-line" />
            <span className="sidebar__burger-line" />
          </button>
        </div>

        <div className="sidebar__divider" />

        {/* Navigation Items */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => navigate(item.path)}
                data-tooltip={item.label}
              >
                <span className="sidebar__nav-icon-wrap">
                  <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                </span>
                {sidebarOpen && (
                  <span className="sidebar__nav-label">{item.label}</span>
                )}
                {isActive && <span className="sidebar__active-pill" />}
              </button>
            );
          })}
        </nav>

        {/* Account Section */}
        <div className="sidebar__account">
          <div className="sidebar__account-divider" />
          {sidebarOpen ? (
            <>
              <div className="sidebar__profile">
                <div className="sidebar__avatar">
                  {getInitials(currentUser.name)}
                </div>
                <div className="sidebar__profile-info">
                  <p className="sidebar__profile-name">{currentUser.name}</p>
                  <p className="sidebar__profile-username">@{currentUser.username}</p>
                  <span
                    className="sidebar__role-badge"
                    style={getRoleBadgeStyle(currentUser.role)}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button className="sidebar__logout" onClick={handleLogoutClick}>
                <LogOut size={15} strokeWidth={2} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div
              className="sidebar__mini-avatar"
              onClick={handleLogoutClick}
              title={`Sign out (${currentUser.name})`}
            >
              {getInitials(currentUser.name)}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="layout__main">
        {/* Header */}
        <header className="layout__header">
          <div className="layout__header-left">
            <h1 className="layout__page-title">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="layout__header-right">
            <div className="layout__user-chip">
              <span className="layout__user-indicator" />
              <span className="layout__date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="layout__content">
          {children}
        </main>
      </div>

      {/* ── Sign Out Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          className="logout-modal__overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="logout-modal__icon-wrap">
              <LogOut size={26} className="logout-modal__icon" />
            </div>

            <h3 id="logout-modal-title" className="logout-modal__title">
              Sign Out Confirmation
            </h3>
            <p className="logout-modal__message">
              Are you sure you want to end your administration session,{' '}
              <strong className="logout-modal__username">{currentUser.name}</strong>?
            </p>

            <div className="logout-modal__actions">
              <button
                type="button"
                className="logout-modal__btn logout-modal__btn--cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-modal__btn logout-modal__btn--confirm"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
              >
                <LogOut size={15} />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}