import { useState, useEffect, useRef } from 'react';
import {
  Users,
  ShieldCheck,
  HandHelping,
  Activity,
  Search,
  MoreVertical,
  CheckCircle2,
  UserPlus,
  ShieldAlert,
  Plus,
  ArrowUp,
  ArrowDown,
  KeyRound,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import './Users.css';

// ── TYPES ──────────────────────────────────────────────────

type UserRole = 'admin' | 'usher';
type UserStatus = 'active' | 'disabled';

type SystemUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  assignedMinistry: string | null;
  lastLogin: string;
  lastLoginSort: number;
  status: UserStatus;
  avatarInitials: string;
};

type ActivityType = 'checkin' | 'registration' | 'user_management';

type ActivityEntry = {
  id: string;
  username: string;
  actionType: ActivityType;
  description: string;
  timestamp: string;
};

// ── MOCK DATA ──────────────────────────────────────────────

const INITIAL_USERS: SystemUser[] = [
  { id: '1', name: 'System Admin', username: 'admin', role: 'admin', assignedMinistry: null, lastLogin: 'Today, 8:02 AM', lastLoginSort: 8, status: 'active', avatarInitials: 'SA' },
  { id: '2', name: 'Ana Garcia', username: 'usher1', role: 'usher', assignedMinistry: 'Youth Ministry', lastLogin: 'Today, 9:15 AM', lastLoginSort: 9, status: 'active', avatarInitials: 'AG' },
  { id: '3', name: 'Jose Reyes', username: 'usher2', role: 'usher', assignedMinistry: 'Worship Team', lastLogin: 'Yesterday, 4:30 PM', lastLoginSort: -16, status: 'active', avatarInitials: 'JR' },
  { id: '4', name: 'Pedro Bautista', username: 'usher3', role: 'usher', assignedMinistry: null, lastLogin: 'Jul 15, 2026', lastLoginSort: -120, status: 'active', avatarInitials: 'PB' },
  { id: '5', name: 'Divina Fernandez', username: 'divina.admin', role: 'admin', assignedMinistry: null, lastLogin: 'Jul 14, 2026', lastLoginSort: -144, status: 'active', avatarInitials: 'DF' },
  { id: '6', name: 'Carmela Villanueva', username: 'usher4', role: 'usher', assignedMinistry: 'Children Ministry', lastLogin: 'Jun 30, 2026', lastLoginSort: -480, status: 'disabled', avatarInitials: 'CV' },
  { id: '7', name: 'John Apolinario Juaquin', username: 'usher5', role: 'usher', assignedMinistry: 'Ushers', lastLogin: 'Today, 8:40 AM', lastLoginSort: 8.67, status: 'active', avatarInitials: 'JA' },
];

const MOCK_ACTIVITY_LOG: ActivityEntry[] = [
  { id: '1', username: 'usher1', actionType: 'checkin', description: 'checked in 12 members — Youth Fellowship', timestamp: 'Today, 9:15 AM' },
  { id: '2', username: 'admin', actionType: 'user_management', description: "added new user 'usher5'", timestamp: 'Today, 8:02 AM' },
  { id: '3', username: 'usher5', actionType: 'checkin', description: 'checked in 8 members — Saturday Ministry', timestamp: 'Today, 8:40 AM' },
  { id: '4', username: 'usher2', actionType: 'registration', description: 'registered a new visitor — Blaster Silog', timestamp: 'Yesterday, 4:30 PM' },
  { id: '5', username: 'usher2', actionType: 'checkin', description: 'checked in 15 members — Sunday Fellowship', timestamp: 'Yesterday, 9:05 AM' },
  { id: '6', username: 'admin', actionType: 'user_management', description: "deactivated user 'usher4'", timestamp: 'Jun 30, 2026' },
  { id: '7', username: 'usher3', actionType: 'registration', description: 'registered a new visitor — Wendell Torres', timestamp: 'Jul 13, 2026' },
  { id: '8', username: 'usher1', actionType: 'checkin', description: 'checked in 10 members — Youth Fellowship', timestamp: 'Jul 12, 2026' },
  { id: '9', username: 'divina.admin', actionType: 'user_management', description: "reset password for 'usher3'", timestamp: 'Jul 10, 2026' },
  { id: '10', username: 'usher5', actionType: 'checkin', description: 'checked in 9 members — Saturday Ministry', timestamp: 'Jul 5, 2026' },
];

const MINISTRY_OPTIONS = ['Unassigned / Any Service', 'Youth Ministry', 'Worship Team', 'Ushers', 'Children Ministry', 'Media Team'];

const ROLE_TABS = ['All', 'Admins', 'Ushers'] as const;
type RoleTab = typeof ROLE_TABS[number];

const ROLE_LABELS: Record<UserRole, string> = { admin: 'Admin', usher: 'Usher' };
const ROLE_COLORS: Record<UserRole, string> = { admin: '#e74c3c', usher: '#3498db' };

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ size?: number; color?: string }>> = {
  checkin: CheckCircle2,
  registration: UserPlus,
  user_management: ShieldAlert,
};

type SortColumn = 'name' | 'lastLogin' | null;
type SortDir = 'asc' | 'desc';

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name[0]?.toUpperCase() ?? '?';
}

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 48%), hsl(${(hue + 40) % 360}, 50%, 38%))`;
}

function matchesTab(user: SystemUser, tab: RoleTab): boolean {
  if (tab === 'All') return true;
  if (tab === 'Admins') return user.role === 'admin';
  return user.role === 'usher';
}

// ── FORM STATE ─────────────────────────────────────────────

type UserFormState = {
  name: string;
  username: string;
  password: string;
  requireReset: boolean;
  role: UserRole;
  assignedMinistry: string;
};

const EMPTY_FORM: UserFormState = {
  name: '',
  username: '',
  password: '',
  requireReset: true,
  role: 'usher',
  assignedMinistry: 'Unassigned / Any Service',
};

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<RoleTab>('All');
  const [activeTodayOnly, setActiveTodayOnly] = useState(false);

  const [rawQuery, setRawQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawQuery), 250);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── KPIs ──
  const totalUsers = users.length;
  const activeAdmins = users.filter(u => u.role === 'admin' && u.status === 'active').length;
  const activeUshers = users.filter(u => u.role === 'usher' && u.status === 'active').length;
  const activeToday = users.filter(u => u.lastLogin.startsWith('Today')).length;

  const handleKpiClick = (target: RoleTab | 'ActiveToday') => {
    if (target === 'ActiveToday') {
      setActiveTodayOnly(prev => !prev);
      return;
    }
    setActiveTab(target);
    setActiveTodayOnly(false);
  };

  // ── Filter ──
  let filtered = users
    .filter(u => matchesTab(u, activeTab))
    .filter(u => !activeTodayOnly || u.lastLogin.startsWith('Today'))
    .filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (sortColumn) {
    filtered = [...filtered].sort((a, b) => {
      const result = sortColumn === 'name'
        ? a.name.localeCompare(b.name)
        : a.lastLoginSort - b.lastLoginSort;
      return sortDir === 'asc' ? result : -result;
    });
  }

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  const sortIndicator = (col: SortColumn) => {
    if (sortColumn !== col) return null;
    return sortDir === 'asc' ? <ArrowUp size={12} className="users__sort-arrow" /> : <ArrowDown size={12} className="users__sort-arrow" />;
  };

  const recentActivity = MOCK_ACTIVITY_LOG.slice(0, 10);

  // ── Modal handlers ──
  const openAddModal = () => {
    setEditingUserId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (user: SystemUser) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      username: user.username,
      password: '',
      requireReset: false,
      role: user.role,
      assignedMinistry: user.assignedMinistry ?? 'Unassigned / Any Service',
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.username.trim()) return;

    const assignedMinistry = form.role === 'usher' && form.assignedMinistry !== 'Unassigned / Any Service'
      ? form.assignedMinistry
      : null;

    if (editingUserId) {
      setUsers(prev => prev.map(u => u.id === editingUserId
        ? { ...u, name: form.name, username: form.username, role: form.role, assignedMinistry }
        : u
      ));
    } else {
      const newUser: SystemUser = {
        id: String(Date.now()),
        name: form.name,
        username: form.username,
        role: form.role,
        assignedMinistry,
        lastLogin: 'Never',
        lastLoginSort: -Infinity,
        status: 'active',
        avatarInitials: getInitials(form.name),
      };
      setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
      : u
    ));
  };

  const resetPassword = (user: SystemUser) => {
    alert(`Password reset for ${user.username}. Temporary password: ${generatePassword()}`);
    setOpenMenuId(null);
  };

  return (
    <div className="dashboard users-page">

      {/* ── KPI Row — clickable filters ── */}
      <div className="dashboard__stats">
        <button
          className={`stat-card users__kpi-card ${activeTab === 'All' && !activeTodayOnly ? 'users__kpi-card--active' : ''}`}
          onClick={() => handleKpiClick('All')}>
          <div className="stat-card__icon" style={{ background: 'rgba(181,151,58,0.12)' }}>
            <Users size={22} color="#b5973a" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{totalUsers}</div>
            <div className="stat-card__label">Total Users</div>
          </div>
        </button>

        <button
          className={`stat-card users__kpi-card ${activeTab === 'Admins' && !activeTodayOnly ? 'users__kpi-card--active' : ''}`}
          onClick={() => handleKpiClick('Admins')}>
          <div className="stat-card__icon" style={{ background: 'rgba(231,76,60,0.12)' }}>
            <ShieldCheck size={22} color="#e74c3c" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{activeAdmins}</div>
            <div className="stat-card__label">Active Admins</div>
          </div>
        </button>

        <button
          className={`stat-card users__kpi-card ${activeTab === 'Ushers' && !activeTodayOnly ? 'users__kpi-card--active' : ''}`}
          onClick={() => handleKpiClick('Ushers')}>
          <div className="stat-card__icon" style={{ background: 'rgba(52,152,219,0.12)' }}>
            <HandHelping size={22} color="#3498db" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{activeUshers}</div>
            <div className="stat-card__label">Active Ushers</div>
          </div>
        </button>

        <button
          className={`stat-card users__kpi-card ${activeTodayOnly ? 'users__kpi-card--active' : ''}`}
          onClick={() => handleKpiClick('ActiveToday')}>
          <div className="stat-card__icon" style={{ background: 'rgba(39,174,96,0.12)' }}>
            <Activity size={22} color="#27ae60" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{activeToday}</div>
            <div className="stat-card__label">Active Today</div>
          </div>
        </button>
      </div>

      {/* ── Role Filter Tabs ── */}
      <div className="filter-pills">
        {ROLE_TABS.map(tab => (
          <button
            key={tab}
            className={`filter-pill ${activeTab === tab && !activeTodayOnly ? 'filter-pill--active' : ''}`}
            onClick={() => { setActiveTab(tab); setActiveTodayOnly(false); }}>
            {tab}
          </button>
        ))}
        {activeTodayOnly && (
          <span className="users__active-filter-tag">
            Active Today
            <button className="users__clear-filter" onClick={() => setActiveTodayOnly(false)}>×</button>
          </span>
        )}
      </div>

      {/* ── Bottom grid: Users table (wide) + Activity feed (narrow sidebar) ── */}
      <div className="users__bottom-grid">

        {/* ── Users Table ── */}
        <div className="chart-card users__table-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">System Accounts</div>
              <div className="chart-card__subtitle">{filtered.length} active credentials</div>
            </div>
            <button className="users__add-btn" onClick={openAddModal}>
              <Plus size={14} style={{ marginRight: 4 }} />
              Add User
            </button>
          </div>

          <div className="search-bar">
            <span className="search-bar__icon">
              <Search size={15} />
            </span>
            <input
              className="search-bar__input"
              placeholder="Search by name or username..."
              value={rawQuery}
              onChange={e => setRawQuery(e.target.value)}
            />
          </div>

          <div className="users__table-scroll">
            {filtered.length > 0 ? (
              <table className="reg-table">
                <thead>
                  <tr>
                    <th className="users__th-sortable" onClick={() => handleSort('name')}>
                      User {sortIndicator('name')}
                    </th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Assigned Ministry</th>
                    <th className="users__th-sortable" onClick={() => handleSort('lastLogin')}>
                      Last Login {sortIndicator('lastLogin')}
                    </th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} className="users__row">
                      <td>
                        <div className="reg-table__member">
                          <div
                            className="checkin-avatar checkin-avatar--sm"
                            style={{ background: getAvatarGradient(user.name) }}
                          >
                            {user.avatarInitials}
                          </div>
                          <span className="reg-table__name">{user.name}</span>
                        </div>
                      </td>
                      <td className="reg-table__text">@{user.username}</td>
                      <td>
                        <span className="badge" style={{
                          background: ROLE_COLORS[user.role] + '22',
                          color: ROLE_COLORS[user.role],
                        }}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="reg-table__text">
                        {user.assignedMinistry ?? <span className="users__unassigned">Unassigned</span>}
                      </td>
                      <td className="reg-table__text reg-table__text--muted">{user.lastLogin}</td>
                      <td>
                        <label className="users__toggle">
                          <input
                            type="checkbox"
                            checked={user.status === 'active'}
                            onChange={() => toggleStatus(user.id)}
                          />
                          <span className="users__toggle-track"><span className="users__toggle-thumb" /></span>
                          <span className={`users__toggle-label users__toggle-label--${user.status}`}>
                            {user.status === 'active' ? 'Active' : 'Disabled'}
                          </span>
                        </label>
                      </td>
                      <td className="users__menu-cell">
                        <div className="users__menu-wrapper" ref={openMenuId === user.id ? menuRef : null}>
                          <button
                            className="users__kebab-btn"
                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            aria-label="Row actions">
                            <MoreVertical size={15} />
                          </button>
                          {openMenuId === user.id && (
                            <div className="users__dropdown">
                              <button className="users__dropdown-item" onClick={() => openEditModal(user)}>
                                <Edit2 size={13} style={{ marginRight: 6 }} />
                                Edit Account
                              </button>
                              <button className="users__dropdown-item" onClick={() => resetPassword(user)}>
                                <KeyRound size={13} style={{ marginRight: 6 }} />
                                Reset Password
                              </button>
                              <button
                                className="users__dropdown-item users__dropdown-item--danger"
                                onClick={() => { toggleStatus(user.id); setOpenMenuId(null); }}>
                                <Trash2 size={13} style={{ marginRight: 6 }} />
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="chart-card__empty">No users match this search query.</div>
            )}
          </div>
        </div>

        {/* ── Recent Activity — sidebar ── */}
        <div className="chart-card users__activity-card">
          <div className="chart-card__header">
            <div className="chart-card__title">Security Activity</div>
            <button className="recent-card__view-all">View all →</button>
          </div>
          <div className="users__activity-list">
            {recentActivity.map(entry => {
              const ActionIcon = ACTIVITY_ICONS[entry.actionType] ?? Activity;
              return (
                <div className="users__activity-row users__activity-row--stacked" key={entry.id}>
                  <div className="users__activity-icon">
                    <ActionIcon size={14} />
                  </div>
                  <div className="users__activity-body">
                    <div className="users__activity-text">
                      <span className="users__activity-username">@{entry.username}</span> {entry.description}
                    </div>
                    <div className="users__activity-timestamp">{entry.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Add / Edit User Modal ── */}
      {isModalOpen && (
        <div className="users__modal-overlay" onClick={closeModal}>
          <div className="users__modal chart-card" onClick={e => e.stopPropagation()}>
            <div className="chart-card__header">
              <div>
                <div className="chart-card__title">{editingUserId ? 'Edit Account' : 'Register New User'}</div>
                <div className="chart-card__subtitle">System authorization credentials</div>
              </div>
              <button className="users__modal-close-btn" onClick={closeModal}>
                <X size={16} />
              </button>
            </div>

            <div className="users__form-field">
              <label className="users__form-label">Full Name</label>
              <input
                className="users__form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ana Garcia"
              />
            </div>

            <div className="users__form-field">
              <label className="users__form-label">Username</label>
              <input
                className="users__form-input"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="e.g. usher6"
              />
            </div>

            {!editingUserId && (
              <div className="users__form-field">
                <label className="users__form-label">Password</label>
                <div className="users__password-row">
                  <input
                    className="users__form-input"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter or generate a password"
                  />
                  <button
                    type="button"
                    className="users__generate-btn"
                    onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}>
                    Auto-Generate
                  </button>
                </div>
                <label className="users__checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.requireReset}
                    onChange={e => setForm(f => ({ ...f, requireReset: e.target.checked }))}
                  />
                  Require password reset on first login
                </label>
              </div>
            )}

            <div className="users__form-field">
              <label className="users__form-label">System Role</label>
              <select
                className="filter-select users__form-select"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                <option value="admin">Administrator</option>
                <option value="usher">Usher (Tablet Mode)</option>
              </select>
            </div>

            {form.role === 'usher' && (
              <div className="users__form-field">
                <label className="users__form-label">Assigned Ministry / Fellowship</label>
                <select
                  className="filter-select users__form-select"
                  value={form.assignedMinistry}
                  onChange={e => setForm(f => ({ ...f, assignedMinistry: e.target.value }))}>
                  {MINISTRY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            <div className="users__modal-actions">
              <button className="users__modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="users__modal-save" onClick={handleSubmit}>
                {editingUserId ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}