import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Coins,
  UserCheck,
  HandHelping,
  ClipboardList,
  TrendingUp,
  Church,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import './Dashboard.css';

const MOCK_GROWTH: { month: string; totalMembers: number; newMembers: number }[] = [
  { month: 'Aug 25', totalMembers: 98,  newMembers: 4 },
  { month: 'Sep 25', totalMembers: 103, newMembers: 5 },
  { month: 'Oct 25', totalMembers: 107, newMembers: 4 },
  { month: 'Nov 25', totalMembers: 110, newMembers: 3 },
  { month: 'Dec 25', totalMembers: 112, newMembers: 2 },
  { month: 'Jan 26', totalMembers: 115, newMembers: 3 },
  { month: 'Feb 26', totalMembers: 118, newMembers: 3 },
  { month: 'Mar 26', totalMembers: 119, newMembers: 1 },
  { month: 'Apr 26', totalMembers: 121, newMembers: 2 },
  { month: 'May 26', totalMembers: 122, newMembers: 1 },
  { month: 'Jun 26', totalMembers: 123, newMembers: 1 },
  { month: 'Jul 26', totalMembers: 124, newMembers: 1 },
];

const MOCK_AGE_DISTRIBUTION: { ageGroup: string; count: number }[] = [
  { ageGroup: 'Under 18', count: 14 },
  { ageGroup: '18–25',    count: 32 },
  { ageGroup: '26–35',    count: 28 },
  { ageGroup: '36–50',    count: 24 },
  { ageGroup: '51–65',    count: 18 },
  { ageGroup: '65+',      count: 8  },
];

const MOCK_MINISTRY_BREAKDOWN: { ministry: string; count: number; color: string }[] = [
  { ministry: 'Youth Ministry',    count: 28, color: '#3498db' },
  { ministry: 'Worship Team',      count: 18, color: '#b5973a' },
  { ministry: 'Ushers',            count: 12, color: '#27ae60' },
  { ministry: 'Media Team',        count: 10, color: '#8e44ad' },
  { ministry: 'Children Ministry', count: 16, color: '#f39c12' },
  { ministry: 'Unassigned',        count: 40, color: '#95a5a6' },
];

const MOCK_GIVING: { month: string; amount: number }[] = [
  { month: 'Feb', amount: 38500 },
  { month: 'Mar', amount: 42000 },
  { month: 'Apr', amount: 39800 },
  { month: 'May', amount: 45200 },
  { month: 'Jun', amount: 43100 },
  { month: 'Jul', amount: 48250 },
];

const MOCK_STATS = [
  {
    label: 'Total Members',
    value: '124',
    Icon: Users,
    color: '#b5973a',
    bg: 'rgba(181,151,58,0.12)',
    change: '+3 this week',
    changeType: 'up',
  },
  {
    label: "Month's Tithes",
    value: '₱48,250',
    Icon: Coins,
    color: '#16a085',
    bg: 'rgba(22,160,133,0.12)',
    change: '+12% vs last month',
    changeType: 'up',
  },
  {
    label: "This Week's Attendance",
    value: '47',
    Icon: UserCheck,
    color: '#27ae60',
    bg: 'rgba(39,174,96,0.12)',
    change: '+5 vs last week',
    changeType: 'up',
  },
  {
    label: 'Active Ushers',
    value: '3',
    Icon: HandHelping,
    color: '#8e44ad',
    bg: 'rgba(142,68,173,0.12)',
    change: 'On duty today',
    changeType: 'up',
  },
];

const MOCK_RECENT_REGISTERED = [
  { id: '1', name: 'Blaster Silog', status: 'visitor', joined: 'Jul 12, 2026', ministry: 'Unassigned', howHeard: 'Walk-in' },
  { id: '2', name: 'Unique Salon', status: 'new_member', joined: 'Jul 10, 2026', ministry: 'Youth Ministry', howHeard: 'Friend / Family' },
  { id: '3', name: 'Badjao Walangbike', status: 'member', joined: 'Jul 8, 2026', ministry: 'Worship Team', howHeard: 'Social Media' },
  { id: '4', name: 'Aypon Ikisisks', status: 'member', joined: 'Jul 6, 2026', ministry: 'Ushers', howHeard: 'Walk-in' },
  { id: '5', name: 'Shrek Taumbayan', status: 'visitor', joined: 'Jul 5, 2026', ministry: 'Unassigned', howHeard: 'Flyer / Poster' },
];

const REPORT_SHORTCUTS = [
  { Icon: ClipboardList, label: 'Weekly Attendance Report', path: '/reports?type=attendance' },
  { Icon: TrendingUp, label: 'Membership Growth Report', path: '/reports?type=membership' },
  { Icon: Coins, label: 'Giving Summary', path: '/reports?type=giving' },
  { Icon: Church, label: 'Ministry Breakdown', path: '/reports?type=ministry' },
];

const DATE_RANGES = ['This Week', 'This Month', 'This Quarter', 'This Year'];
const MINISTRY_FILTERS = ['All', 'Youth Ministry', 'Worship Team', 'Ushers', 'Media Team', 'Children Ministry'];
const STATUS_FILTERS = ['All', 'Visitor', 'New Member', 'Member', 'Leader'];

const STATUS_LABELS: Record<string, string> = {
  visitor: 'Visitor',
  new_member: 'New Member',
  member: 'Member',
  leader: 'Leader',
};

const STATUS_COLORS: Record<string, string> = {
  visitor: '#f39c12',
  new_member: '#3498db',
  member: '#27ae60',
  leader: '#8e44ad',
};

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1c1a17',
      border: '1px solid rgba(212, 184, 74, 0.25)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, fontSize: 12, marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('This Month');
  const [ministryFilter, setMinistryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const filteredGrowth = MOCK_GROWTH.slice(
    dateRange === 'This Week' ? 11 :
    dateRange === 'This Month' ? 10 :
    dateRange === 'This Quarter' ? 9 : 0
  );

  const filteredMinistry = ministryFilter === 'All'
    ? MOCK_MINISTRY_BREAKDOWN
    : MOCK_MINISTRY_BREAKDOWN.filter(m => m.ministry === ministryFilter);

  return (
    <div className="dashboard">

      {/* ── Global Filter Bar ── */}
      <div className="dashboard__filters">
        <div className="filter-group">
          <span className="filter-group__label">Period</span>
          <div className="filter-pills">
            {DATE_RANGES.map(r => (
              <button
                key={r}
                className={`filter-pill ${dateRange === r ? 'filter-pill--active' : ''}`}
                onClick={() => setDateRange(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-group__label">Ministry</span>
          <select
            className="filter-select"
            value={ministryFilter}
            onChange={e => setMinistryFilter(e.target.value)}>
            {MINISTRY_FILTERS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group__label">Status</span>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dashboard__stats">
        {MOCK_STATS.map((card, i) => {
          const Icon = card.Icon;
          return (
            <div className="stat-card" key={i}>
              <div className="stat-card__icon" style={{ background: card.bg }}>
                <Icon size={22} color={card.color} strokeWidth={2.2} />
              </div>
              <div className="stat-card__info">
                <div className="stat-card__value">{card.value}</div>
                <div className="stat-card__label">{card.label}</div>
                <div className={`stat-card__change stat-card__change--${card.changeType}`}>
                  {card.changeType === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="dashboard__grid">

        {/* Membership Growth — spans 2 cols */}
        <div className="chart-card dashboard__grid-growth">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Membership Growth</div>
              <div className="chart-card__subtitle">Cumulative congregation records</div>
            </div>
            <div className="chart-card__legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#b5973a' }} />
                Total Members
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#27ae60' }} />
                New / Month
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filteredGrowth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="totalMembers" name="Total Members"
                stroke="#b5973a" strokeWidth={2.5} dot={{ fill: '#b5973a', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="newMembers" name="New / Month"
                stroke="#27ae60" strokeWidth={2} dot={{ fill: '#27ae60', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="chart-card dashboard__grid-age">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Members by Age Group</div>
              <div className="chart-card__subtitle">Demographic distribution</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_AGE_DISTRIBUTION} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Members" fill="#3498db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ministry Breakdown Donut */}
        <div className="chart-card dashboard__grid-ministry">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Members by Ministry</div>
              <div className="chart-card__subtitle">Active team representation</div>
            </div>
          </div>
          <div className="ministry-donut">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={filteredMinistry}
                  dataKey="count"
                  nameKey="ministry"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}>
                  {filteredMinistry.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#ccc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="ministry-donut__center">
              <span className="ministry-donut__total">
                {filteredMinistry.reduce((s, m) => s + m.count, 0)}
              </span>
              <span className="ministry-donut__label">members</span>
            </div>
          </div>
          {/* Legend */}
          <div className="ministry-legend">
            {filteredMinistry.map((m, i) => (
              <div className="ministry-legend__item" key={i}>
                <div className="ministry-legend__dot" style={{ background: m.color }} />
                <span className="ministry-legend__name">{m.ministry}</span>
                <span className="ministry-legend__count">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Giving Trend */}
        <div className="chart-card dashboard__grid-giving">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Monthly Tithes & Giving</div>
              <div className="chart-card__subtitle">Treasury trends in PHP (₱)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MOCK_GIVING} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: any) => [`₱${Number(v).toLocaleString()}`, 'Giving']}
                contentStyle={{ background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#27ae60' }}
              />
              <Bar dataKey="amount" name="Giving" fill="#27ae60" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reports Shortcut */}
        <div className="chart-card dashboard__grid-reports">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Quick Reports</div>
              <div className="chart-card__subtitle">Administrative export shortcuts</div>
            </div>
          </div>
          <div className="report-shortcuts">
            {REPORT_SHORTCUTS.map((r, i) => {
              const ShortcutIcon = r.Icon;
              return (
                <button
                  key={i}
                  className="report-shortcut"
                  onClick={() => navigate(r.path)}>
                  <span className="report-shortcut__icon">
                    <ShortcutIcon size={17} strokeWidth={2} />
                  </span>
                  <span className="report-shortcut__label">{r.label}</span>
                  <ChevronRight size={15} className="report-shortcut__chevron" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recently Registered — full width */}
        <div className="chart-card dashboard__grid-registered">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Recently Registered Members</div>
              <div className="chart-card__subtitle">Latest registrations across all ministries</div>
            </div>
            <button className="recent-card__view-all" onClick={() => navigate('/members')}>
              View all members →
            </button>
          </div>
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Ministry / Team</th>
                  <th>How They Heard</th>
                  <th>Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_REGISTERED
                  .filter(m => statusFilter === 'All' || STATUS_LABELS[m.status] === statusFilter)
                  .filter(m => ministryFilter === 'All' || m.ministry === ministryFilter)
                  .map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="reg-table__member">
                        <div
                          className="checkin-avatar checkin-avatar--sm"
                          style={{ background: getAvatarGradient(member.name) }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <span className="reg-table__name">{member.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: STATUS_COLORS[member.status] + '22',
                        color: STATUS_COLORS[member.status],
                      }}>
                        {STATUS_LABELS[member.status]}
                      </span>
                    </td>
                    <td className="reg-table__text">{member.ministry}</td>
                    <td className="reg-table__text">{member.howHeard}</td>
                    <td className="reg-table__text reg-table__text--muted">{member.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}