import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CalendarCheck,
  Users,
  Coins,
  Church,
  Bell,
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import './Reports.css';

// ── TYPES ────────────────────────────────────────
type RelevantFilter = 'dateRange' | 'ministry' | 'status';

type ReportType = {
  id: string;
  name: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  relevantFilters: RelevantFilter[];
};

type RecentReport = {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedOn: string;
  generatedBy: string;
};

// ── REPORT TYPES ─────────────────────────────────
const REPORT_TYPES: ReportType[] = [
  {
    id: 'attendance',
    name: 'Attendance Report',
    description: 'Service attendance by date range and ministry',
    Icon: CalendarCheck,
    relevantFilters: ['dateRange', 'ministry'],
  },
  {
    id: 'membership',
    name: 'Membership Report',
    description: 'Growth, status breakdown, and demographics',
    Icon: Users,
    relevantFilters: ['dateRange', 'status'],
  },
  {
    id: 'giving',
    name: 'Giving / Tithes Report',
    description: 'Monthly and quarterly giving summaries',
    Icon: Coins,
    relevantFilters: ['dateRange'],
  },
  {
    id: 'ministry',
    name: 'Ministry Report',
    description: 'Headcount and attendance per ministry/team',
    Icon: Church,
    relevantFilters: ['dateRange', 'ministry'],
  },
  {
    id: 'followup',
    name: 'Follow-Up Report',
    description: 'Inactive members and unreturned visitors',
    Icon: Bell,
    relevantFilters: ['dateRange', 'ministry', 'status'],
  },
];

// ── MOCK DATA ────────────────────────────────────
const DATE_RANGES = ['This Week', 'This Month', 'This Quarter', 'This Year'];
const MINISTRY_OPTIONS = ['All', 'Youth Ministry', 'Worship Team', 'Ushers', 'Media Team', 'Children Ministry'];
const STATUS_OPTIONS = ['All', 'Visitor', 'New Member', 'Member', 'Leader'];

const MOCK_RECENT_REPORTS: RecentReport[] = [
  { id: '1', name: 'Weekly Attendance Report',   type: 'attendance', dateRange: 'Jul 7–13, 2026',  generatedOn: 'Jul 14, 2026', generatedBy: 'admin'  },
  { id: '2', name: 'Membership Growth Report',   type: 'membership', dateRange: 'Jun 2026',         generatedOn: 'Jul 1, 2026',  generatedBy: 'admin'  },
  { id: '3', name: 'June Giving Summary',        type: 'giving',     dateRange: 'Jun 2026',         generatedOn: 'Jul 1, 2026',  generatedBy: 'admin'  },
  { id: '4', name: 'Ministry Breakdown Q2',      type: 'ministry',   dateRange: 'Apr–Jun 2026',     generatedOn: 'Jul 2, 2026',  generatedBy: 'usher1' },
  { id: '5', name: 'Visitor Follow-Up July',     type: 'followup',   dateRange: 'Jul 1–14, 2026',  generatedOn: 'Jul 14, 2026', generatedBy: 'admin'  },
];

const MOCK_ATT_TREND = [
  { week: 'Jun 14', ministry: 38, fellowship: 52 },
  { week: 'Jun 21', ministry: 42, fellowship: 48 },
  { week: 'Jun 28', ministry: 35, fellowship: 61 },
  { week: 'Jul 5',  ministry: 47, fellowship: 55 },
  { week: 'Jul 12', ministry: 44, fellowship: 58 },
];

const MOCK_ATT_TABLE = [
  { date: 'Jun 14', service: 'Saturday Ministry',  total: 38, firstTime: 4, returning: 34 },
  { date: 'Jun 15', service: 'Sunday Fellowship',  total: 52, firstTime: 6, returning: 46 },
  { date: 'Jun 21', service: 'Saturday Ministry',  total: 42, firstTime: 3, returning: 39 },
  { date: 'Jun 22', service: 'Sunday Fellowship',  total: 48, firstTime: 5, returning: 43 },
  { date: 'Jun 28', service: 'Saturday Ministry',  total: 35, firstTime: 2, returning: 33 },
  { date: 'Jun 29', service: 'Sunday Fellowship',  total: 61, firstTime: 8, returning: 53 },
  { date: 'Jul 5',  service: 'Saturday Ministry',  total: 47, firstTime: 5, returning: 42 },
  { date: 'Jul 6',  service: 'Sunday Fellowship',  total: 55, firstTime: 7, returning: 48 },
  { date: 'Jul 12', service: 'Saturday Ministry',  total: 44, firstTime: 3, returning: 41 },
  { date: 'Jul 13', service: 'Sunday Fellowship',  total: 58, firstTime: 6, returning: 52 },
];

const MOCK_MEMBERSHIP_BREAKDOWN = [
  { status: 'Visitor',    count: 22, color: '#f39c12' },
  { status: 'New Member', count: 18, color: '#3498db' },
  { status: 'Member',     count: 71, color: '#27ae60' },
  { status: 'Leader',     count: 13, color: '#8e44ad' },
];

const MOCK_GIVING_TABLE = [
  { month: 'Feb 2026', amount: 38500, donors: 48, avgGift: 802  },
  { month: 'Mar 2026', amount: 42000, donors: 52, avgGift: 808  },
  { month: 'Apr 2026', amount: 39800, donors: 49, avgGift: 812  },
  { month: 'May 2026', amount: 45200, donors: 55, avgGift: 822  },
  { month: 'Jun 2026', amount: 43100, donors: 53, avgGift: 813  },
  { month: 'Jul 2026', amount: 48250, donors: 58, avgGift: 832  },
];

const MOCK_GIVING_CHART = MOCK_GIVING_TABLE.map(r => ({
  month: r.month.split(' ')[0],
  amount: r.amount,
}));

const MOCK_MINISTRY_TABLE = [
  { ministry: 'Youth Ministry',    members: 28, avgAttendance: 22, attendanceRate: '78%' },
  { ministry: 'Worship Team',      members: 18, avgAttendance: 16, attendanceRate: '89%' },
  { ministry: 'Ushers',            members: 12, avgAttendance: 11, attendanceRate: '92%' },
  { ministry: 'Media Team',        members: 10, avgAttendance: 9,  attendanceRate: '90%' },
  { ministry: 'Children Ministry', members: 16, avgAttendance: 13, attendanceRate: '81%' },
  { ministry: 'Unassigned',        members: 40, avgAttendance: 28, attendanceRate: '70%' },
];

const MOCK_FOLLOWUP_TABLE = [
  { name: 'Shrek Taumbayan',   status: 'Visitor',    lastSeen: 'Jun 22, 2026', daysSince: 23, reason: "Hasn't returned" },
  { name: 'Unique Salon',      status: 'New Member', lastSeen: 'Jul 1, 2026',  daysSince: 14, reason: 'Not in a ministry' },
  { name: 'Aypon Ikisisks',    status: 'Visitor',    lastSeen: 'Jun 15, 2026', daysSince: 30, reason: "Hasn't returned" },
  { name: 'Badjao Walangbike', status: 'New Member', lastSeen: 'Jul 5, 2026',  daysSince: 10, reason: 'Not in a ministry' },
  { name: 'BBM Bayot',         status: 'Visitor',    lastSeen: 'Jun 29, 2026', daysSince: 16, reason: "Hasn't returned" },
];

const STATUS_COLORS: Record<string, string> = {
  Visitor:    '#f39c12',
  'New Member': '#3498db',
  Member:     '#27ae60',
  Leader:     '#8e44ad',
};

const REPORT_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  attendance: CalendarCheck,
  membership: Users,
  giving:     Coins,
  ministry:   Church,
  followup:   Bell,
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
      background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)',
      borderRadius: 8, padding: '10px 14px',
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

export default function ReportsPage() {
  const location = useLocation();

  const [selectedType, setSelectedType]   = useState<string | null>(null);
  const [dateRange, setDateRange]         = useState('This Month');
  const [ministryFilter, setMinistryFilter] = useState('All');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [format, setFormat]               = useState<'view' | 'export'>('view');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [toast, setToast]                 = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type && REPORT_TYPES.find(r => r.id === type)) {
      setSelectedType(type);
      setGeneratedReport(type);
    }
  }, [location.search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    setGeneratedReport(selectedType);
    setTimeout(() => {
      document.getElementById('report-preview')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const activeReportType = REPORT_TYPES.find(r => r.id === selectedType);

  const totalAttendance = MOCK_ATT_TABLE.reduce((s, r) => s + r.total, 0);
  const totalFirstTime  = MOCK_ATT_TABLE.reduce((s, r) => s + r.firstTime, 0);
  const avgPerService   = Math.round(totalAttendance / MOCK_ATT_TABLE.length);

  const renderPreviewChart = () => {
    switch (generatedReport) {
      case 'attendance':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_ATT_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ministry"   name="Ministry"   stroke="#b5973a" strokeWidth={2.5} dot={{ fill: '#b5973a', r: 3 }} />
              <Line type="monotone" dataKey="fellowship" name="Fellowship" stroke="#3498db" strokeWidth={2.5} dot={{ fill: '#3498db', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'membership':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={MOCK_MEMBERSHIP_BREAKDOWN} dataKey="count" nameKey="status"
                cx="50%" cy="50%" outerRadius={85} paddingAngle={2}>
                {MOCK_MEMBERSHIP_BREAKDOWN.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'giving':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_GIVING_CHART} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false}
                tickFormatter={(v: any) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [`₱${Number(v).toLocaleString()}`, 'Giving']}
                contentStyle={{ background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#27ae60' }}
              />
              <Bar dataKey="amount" name="Giving" fill="#27ae60" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'ministry':
        return (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MINISTRY_TABLE} layout="vertical"
              margin={{ top: 4, right: 8, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="ministry" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="members" name="Members" fill="#b5973a" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Select a report and click Generate to view data visualization.
          </div>
        );
    }
  };

  const renderPreviewTable = () => {
    switch (generatedReport) {
      case 'attendance':
        return (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Total</th>
                  <th>First-Time</th>
                  <th>Returning</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ATT_TABLE.map((row, i) => (
                  <tr key={i}>
                    <td className="reg-table__text reg-table__text--muted">{row.date}</td>
                    <td className="reg-table__text">{row.service}</td>
                    <td><strong>{row.total}</strong></td>
                    <td className="reg-table__text" style={{ color: '#3498db' }}>{row.firstTime}</td>
                    <td className="reg-table__text">{row.returning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'membership':
        return (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr><th>Status</th><th>Count</th><th>% of Total</th></tr>
              </thead>
              <tbody>
                {MOCK_MEMBERSHIP_BREAKDOWN.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <span className="badge" style={{
                        background: row.color + '22', color: row.color,
                      }}>{row.status}</span>
                    </td>
                    <td><strong>{row.count}</strong></td>
                    <td className="reg-table__text reg-table__text--muted">
                      {Math.round(row.count / MOCK_MEMBERSHIP_BREAKDOWN.reduce((s,r) => s+r.count, 0) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'giving':
        return (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr><th>Month</th><th>Total Giving</th><th>Donors</th><th>Avg Gift</th></tr>
              </thead>
              <tbody>
                {MOCK_GIVING_TABLE.map((row, i) => (
                  <tr key={i}>
                    <td className="reg-table__text reg-table__text--muted">{row.month}</td>
                    <td><strong style={{ color: '#27ae60' }}>₱{row.amount.toLocaleString()}</strong></td>
                    <td className="reg-table__text">{row.donors}</td>
                    <td className="reg-table__text reg-table__text--muted">₱{row.avgGift.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'ministry':
        return (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr><th>Ministry / Team</th><th>Members</th><th>Avg Attendance</th><th>Rate</th></tr>
              </thead>
              <tbody>
                {MOCK_MINISTRY_TABLE.map((row, i) => (
                  <tr key={i}>
                    <td className="reg-table__text" style={{ fontWeight: 600 }}>{row.ministry}</td>
                    <td><strong>{row.members}</strong></td>
                    <td className="reg-table__text">{row.avgAttendance}</td>
                    <td>
                      <span className="badge" style={{
                        background: 'rgba(39,174,96,0.12)', color: '#27ae60',
                      }}>{row.attendanceRate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'followup':
        return (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr><th>Member</th><th>Status</th><th>Last Seen</th><th>Days Since</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {MOCK_FOLLOWUP_TABLE.map((row, i) => (
                  <tr key={i}>
                    <td className="reg-table__member">
                      <div
                        className="checkin-avatar checkin-avatar--sm"
                        style={{ background: getAvatarGradient(row.name) }}
                      >
                        {getInitials(row.name)}
                      </div>
                      <span className="reg-table__name">{row.name}</span>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: (STATUS_COLORS[row.status] ?? '#888') + '22',
                        color: STATUS_COLORS[row.status] ?? '#888',
                      }}>{row.status}</span>
                    </td>
                    <td className="reg-table__text reg-table__text--muted">{row.lastSeen}</td>
                    <td><strong style={{ color: '#f39c12' }}>{row.daysSince}d</strong></td>
                    <td className="reg-table__text">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreviewStats = () => {
    switch (generatedReport) {
      case 'attendance':
        return [
          { label: 'Total Attendees',   value: totalAttendance },
          { label: 'First-Time Guests', value: totalFirstTime  },
          { label: 'Avg per Service',   value: avgPerService   },
          { label: 'Services Held',     value: MOCK_ATT_TABLE.length },
        ];
      case 'membership':
        return [
          { label: 'Total Members', value: 124 },
          { label: 'New This Month', value: 8 },
          { label: 'Active Leaders', value: 13 },
          { label: 'Visitors',       value: 22 },
        ];
      case 'giving':
        return [
          { label: 'Total Giving',    value: `₱${MOCK_GIVING_TABLE.reduce((s,r)=>s+r.amount,0).toLocaleString()}` },
          { label: 'This Month',      value: '₱48,250' },
          { label: 'Avg Donors/Month', value: Math.round(MOCK_GIVING_TABLE.reduce((s,r)=>s+r.donors,0)/MOCK_GIVING_TABLE.length) },
          { label: 'Avg Gift',        value: `₱${Math.round(MOCK_GIVING_TABLE.reduce((s,r)=>s+r.avgGift,0)/MOCK_GIVING_TABLE.length).toLocaleString()}` },
        ];
      case 'ministry':
        return [
          { label: 'Total Ministries', value: MOCK_MINISTRY_TABLE.length - 1 },
          { label: 'Total Members',    value: MOCK_MINISTRY_TABLE.reduce((s,r)=>s+r.members,0) },
          { label: 'Avg Attendance',   value: Math.round(MOCK_MINISTRY_TABLE.reduce((s,r)=>s+r.avgAttendance,0)/MOCK_MINISTRY_TABLE.length) },
          { label: 'Unassigned',       value: 40 },
        ];
      case 'followup':
        return [
          { label: 'Need Follow-Up',  value: MOCK_FOLLOWUP_TABLE.length },
          { label: "Hasn't Returned", value: MOCK_FOLLOWUP_TABLE.filter(r=>r.reason==="Hasn't returned").length },
          { label: 'No Ministry',     value: MOCK_FOLLOWUP_TABLE.filter(r=>r.reason==='Not in a ministry').length },
          { label: 'Avg Days Since',  value: `${Math.round(MOCK_FOLLOWUP_TABLE.reduce((s,r)=>s+r.daysSince,0)/MOCK_FOLLOWUP_TABLE.length)}d` },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="reports">

      {/* ── Report Type Selector ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Select Report Template</div>
            <div className="chart-card__subtitle">Choose data category to generate and inspect</div>
          </div>
        </div>
        <div className="report-types">
          {REPORT_TYPES.map(rt => {
            const Icon = rt.Icon;
            return (
              <button
                key={rt.id}
                className={`report-type-card ${selectedType === rt.id ? 'report-type-card--active' : ''}`}
                onClick={() => { setSelectedType(rt.id); setGeneratedReport(null); }}>
                <div className="report-type-card__icon">
                  <Icon size={24} />
                </div>
                <div className="report-type-card__title">{rt.name}</div>
                <div className="report-type-card__desc">{rt.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Reports ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Archived & Recent Reports</div>
            <div className="chart-card__subtitle">Recently generated administrative summaries</div>
          </div>
        </div>
        <div className="recent-reports">
          {MOCK_RECENT_REPORTS.map(r => {
            const Icon = REPORT_TYPE_ICONS[r.type] ?? FileText;
            return (
              <div className="recent-report-row" key={r.id}>
                <div className="recent-report-row__icon">
                  <Icon size={20} />
                </div>
                <div className="recent-report-row__info">
                  <div className="recent-report-row__name">{r.name}</div>
                  <div className="recent-report-row__meta">
                    {r.dateRange} · Generated {r.generatedOn} by @{r.generatedBy}
                  </div>
                </div>
                <div className="recent-report-row__actions">
                  <button
                    className="recent-report-row__btn"
                    onClick={() => {
                      setSelectedType(r.type);
                      setGeneratedReport(r.type);
                      setTimeout(() => {
                        document.getElementById('report-preview')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}>
                    Inspect
                  </button>
                  <button
                    className="recent-report-row__btn"
                    onClick={() => showToast('Export download package initiated')}>
                    <Download size={12} style={{ marginRight: 4 }} />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Report Builder ── */}
      {selectedType && activeReportType && (
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Configure Report Parameters</div>
              <div className="chart-card__subtitle">{activeReportType.name}</div>
            </div>
          </div>
          <div className="report-builder">
            <div className="report-builder__filters">

              {/* Date Range */}
              {activeReportType.relevantFilters.includes('dateRange') && (
                <div className="report-builder__field">
                  <span className="report-builder__label">Date Range</span>
                  <div className="report-builder__pills">
                    {DATE_RANGES.map(r => (
                      <button
                        key={r}
                        className={`report-builder__pill ${dateRange === r ? 'report-builder__pill--active' : ''}`}
                        onClick={() => setDateRange(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ministry Filter */}
              {activeReportType.relevantFilters.includes('ministry') && (
                <div className="report-builder__field">
                  <span className="report-builder__label">Ministry</span>
                  <select
                    className="report-builder__select"
                    value={ministryFilter}
                    onChange={e => setMinistryFilter(e.target.value)}>
                    {MINISTRY_OPTIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              {activeReportType.relevantFilters.includes('status') && (
                <div className="report-builder__field">
                  <span className="report-builder__label">Status</span>
                  <select
                    className="report-builder__select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format */}
              <div className="report-builder__field">
                <span className="report-builder__label">View Mode</span>
                <div className="report-builder__format">
                  <button
                    className={`report-builder__format-btn ${format === 'view' ? 'report-builder__format-btn--active' : ''}`}
                    onClick={() => setFormat('view')}>
                    Interactive View
                  </button>
                  <button
                    className={`report-builder__format-btn ${format === 'export' ? 'report-builder__format-btn--active' : ''}`}
                    onClick={() => setFormat('export')}>
                    Direct Export
                  </button>
                </div>
              </div>
            </div>

            <div className="report-builder__actions">
              <button className="report-builder__generate" onClick={handleGenerate}>
                Generate Live Report
              </button>
              {format === 'export' && (
                <div className="report-builder__export-btns">
                  <button
                    className="report-builder__export-btn"
                    onClick={() => showToast('PDF export generated')}>
                    <FileText size={13} style={{ marginRight: 4 }} />
                    Export PDF
                  </button>
                  <button
                    className="report-builder__export-btn"
                    onClick={() => showToast('CSV export generated')}>
                    <FileSpreadsheet size={13} style={{ marginRight: 4 }} />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Report Preview ── */}
      {generatedReport && (
        <div className="chart-card report-preview" id="report-preview">
          <div className="report-preview__header">
            <div>
              <div className="report-preview__title">
                {REPORT_TYPES.find(r => r.id === generatedReport)?.name} — {dateRange}
              </div>
              <div className="report-preview__meta">
                Generated on {new Date().toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })} ·{' '}
                {ministryFilter !== 'All' && `Ministry: ${ministryFilter} · `}
                {statusFilter !== 'All' && `Status: ${statusFilter}`}
              </div>
            </div>
            <div className="report-preview__export-btns">
              <button
                className="report-preview__export-btn report-preview__export-btn--pdf"
                onClick={() => showToast('PDF download ready')}>
                <FileText size={13} style={{ marginRight: 5 }} />
                Export PDF
              </button>
              <button
                className="report-preview__export-btn report-preview__export-btn--csv"
                onClick={() => showToast('CSV spreadsheet ready')}>
                <FileSpreadsheet size={13} style={{ marginRight: 5 }} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="report-preview__stats">
            {renderPreviewStats().map((s, i) => (
              <div className="report-mini-stat" key={i}>
                <div className="report-mini-stat__value">{s.value}</div>
                <div className="report-mini-stat__label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {renderPreviewChart()}

          {/* Table */}
          {renderPreviewTable()}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast">
          <CheckCircle size={15} color="#27ae60" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}