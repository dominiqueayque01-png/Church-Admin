import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, UserPlus, Search, PhoneCall } from 'lucide-react';
import { getMembers } from '../../services/api';
import './Members.css';

// ── TYPES ──────────────────────────────────────────────────

type MemberStatus = 'visitor' | 'new_member' | 'member' | 'leader';

export type Member = {
  id: string;
  name: string;
  status: MemberStatus;
  ministry: string;
  age: number;
  ageGroup: string;
  lastAttended: string;
  lastAttendedDaysAgo: number;
  dateJoined: string;
  dateJoinedMonth: string;
  servicesMissed: number;
  phone?: string;
  email?: string;
  howHeard?: string;
  avatarInitials: string;
};

// ── MOCK DATA ──────────────────────────────────────────────

export const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'Maria Santos', status: 'member', ministry: 'Children Ministry', age: 34, ageGroup: '26-35', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Feb 3, 2024', dateJoinedMonth: 'Feb 2024', servicesMissed: 0, phone: '0917 234 5678', email: 'maria.santos@email.com', howHeard: 'Friend / Family', avatarInitials: 'MS' },
  { id: '2', name: 'Jose Reyes', status: 'leader', ministry: 'Worship Team', age: 41, ageGroup: '36-50', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Nov 12, 2020', dateJoinedMonth: 'Nov 2020', servicesMissed: 0, phone: '0918 345 6789', email: 'jose.reyes@email.com', howHeard: 'Walk-in', avatarInitials: 'JR' },
  { id: '3', name: 'Ana Garcia', status: 'leader', ministry: 'Ushers', age: 29, ageGroup: '26-35', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Jun 8, 2021', dateJoinedMonth: 'Jun 2021', servicesMissed: 0, phone: '0919 456 7890', email: 'ana.garcia@email.com', howHeard: 'Social Media', avatarInitials: 'AG' },
  { id: '4', name: 'Pedro Bautista', status: 'member', ministry: 'Ushers', age: 52, ageGroup: '51-65', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Mar 22, 2019', dateJoinedMonth: 'Mar 2019', servicesMissed: 0, phone: '0920 567 8901', avatarInitials: 'PB' },
  { id: '5', name: 'Rosa Mendoza', status: 'new_member', ministry: 'Youth Ministry', age: 22, ageGroup: '18-25', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Jul 5, 2026', dateJoinedMonth: 'Jul 2026', servicesMissed: 0, phone: '0921 678 9012', email: 'rosa.m@email.com', howHeard: 'Flyer / Poster', avatarInitials: 'RM' },
  { id: '6', name: 'Blaster Silog', status: 'visitor', ministry: 'Unassigned', age: 19, ageGroup: '18-25', lastAttended: 'Jul 12, 2026', lastAttendedDaysAgo: 8, dateJoined: 'Jul 12, 2026', dateJoinedMonth: 'Jul 2026', servicesMissed: 1, howHeard: 'Walk-in', avatarInitials: 'BS' },
  { id: '7', name: 'Shrek Taumbayan', status: 'member', ministry: 'Ushers', age: 47, ageGroup: '36-50', lastAttended: 'Jun 22, 2026', lastAttendedDaysAgo: 25, dateJoined: 'Aug 14, 2022', dateJoinedMonth: 'Aug 2022', servicesMissed: 4, phone: '0922 789 0123', avatarInitials: 'ST' },
  { id: '8', name: 'Unique Salon', status: 'new_member', ministry: 'Youth Ministry', age: 24, ageGroup: '18-25', lastAttended: 'Jul 1, 2026', lastAttendedDaysAgo: 16, dateJoined: 'Jun 1, 2026', dateJoinedMonth: 'Jun 2026', servicesMissed: 2, email: 'unique.salon@email.com', howHeard: 'Social Media', avatarInitials: 'US' },
  { id: '9', name: 'Aypon Ikisisks', status: 'member', ministry: 'Worship Team', age: 31, ageGroup: '26-35', lastAttended: 'Jun 15, 2026', lastAttendedDaysAgo: 32, dateJoined: 'Jan 10, 2023', dateJoinedMonth: 'Jan 2023', servicesMissed: 5, phone: '0923 890 1234', avatarInitials: 'AI' },
  { id: '10', name: 'Badjao Walangbike', status: 'member', ministry: 'Worship Team', age: 27, ageGroup: '26-35', lastAttended: 'Jul 5, 2026', lastAttendedDaysAgo: 12, dateJoined: 'Sep 30, 2022', dateJoinedMonth: 'Sep 2022', servicesMissed: 2, phone: '0924 901 2345', email: 'badjao.w@email.com', avatarInitials: 'BW' },
  { id: '11', name: 'BBM Bayot', status: 'visitor', ministry: 'Unassigned', age: 36, ageGroup: '36-50', lastAttended: 'Jun 29, 2026', lastAttendedDaysAgo: 18, dateJoined: 'Jun 29, 2026', dateJoinedMonth: 'Jun 2026', servicesMissed: 3, howHeard: 'Walk-in', avatarInitials: 'BB' },
  { id: '12', name: 'John Apolinario Juaquin', status: 'leader', ministry: 'Ushers', age: 44, ageGroup: '36-50', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'May 4, 2018', dateJoinedMonth: 'May 2018', servicesMissed: 0, phone: '0925 012 3456', email: 'john.aj@email.com', avatarInitials: 'JA' },
  { id: '13', name: 'Carmela Villanueva', status: 'member', ministry: 'Children Ministry', age: 39, ageGroup: '36-50', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Feb 18, 2021', dateJoinedMonth: 'Feb 2021', servicesMissed: 0, phone: '0926 123 4567', avatarInitials: 'CV' },
  { id: '14', name: 'Ramon Cruz', status: 'member', ministry: 'Media Team', age: 26, ageGroup: '26-35', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Oct 9, 2023', dateJoinedMonth: 'Oct 2023', servicesMissed: 1, email: 'ramon.cruz@email.com', avatarInitials: 'RC' },
  { id: '15', name: 'Divina Fernandez', status: 'leader', ministry: 'Children Ministry', age: 48, ageGroup: '36-50', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Apr 2, 2017', dateJoinedMonth: 'Apr 2017', servicesMissed: 0, phone: '0927 234 5678', email: 'divina.f@email.com', avatarInitials: 'DF' },
  { id: '16', name: 'Wendell Torres', status: 'visitor', ministry: 'Unassigned', age: 21, ageGroup: '18-25', lastAttended: 'Jul 13, 2026', lastAttendedDaysAgo: 7, dateJoined: 'Jul 13, 2026', dateJoinedMonth: 'Jul 2026', servicesMissed: 1, howHeard: 'Friend / Family', avatarInitials: 'WT' },
  { id: '17', name: 'Isabel Ramos', status: 'new_member', ministry: 'Worship Team', age: 23, ageGroup: '18-25', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Jul 6, 2026', dateJoinedMonth: 'Jul 2026', servicesMissed: 0, phone: '0928 345 6789', avatarInitials: 'IR' },
  { id: '18', name: 'Gerald Aquino', status: 'member', ministry: 'Media Team', age: 33, ageGroup: '26-35', lastAttended: 'Jun 8, 2026', lastAttendedDaysAgo: 39, dateJoined: 'Jul 20, 2021', dateJoinedMonth: 'Jul 2021', servicesMissed: 6, phone: '0929 456 7890', avatarInitials: 'GA' },
  { id: '19', name: 'Fatima Delacruz', status: 'member', ministry: 'Youth Ministry', age: 17, ageGroup: 'Under 18', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Mar 15, 2024', dateJoinedMonth: 'Mar 2024', servicesMissed: 0, avatarInitials: 'FD' },
  { id: '20', name: 'Noel Panganiban', status: 'visitor', ministry: 'Unassigned', age: 58, ageGroup: '51-65', lastAttended: 'Jun 20, 2026', lastAttendedDaysAgo: 27, dateJoined: 'Jun 20, 2026', dateJoinedMonth: 'Jun 2026', servicesMissed: 3, howHeard: 'Flyer / Poster', avatarInitials: 'NP' },
  { id: '21', name: 'Corazon Ibanez', status: 'member', ministry: 'Children Ministry', age: 67, ageGroup: '65+', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Sep 1, 2015', dateJoinedMonth: 'Sep 2015', servicesMissed: 0, phone: '0930 567 8901', avatarInitials: 'CI' },
  { id: '22', name: 'Kristoff Manalo', status: 'new_member', ministry: 'Media Team', age: 20, ageGroup: '18-25', lastAttended: 'Jul 20, 2026', lastAttendedDaysAgo: 0, dateJoined: 'Jul 13, 2026', dateJoinedMonth: 'Jul 2026', servicesMissed: 0, email: 'kristoff.m@email.com', howHeard: 'Social Media', avatarInitials: 'KM' },
  { id: '23', name: 'Perlita Domingo', status: 'member', ministry: 'Worship Team', age: 45, ageGroup: '36-50', lastAttended: 'Jun 1, 2026', lastAttendedDaysAgo: 46, dateJoined: 'Dec 5, 2019', dateJoinedMonth: 'Dec 2019', servicesMissed: 7, phone: '0931 678 9012', avatarInitials: 'PD' },
  { id: '24', name: 'Emmanuel Castro', status: 'leader', ministry: 'Youth Ministry', age: 30, ageGroup: '26-35', lastAttended: 'Jul 19, 2026', lastAttendedDaysAgo: 1, dateJoined: 'Jan 20, 2020', dateJoinedMonth: 'Jan 2020', servicesMissed: 0, phone: '0932 789 0123', email: 'emmanuel.c@email.com', avatarInitials: 'EC' },
];

const STATUS_TABS = ['All', 'Visitors', 'New Members', 'Members', 'Leaders', 'Inactive'] as const;
type StatusTab = typeof STATUS_TABS[number];

const MINISTRY_FILTERS = ['All', 'Youth Ministry', 'Worship Team', 'Ushers', 'Children Ministry', 'Media Team', 'Unassigned'];
const AGE_GROUP_FILTERS = ['All', 'Under 18', '18-25', '26-35', '36-50', '51-65', '65+'];
const SORT_OPTIONS = ['Name', 'Date Joined', 'Last Attended'] as const;
type SortOption = typeof SORT_OPTIONS[number];

export const STATUS_LABELS: Record<MemberStatus, string> = {
  visitor: 'Visitor',
  new_member: 'New Member',
  member: 'Member',
  leader: 'Leader',
};

export const STATUS_COLORS: Record<MemberStatus, string> = {
  visitor: '#f39c12',
  new_member: '#3498db',
  member: '#27ae60',
  leader: '#8e44ad',
};

const INACTIVE_THRESHOLD = 3;
const CURRENT_MONTH_KEY = 'Jul 2026';
const PAGE_SIZE = 10;

function matchesTab(member: Member, tab: StatusTab): boolean {
  switch (tab) {
    case 'All': return true;
    case 'Visitors': return member.status === 'visitor';
    case 'New Members': return member.status === 'new_member';
    case 'Members': return member.status === 'member';
    case 'Leaders': return member.status === 'leader';
    case 'Inactive': return member.servicesMissed >= INACTIVE_THRESHOLD;
  }
}

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 48%), hsl(${(hue + 40) % 360}, 50%, 38%))`;
}

export default function MembersPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [ministryFilter, setMinistryFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('Name');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [membersList, setMembersList] = useState<Member[]>(MOCK_MEMBERS);

  useEffect(() => {
    let isMounted = true;
    async function loadMembers() {
      try {
        const cloudMembers = await getMembers();
        if (isMounted && cloudMembers && cloudMembers.length > 0) {
          const formatted: Member[] = cloudMembers.map(m => ({
            id: m.id,
            name: m.name || `${m.firstName} ${m.lastName}`,
            status: m.status,
            ministry: m.ministry || 'Unassigned',
            age: Number(m.age) || 25,
            ageGroup: m.ageGroup || '26-35',
            lastAttended: m.lastAttended || 'Recent',
            lastAttendedDaysAgo: 0,
            dateJoined: m.joinedDate || '2026-01-01',
            dateJoinedMonth: 'Jul 2026',
            servicesMissed: 0,
            phone: m.phone,
            email: m.email,
            howHeard: m.howTheyHeard,
            avatarInitials: m.avatarInitials || 'MB',
          }));
          setMembersList(formatted);
        }
      } catch (err) {
        console.log('Error fetching members from Supabase, using mock fallback:', err);
      }
    }
    loadMembers();
    return () => { isMounted = false; };
  }, []);

  const totalMembers = membersList.length;
  const inactiveMembers = membersList.filter(m => m.servicesMissed >= INACTIVE_THRESHOLD);
  const activeMembers = totalMembers - inactiveMembers.length;
  const newThisMonth = membersList.filter(m => m.dateJoinedMonth === CURRENT_MONTH_KEY).length;

  let filtered = membersList
    .filter(m => matchesTab(m, activeTab))
    .filter(m => ministryFilter === 'All' || m.ministry === ministryFilter)
    .filter(m => ageFilter === 'All' || m.ageGroup === ageFilter)
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Date Joined') return new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime();
    return a.lastAttendedDaysAgo - b.lastAttendedDaysAgo;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="dashboard">

      {/* ── KPI Row ── */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(181,151,58,0.12)' }}>
            <Users size={22} color="#b5973a" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{totalMembers}</div>
            <div className="stat-card__label">Total Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(39,174,96,0.12)' }}>
            <UserCheck size={22} color="#27ae60" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{activeMembers}</div>
            <div className="stat-card__label">Active Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(230,126,34,0.12)' }}>
            <UserX size={22} color="#e67e22" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{inactiveMembers.length}</div>
            <div className="stat-card__label">Inactive (Need Follow-Up)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(41,128,185,0.12)' }}>
            <UserPlus size={22} color="#2980b9" strokeWidth={2.2} />
          </div>
          <div className="stat-card__info">
            <div className="stat-card__value">{newThisMonth}</div>
            <div className="stat-card__label">New This Month</div>
          </div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="filter-pills members__status-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            className={`filter-pill ${activeTab === tab ? 'filter-pill--active' : ''}`}
            onClick={() => { setActiveTab(tab); setVisibleCount(PAGE_SIZE); }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Advanced Filter Bar ── */}
      <div className="dashboard__filters">
        <div className="filter-group">
          <span className="filter-group__label">Ministry</span>
          <select className="filter-select" value={ministryFilter}
            onChange={e => { setMinistryFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}>
            {MINISTRY_FILTERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group__label">Age Group</span>
          <select className="filter-select" value={ageFilter}
            onChange={e => { setAgeFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}>
            {AGE_GROUP_FILTERS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-group__label">Sort by</span>
          <select className="filter-select" value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}>
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Main Members Table ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Member Directory</div>
            <div className="chart-card__subtitle">{filtered.length} matching {activeTab.toLowerCase()}</div>
          </div>
        </div>
        <div className="search-bar">
          <span className="search-bar__icon">
            <Search size={15} />
          </span>
          <input
            className="search-bar__input"
            placeholder="Search members by name, email, phone..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
          />
        </div>

        {visible.length > 0 ? (
          <>
            <div className="members__table-scroll">
              <table className="reg-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Ministry / Team</th>
                    <th>Age</th>
                    <th>Last Attended</th>
                    <th>Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(member => (
                    <tr
                      key={member.id}
                      className="reg-table__row--clickable"
                      onClick={() => navigate(`/members/${member.id}`)}>
                      <td>
                        <div className="reg-table__member">
                          <div
                            className="checkin-avatar checkin-avatar--sm"
                            style={{ background: getAvatarGradient(member.name) }}
                          >
                            {member.avatarInitials}
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
                      <td className="reg-table__text">{member.age}</td>
                      <td className="reg-table__text">
                        {member.lastAttended}
                        {member.lastAttendedDaysAgo >= 14 && (
                          <span className="members__days-ago"> · {member.lastAttendedDaysAgo}d ago</span>
                        )}
                      </td>
                      <td className="reg-table__text reg-table__text--muted">{member.dateJoined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button className="members__load-more" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            )}
          </>
        ) : (
          <div className="chart-card__empty">No members match these filters.</div>
        )}
      </div>

      {/* ── Inactive Members — Needs Follow-Up ── */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Inactive Members — Needs Pastoral Follow-Up</div>
            <div className="chart-card__subtitle">Missed {INACTIVE_THRESHOLD}+ consecutive services</div>
          </div>
        </div>
        {inactiveMembers.length > 0 ? (
          <div className="followup-list">
            {inactiveMembers.map(member => (
              <div className="followup-row" key={member.id}>
                <div
                  className="checkin-avatar"
                  style={{ background: getAvatarGradient(member.name) }}
                >
                  {member.avatarInitials}
                </div>
                <div className="followup-row__info">
                  <div className="followup-row__name">{member.name}</div>
                  <div className="followup-row__meta">{member.ministry} · Last attended {member.lastAttended}</div>
                </div>
                <span className="badge" style={{ background: 'rgba(230,126,34,0.14)', color: '#e67e22' }}>
                  Missed {member.servicesMissed} services
                </span>
                <button className="followup-row__contact-btn">
                  <PhoneCall size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  <span>Mark Contacted</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-card__empty">No members currently need follow-up.</div>
        )}
      </div>

    </div>
  );
}