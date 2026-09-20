import { supabase } from './supabase';

// ─── TYPES ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'usher';
export type UserStatus = 'active' | 'disabled';

export type SystemUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  assignedMinistry: string | null;
  status: UserStatus;
  avatarInitials: string;
  lastLogin?: string;
};

export type MemberStatus = 'visitor' | 'new_member' | 'member' | 'leader';

export type Member = {
  id: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  name?: string; // computed helper
  birthday?: string;
  age?: string | number;
  ageGroup?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: MemberStatus;
  ministry?: string;
  howTheyHeard?: string;
  joinedDate?: string;
  avatarInitials?: string;
  lastAttended?: string;
  servicesMissed?: number;
};

export type ServiceEvent = {
  id: string;
  name: string;
  type: 'ministry' | 'fellowship' | 'special';
  eventDate: string;
  dayOfWeek: 'saturday' | 'sunday' | 'weekday';
  timeSlot: string;
  room: string;
  description?: string;
  isActive: boolean;
  expectedAttendance: number;
};

export type AttendanceRecord = {
  id: string;
  memberId: string;
  eventId: string;
  checkedInAt: string;
  isGuest: boolean;
  member?: Member;
};

// ─── AUTHENTICATION ─────────────────────────────────────────

export async function loginStationUser(username: string, password: string): Promise<SystemUser | null> {
  const { data, error } = await supabase.rpc('login_station_user', {
    p_username: username,
    p_password: password,
  });

  if (error) {
    console.error('Login error:', error.message);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const user = data[0];
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role as UserRole,
    assignedMinistry: user.assigned_ministry,
    status: user.status as UserStatus,
    avatarInitials: user.avatar_initials,
  };
}

// ─── MEMBERS ────────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    throw error;
  }

  return (data || []).map(m => ({
    id: m.id,
    firstName: m.first_name,
    middleInitial: m.middle_initial,
    lastName: m.last_name,
    name: `${m.first_name} ${m.last_name}`,
    birthday: m.birthday,
    age: m.age,
    ageGroup: m.age_group || '26-35',
    gender: m.gender,
    phone: m.phone,
    email: m.email,
    address: m.address,
    status: m.status as MemberStatus,
    ministry: m.ministry || 'Unassigned',
    howTheyHeard: m.how_they_heard,
    joinedDate: m.joined_date,
    avatarInitials: m.avatar_initials || `${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`.toUpperCase(),
  }));
}

export async function createMember(member: {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  birthday?: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: MemberStatus;
  ministry?: string;
  howTheyHeard?: string;
}): Promise<Member> {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
  const { data, error } = await supabase
    .from('members')
    .insert({
      first_name: member.firstName,
      middle_initial: member.middleInitial || null,
      last_name: member.lastName,
      birthday: member.birthday || null,
      age: member.age || null,
      gender: member.gender || null,
      phone: member.phone || null,
      email: member.email || null,
      address: member.address || null,
      status: member.status,
      ministry: member.ministry || 'Unassigned',
      how_they_heard: member.howTheyHeard || null,
      avatar_initials: initials,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    name: `${data.first_name} ${data.last_name}`,
    status: data.status,
    ministry: data.ministry,
  };
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}

// ─── EVENTS ─────────────────────────────────────────────────

export async function getEvents(): Promise<ServiceEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) throw error;

  return (data || []).map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    eventDate: e.event_date,
    dayOfWeek: e.day_of_week,
    timeSlot: e.time_slot,
    room: e.room,
    description: e.description,
    isActive: e.is_active,
    expectedAttendance: e.expected_attendance || 60,
  }));
}

// ─── ATTENDANCE ─────────────────────────────────────────────

export async function getAttendanceByEvent(eventId: string): Promise<{
  records: AttendanceRecord[];
  totalAttendees: number;
  firstTimeCount: number;
}> {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select(`
      id,
      member_id,
      event_id,
      checked_in_at,
      is_guest,
      members (
        id,
        first_name,
        last_name,
        status,
        ministry,
        avatar_initials
      )
    `)
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false });

  if (error) throw error;

  const records: AttendanceRecord[] = (data || []).map((row: any) => ({
    id: row.id,
    memberId: row.member_id,
    eventId: row.event_id,
    checkedInAt: row.checked_in_at,
    isGuest: row.is_guest,
    member: row.members ? {
      id: row.members.id,
      firstName: row.members.first_name,
      lastName: row.members.last_name,
      name: `${row.members.first_name} ${row.members.last_name}`,
      status: row.members.status,
      ministry: row.members.ministry,
      avatarInitials: row.members.avatar_initials,
    } : undefined,
  }));

  const firstTimeCount = records.filter(r => r.isGuest || r.member?.status === 'visitor').length;

  return {
    records,
    totalAttendees: records.length,
    firstTimeCount,
  };
}

export function subscribeToAttendance(eventId: string, onChange: () => void) {
  const channel = supabase
    .channel(`realtime-attendance-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendance_logs',
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── SYSTEM USERS ───────────────────────────────────────────

export async function getSystemUsers(): Promise<SystemUser[]> {
  const { data, error } = await supabase
    .from('system_users')
    .select('*')
    .order('role', { ascending: true });

  if (error) throw error;

  return (data || []).map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    assignedMinistry: u.assigned_ministry,
    status: u.status,
    avatarInitials: u.avatar_initials || 'US',
    lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
  }));
}

export async function createSystemUser(user: {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  assignedMinistry?: string;
}): Promise<void> {
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const { error } = await supabase.from('system_users').insert({
    name: user.name,
    username: user.username,
    password_hash: user.password,
    role: user.role,
    assigned_ministry: user.assignedMinistry || null,
    avatar_initials: initials || 'US',
    status: 'active',
  });

  if (error) throw error;
}

export async function toggleUserStatus(id: string, newStatus: UserStatus): Promise<void> {
  const { error } = await supabase
    .from('system_users')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) throw error;
}
