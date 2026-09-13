import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  ClipboardList,
  Sparkles,
  BarChart3,
  List,
  CalendarDays,
  Clock,
  Check,
  Search,
  Download,
  PhoneCall,
} from 'lucide-react';
import './Attendance.css';

// ── MOCK DATA ──────────────────────────────────────────────

const MOCK_EVENTS = [
  { id: '1', title: 'Saturday Ministry', date: 'Jul 19, 2026', day: 'Sat', time: '9:00 AM - 5:00 PM', type: 'ministry', attendees: 42 },
  { id: '2', title: 'Sunday Fellowship', date: 'Jul 20, 2026', day: 'Sun', time: '9:00 AM - 5:00 PM', type: 'fellowship', attendees: 58 },
  { id: '3', title: 'Saturday Ministry', date: 'Jul 26, 2026', day: 'Sat', time: '9:00 AM - 5:00 PM', type: 'ministry', attendees: 0 },
  { id: '4', title: 'Sunday Fellowship', date: 'Jul 27, 2026', day: 'Sun', time: '9:00 AM - 5:00 PM', type: 'fellowship', attendees: 0 },
  { id: '5', title: 'Special Event', date: 'Aug 1, 2026', day: 'Sat', time: '2:00 PM - 6:00 PM', type: 'special', attendees: 0 },
];

const MOCK_EXPECTED: Record<string, number> = { '1': 50, '2': 65, '3': 50, '4': 65, '5': 40 };
const MOCK_FIRST_TIME: Record<string, number> = { '1': 3, '2': 6, '3': 0, '4': 0, '5': 0 };

const MOCK_ATTENDANCE_TREND: { week: string; ministry: number; fellowship: number; special: number }[] = [
  { week: 'May 24', ministry: 36, fellowship: 49, special: 0 },
  { week: 'May 31', ministry: 39, fellowship: 53, special: 0 },
  { week: 'Jun 7', ministry: 33, fellowship: 47, special: 0 },
  { week: 'Jun 14', ministry: 38, fellowship: 52, special: 0 },
  { week: 'Jun 21', ministry: 42, fellowship: 48, special: 0 },
  { week: 'Jun 28', ministry: 35, fellowship: 61, special: 0 },
  { week: 'Jul 5', ministry: 47, fellowship: 55, special: 0 },
  { week: 'Jul 12', ministry: 44, fellowship: 58, special: 0 },
  { week: 'Jul 19', ministry: 42, fellowship: 58, special: 0 },
];

const MOCK_SERVICE_BREAKDOWN: Record<string, { group: string; count: number; color: string }[]> = {
  '1': [
    { group: 'Youth Ministry', count: 14, color: '#3498db' },
    { group: 'Worship Team', count: 8, color: '#b5973a' },
    { group: 'Ushers', count: 5, color: '#27ae60' },
    { group: 'Media Team', count: 4, color: '#8e44ad' },
    { group: 'Unassigned', count: 11, color: '#95a5a6' },
  ],
  '2': [
    { group: 'Youth Ministry', count: 18, color: '#3498db' },
    { group: 'Worship Team', count: 10, color: '#b5973a' },
    { group: 'Children Ministry', count: 12, color: '#f39c12' },
    { group: 'Ushers', count: 6, color: '#27ae60' },
    { group: 'Unassigned', count: 12, color: '#95a5a6' },
  ],
  '3': [], '4': [], '5': [],
};

const MOCK_ATTENDANCE_LOG: Record<string, { id: string; name: string; group: string; checkInTime: string; checkedInBy: string }[]> = {
  '1': [
    { id: '1', name: 'John Apolinario Juaquin', group: 'Ushers', checkInTime: '8:40 AM', checkedInBy: 'Ana Garcia' },
    { id: '2', name: 'Rosa Mendoza', group: 'Youth Ministry', checkInTime: '8:52 AM', checkedInBy: 'Ana Garcia' },
    { id: '3', name: 'Pedro Bautista', group: 'Worship Team', checkInTime: '9:03 AM', checkedInBy: 'Jose Reyes' },
  ],
  '2': [
    { id: '4', name: 'Maria Santos', group: 'Children Ministry', checkInTime: '8:35 AM', checkedInBy: 'Jose Reyes' },
    { id: '5', name: 'Blaster Silog', group: 'Unassigned', checkInTime: '8:41 AM', checkedInBy: 'Ana Garcia' },
    { id: '6', name: 'Unique Salon', group: 'Youth Ministry', checkInTime: '8:58 AM', checkedInBy: 'Jose Reyes' },
    { id: '7', name: 'Badjao Walangbike', group: 'Worship Team', checkInTime: '9:10 AM', checkedInBy: 'Ana Garcia' },
  ],
  '3': [], '4': [], '5': [],
};

const MOCK_ABSENTEES: { id: string; name: string; group: string; lastAttended: string; servicesMissed: number }[] = [
  { id: '1', name: 'Shrek Taumbayan', group: 'Ushers', lastAttended: 'Jun 22, 2026', servicesMissed: 4 },
  { id: '2', name: 'Aypon Ikisisks', group: 'Worship Team', lastAttended: 'Jun 15, 2026', servicesMissed: 5 },
  { id: '3', name: 'BBM Bayot', group: 'Youth Ministry', lastAttended: 'Jun 29, 2026', servicesMissed: 3 },
];

const MOCK_CALENDAR_DAYS: { day: number | null; hasService: boolean; type?: string }[] = (() => {
  const serviceDays: Record<number, string> = { 19: 'ministry', 20: 'fellowship', 26: 'ministry', 27: 'fellowship' };
  const leadingBlanks = 2;
  const cells: { day: number | null; hasService: boolean; type?: string }[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ day: null, hasService: false });
  for (let d = 1; d <= 31; d++) {
    cells.push({ day: d, hasService: !!serviceDays[d], type: serviceDays[d] });
  }
  return cells;
})();

const TREND_TABS = ['All', 'Ministry', 'Fellowship'] as const;
type TrendTab = typeof TREND_TABS[number];

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

const DEFAULT_EVENT_ID = [...MOCK_EVENTS].reverse().find(e => e.attendees > 0)?.id ?? MOCK_EVENTS[0].id;

export default function AttendancePage() {
  const [selectedEventId, setSelectedEventId] = useState(DEFAULT_EVENT_ID);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [trendTab, setTrendTab] = useState<TrendTab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEvent = MOCK_EVENTS.find(e => e.id === selectedEventId) ?? MOCK_EVENTS[0];
  const checkedIn = selectedEvent.attendees;
  const expected = MOCK_EXPECTED[selectedEvent.id] ?? 0;
  const firstTime = MOCK_FIRST_TIME[selectedEvent.id] ?? 0;
  const attendanceRate = expected > 0 ? Math.round((checkedIn / expected) * 100) : 0;

  const breakdown = MOCK_SERVICE_BREAKDOWN[selectedEvent.id] ?? [];
  const log = (MOCK_ATTENDANCE_LOG[selectedEvent.id] ?? [])
    .filter(entry => entry.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="dashboard">

      {/* ── KPI Row ── */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(39,174,96,0.12)' }}>
            <CheckCircle2 size={22} color="#27ae60" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{checkedIn}</div>
            <div className="stat-card__label">Checked In</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(41,128,185,0.12)' }}>
            <ClipboardList size={22} color="#2980b9" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{expected}</div>
            <div className="stat-card__label">Expected / Registered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(230,126,34,0.12)' }}>
            <Sparkles size={22} color="#e67e22" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{firstTime}</div>
            <div className="stat-card__label">First-Time Visitors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(181,151,58,0.12)' }}>
            <BarChart3 size={22} color="#b5973a" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{attendanceRate}%</div>
            <div className="stat-card__label">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* ── Service Selector + Group Breakdown, side by side ── */}
      <div className="dashboard__grid attendance__grid-top">

        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Select Service</div>
              <div className="chart-card__subtitle">Active church calendar schedule</div>
            </div>
            <div className="attendance__view-toggle attendance__view-toggle--icon">
              <button
                aria-label="List view"
                className={`view-toggle-btn view-toggle-btn--icon ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={15} />
              </button>
              <button
                aria-label="Calendar view"
                className={`view-toggle-btn view-toggle-btn--icon ${viewMode === 'calendar' ? 'view-toggle-btn--active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Calendar View"
              >
                <CalendarDays size={15} />
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="calendar-list calendar-list--compact">
              {MOCK_EVENTS.map(event => (
                <div
                  className={`calendar-item calendar-item--compact ${event.id === selectedEventId ? 'calendar-item--active' : ''}`}
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}>
                  <div className={`calendar-item__date calendar-item__date--compact calendar-item__date--${event.type}`}>
                    <span className="calendar-item__day-name">{event.day}</span>
                    <span className="calendar-item__day-num">
                      {event.date.split(' ')[1].replace(',', '')}
                    </span>
                  </div>
                  <div className="calendar-item__info">
                    <div className="calendar-item__title">{event.title}</div>
                    <div className="calendar-item__time">
                      <Clock size={11} className="calendar-item__clock-icon" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="calendar-item__attendance calendar-item__attendance--inline">
                    {event.attendees > 0 ? (
                      <>
                        <span className="calendar-item__att-count">{event.attendees}</span>
                        <Check size={14} className="calendar-item__att-icon" />
                      </>
                    ) : (
                      <span className="calendar-item__att-upcoming">Upcoming</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="calendar-grid calendar-grid--compact">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div className="calendar-grid__weekday" key={d}>{d}</div>
              ))}
              {MOCK_CALENDAR_DAYS.map((cell, i) => (
                <div className={`calendar-grid__cell ${cell.day === null ? 'calendar-grid__cell--empty' : ''}`} key={i}>
                  {cell.day !== null && (
                    <>
                      <span className="calendar-grid__day-num">{cell.day}</span>
                      {cell.hasService && (
                        <span className={`calendar-grid__dot calendar-grid__dot--${cell.type}`} />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Breakdown */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Attendance by Group</div>
              <div className="chart-card__subtitle">{selectedEvent.title} · {selectedEvent.date}</div>
            </div>
          </div>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdown} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="group" width={110} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Checked In" radius={[0, 4, 4, 0]}>
                  {breakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-card__empty">No check-ins recorded for this service yet.</div>
          )}
        </div>
      </div>

      {/* ── Attendance Trend, full width ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Attendance Trend</div>
            <div className="chart-card__subtitle">Weekly participation over 9 services</div>
          </div>
          <div className="chart-card__tabs">
            {TREND_TABS.map(tab => (
              <button
                key={tab}
                className={`chart-tab ${trendTab === tab ? 'chart-tab--active' : ''}`}
                onClick={() => setTrendTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_ATTENDANCE_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {(trendTab === 'All' || trendTab === 'Ministry') && (
              <Line type="monotone" dataKey="ministry" name="Ministry"
                stroke="#b5973a" strokeWidth={2.5} dot={{ fill: '#b5973a', r: 3 }} activeDot={{ r: 5 }} />
            )}
            {(trendTab === 'All' || trendTab === 'Fellowship') && (
              <Line type="monotone" dataKey="fellowship" name="Fellowship"
                stroke="#3498db" strokeWidth={2.5} dot={{ fill: '#3498db', r: 3 }} activeDot={{ r: 5 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Attendance Log ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Attendance Log</div>
            <div className="chart-card__subtitle">{selectedEvent.title} · {selectedEvent.date}</div>
          </div>
          <button className="recent-card__view-all" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Download size={13} />
            <span>Export Roster</span>
          </button>
        </div>

        <div className="search-bar">
          <span className="search-bar__icon">
            <Search size={15} />
          </span>
          <input
            className="search-bar__input"
            placeholder="Search attendees by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {log.length > 0 ? (
          <div className="members__table-scroll">
            <table className="reg-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Ministry / Group</th>
                  <th>Check-in Time</th>
                  <th>Checked-in By</th>
                </tr>
              </thead>
              <tbody>
                {log.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <div className="reg-table__member">
                        <div
                          className="checkin-avatar checkin-avatar--sm"
                          style={{ background: getAvatarGradient(entry.name) }}
                        >
                          {getInitials(entry.name)}
                        </div>
                        <span className="reg-table__name">{entry.name}</span>
                      </div>
                    </td>
                    <td className="reg-table__text">{entry.group}</td>
                    <td className="reg-table__text">{entry.checkInTime}</td>
                    <td className="reg-table__text reg-table__text--muted">{entry.checkedInBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-card__empty">No check-ins match this search.</div>
        )}
      </div>

      {/* ── Needs Follow-Up ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Needs Follow-Up</div>
            <div className="chart-card__subtitle">Members absent 3+ consecutive services</div>
          </div>
        </div>
        <div className="followup-list">
          {MOCK_ABSENTEES.map(person => (
            <div className="followup-row" key={person.id}>
              <div
                className="checkin-avatar"
                style={{ background: getAvatarGradient(person.name) }}
              >
                {getInitials(person.name)}
              </div>
              <div className="followup-row__info">
                <div className="followup-row__name">{person.name}</div>
                <div className="followup-row__meta">{person.group} · Last attended {person.lastAttended}</div>
              </div>
              <span className="badge" style={{ background: 'rgba(230,126,34,0.12)', color: '#e67e22' }}>
                Missed {person.servicesMissed} services
              </span>
              <button className="followup-row__contact-btn">
                <PhoneCall size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                <span>Mark Contacted</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}