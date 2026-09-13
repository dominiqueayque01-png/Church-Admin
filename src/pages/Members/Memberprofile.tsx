import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { MOCK_MEMBERS, STATUS_LABELS, STATUS_COLORS } from './index';
import './Members.css';

const MOCK_ATTENDANCE_HISTORY: Record<string, { service: string; attended: boolean }[]> = {
  '1': [
    { service: 'Jul 20', attended: true }, { service: 'Jul 19', attended: true },
    { service: 'Jul 12', attended: true }, { service: 'Jul 5', attended: true },
    { service: 'Jun 28', attended: true }, { service: 'Jun 21', attended: true },
    { service: 'Jun 14', attended: true }, { service: 'Jun 7', attended: true },
  ],
  '7': [
    { service: 'Jul 20', attended: false }, { service: 'Jul 19', attended: false },
    { service: 'Jul 12', attended: false }, { service: 'Jul 5', attended: false },
    { service: 'Jun 28', attended: true }, { service: 'Jun 21', attended: true },
    { service: 'Jun 14', attended: true }, { service: 'Jun 7', attended: true },
  ],
};

function getFallbackHistory(missed: number) {
  const weeks = ['Jul 20', 'Jul 19', 'Jul 12', 'Jul 5', 'Jun 28', 'Jun 21', 'Jun 14', 'Jun 7'];
  return weeks.map((service, i) => ({ service, attended: i >= missed }));
}

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 48%), hsl(${(hue + 40) % 360}, 50%, 38%))`;
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const member = MOCK_MEMBERS.find(m => m.id === id);

  if (!member) {
    return (
      <div className="dashboard">
        <div className="chart-card">
          <div className="chart-card__empty">Member not found.</div>
          <button className="members__back-btn" onClick={() => navigate('/members')}>
            <ArrowLeft size={14} />
            <span>Back to Members</span>
          </button>
        </div>
      </div>
    );
  }

  const history = MOCK_ATTENDANCE_HISTORY[member.id] ?? getFallbackHistory(member.servicesMissed);
  const chartData = [...history].reverse().map(h => ({ ...h, value: h.attended ? 1 : 0 }));

  return (
    <div className="dashboard">

      <button className="members__back-btn" onClick={() => navigate('/members')}>
        <ArrowLeft size={15} />
        <span>Back to Directory</span>
      </button>

      {/* ── Header ── */}
      <div className="chart-card member-profile__header">
        <div
          className="checkin-avatar member-profile__avatar"
          style={{ background: getAvatarGradient(member.name) }}
        >
          {member.avatarInitials}
        </div>
        <div className="member-profile__identity">
          <div className="member-profile__name-row">
            <span className="member-profile__name">{member.name}</span>
            <span className="badge" style={{
              background: STATUS_COLORS[member.status] + '22',
              color: STATUS_COLORS[member.status],
            }}>
              {STATUS_LABELS[member.status]}
            </span>
          </div>
          <div className="member-profile__meta">{member.ministry} · Age {member.age} · Joined {member.dateJoined}</div>
          <div className="member-profile__contact">
            {member.phone && (
              <span className="member-profile__contact-item">
                <Phone size={13} />
                <span>{member.phone}</span>
              </span>
            )}
            {member.email && (
              <span className="member-profile__contact-item">
                <Mail size={13} />
                <span>{member.email}</span>
              </span>
            )}
            {!member.phone && !member.email && <span className="member-profile__no-contact">No contact info on file</span>}
          </div>
        </div>
      </div>

      <div className="dashboard__grid attendance__grid-top">

        {/* ── Attendance History ── */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Attendance History</div>
              <div className="chart-card__subtitle">Last {chartData.length} scheduled services</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                formatter={(v: any) => [v === 1 ? 'Attended' : 'Missed', 'Status']}
                contentStyle={{ background: '#1c1a17', border: '1px solid rgba(212,184,74,0.25)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.attended ? '#27ae60' : '#dcdde1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Ministry Involvement ── */}
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Ministry & Fellowship Details</div>
            </div>
          </div>
          <div className="member-profile__detail-row">
            <span className="member-profile__detail-label">Ministry Team</span>
            <span className="member-profile__detail-value">{member.ministry}</span>
          </div>
          <div className="member-profile__detail-row">
            <span className="member-profile__detail-label">Congregation Role</span>
            <span className="member-profile__detail-value">{STATUS_LABELS[member.status]}</span>
          </div>
          <div className="member-profile__detail-row">
            <span className="member-profile__detail-label">Services Missed</span>
            <span className="member-profile__detail-value">{member.servicesMissed}</span>
          </div>
          {member.howHeard && (
            <div className="member-profile__detail-row">
              <span className="member-profile__detail-label">Discovered Via</span>
              <span className="member-profile__detail-value">{member.howHeard}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}