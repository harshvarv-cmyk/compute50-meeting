import { UserProfile } from '../types/user';
import { User } from '../types/auth';
import { teamService, MIN_TEAM_SIZE } from './team.service';

const MOCK_USER: User = {
  id: 'usr_mock_123',
  name: 'Alex Rivera',
  email: 'alex.rivera@psgtech.ac.in',
  phone: '+91 9876543210',
  college: 'PSG College of Technology',
  department: 'Computer Science and Engineering',
  year: '3rd Year',
  role: 'user',
};

const getStoredUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('compute50_user') ?? 'null') as User | null;
  } catch {
    return null;
  }
};

export const userService = {
  getUserProfile: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const user = getStoredUser() ?? MOCK_USER;
    const team = await teamService.getTeamForUser(user.email);
    return {
      user,
      // A team needs at least MIN_TEAM_SIZE members before the registration counts as confirmed.
      registrationStatus: team && team.members.length >= MIN_TEAM_SIZE ? 'Confirmed' : 'Pending',
      paymentStatus: 'Not Applicable',
      accommodationStatus: 'Not Requested',
      team,
    };
  },

  updateUserProfile: async (updatedData: Partial<User>): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const current = getStoredUser() ?? MOCK_USER;
    const newUser = { ...current, ...updatedData };
    localStorage.setItem('compute50_user', JSON.stringify(newUser));
    return newUser;
  },
};
