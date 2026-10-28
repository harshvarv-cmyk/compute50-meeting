import type { HackathonTeam, TeamMember } from '../types/user';
import type { User } from '../types/auth';
import EVENT_CONFIG from '../config/event';

// Frontend mock: teams are kept in localStorage so the Create / Join flow works end to end.
// Replace the bodies below with real API calls when the backend is ready.
const STORAGE_KEY = 'compute50_teams';
export const MAX_TEAM_SIZE = 4;
export const MIN_TEAM_SIZE = 2;
const ID_PREFIX = 'C50-';
// No 0/O/1/I so IDs are easy to read out loud or type from a screenshot.
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const REGISTRATION_DEADLINE = new Date(EVENT_CONFIG.registrationDeadline);

export const isRegistrationOpen = (now: Date = new Date()): boolean => now.getTime() <= REGISTRATION_DEADLINE.getTime();

export const formatDeadline = (): string =>
  REGISTRATION_DEADLINE.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });

// Enforced here as well as in the UI, so a stale tab cannot change a team after the deadline.
const assertOpen = () => {
  if (!isRegistrationOpen()) throw new Error(`Registration closed on ${formatDeadline()}. Teams are now locked.`);
};

const delay = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const readTeams = (): HackathonTeam[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HackathonTeam[];
  } catch {
    return [];
  }
};

const writeTeams = (teams: HackathonTeam[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
};

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const isInAnyTeam = (teams: HackathonTeam[], email: string) =>
  teams.some((t) => t.members.some((m) => sameEmail(m.email, email)));

const toMember = (user: User, role: TeamMember['role'], phone?: string): TeamMember => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: phone ?? user.phone,
  rollNumber: user.rollNumber,
  role,
  college: user.college,
});

const generateTeamId = (taken: Set<string>): string => {
  for (;;) {
    let suffix = '';
    for (let i = 0; i < 6; i++) suffix += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
    const id = ID_PREFIX + suffix;
    if (!taken.has(id)) return id; // keep drawing until the ID is unique
  }
};

/** Accepts a Team ID, a bare code, or a full joining link and returns the normalised Team ID. */
export const parseTeamId = (raw: string): string => {
  let value = raw.trim();
  const fromLink = value.match(/[?&]join=([^&#\s]+)/i);
  if (fromLink) value = decodeURIComponent(fromLink[1]);
  value = value.toUpperCase().replace(/\s+/g, '');
  if (value && !value.startsWith(ID_PREFIX)) value = ID_PREFIX + value;
  return value;
};

export const buildJoinLink = (teamId: string): string =>
  `${window.location.origin}/register?join=${encodeURIComponent(teamId)}`;

export const teamService = {
  getTeamForUser: async (email: string): Promise<HackathonTeam | undefined> =>
    readTeams().find((t) => t.members.some((m) => sameEmail(m.email, email))),

  findTeam: async (rawId: string): Promise<HackathonTeam | undefined> => {
    await delay(350);
    const id = parseTeamId(rawId);
    return readTeams().find((t) => t.code === id);
  },

  createTeam: async (leader: User, teamName: string, whatsappNumber: string): Promise<HackathonTeam> => {
    await delay();
    assertOpen();
    const teams = readTeams();
    if (isInAnyTeam(teams, leader.email)) throw new Error('You are already part of a team.');
    const name = teamName.trim();
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('That team name is already taken. Please choose another.');
    }
    const team: HackathonTeam = {
      id: 'team_' + Date.now(),
      name,
      code: generateTeamId(new Set(teams.map((t) => t.code))),
      leaderId: leader.id,
      maxMembers: MAX_TEAM_SIZE,
      members: [toMember(leader, 'Leader', whatsappNumber)],
      createdAt: new Date().toISOString(),
    };
    writeTeams([...teams, team]);
    return team;
  },

  joinTeam: async (rawId: string, user: User): Promise<HackathonTeam> => {
    await delay();
    assertOpen();
    const teams = readTeams();
    if (isInAnyTeam(teams, user.email)) throw new Error('You are already part of a team.');
    const id = parseTeamId(rawId);
    const team = teams.find((t) => t.code === id);
    if (!team) throw new Error('No team found with that ID. Please check it with your team leader.');
    if (team.members.length >= team.maxMembers) throw new Error(`This team is already full (${team.maxMembers} members).`);
    const updated: HackathonTeam = { ...team, members: [...team.members, toMember(user, 'Member')] };
    writeTeams(teams.map((t) => (t.code === team.code ? updated : t)));
    return updated;
  },

  leaveTeam: async (user: User): Promise<void> => {
    await delay();
    assertOpen();
    const teams = readTeams();
    const team = teams.find((t) => t.members.some((m) => sameEmail(m.email, user.email)));
    if (!team) throw new Error('You are not part of a team.');
    const me = team.members.find((m) => sameEmail(m.email, user.email));
    if (me?.role === 'Leader') throw new Error('The team leader cannot leave the team. Contact the organisers to hand over leadership.');
    const updated: HackathonTeam = { ...team, members: team.members.filter((m) => !sameEmail(m.email, user.email)) };
    writeTeams(teams.map((t) => (t.code === team.code ? updated : t)));
  },

  removeMember: async (leader: User, memberEmail: string): Promise<HackathonTeam> => {
    await delay();
    assertOpen();
    const teams = readTeams();
    const team = teams.find((t) => t.members.some((m) => sameEmail(m.email, leader.email)));
    const caller = team?.members.find((m) => sameEmail(m.email, leader.email));
    if (!team || caller?.role !== 'Leader') throw new Error('Only the team leader can remove members.');
    const target = team.members.find((m) => sameEmail(m.email, memberEmail));
    if (!target) throw new Error('That member is no longer in your team.');
    if (target.role === 'Leader') throw new Error('The team leader cannot be removed.');
    const updated: HackathonTeam = { ...team, members: team.members.filter((m) => m !== target) };
    writeTeams(teams.map((t) => (t.code === team.code ? updated : t)));
    return updated;
  },
};
