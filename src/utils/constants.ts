import type { TeamInfo } from '../types/cricket';

export const API_BASE_URL = "https://cricket-data-engine-364306697106.asia-south1.run.app/";
export const API_BASE_URL_LOCAL = 'http://localhost:8080';

// Dynamic API URL based on environment
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return API_BASE_URL_LOCAL;
  }
  return API_BASE_URL;
};

export const TEAMS: Record<string, TeamInfo> = {
  kr: {
    id: 'kr',
    name: 'Knight Riders',
    fullName: 'Knight Riders',
    color: '#8b5cf6', // Purple
  },
  ck: {
    id: 'ck',
    name: 'City Knights',
    fullName: 'City Knights',
    color: '#f59e0b', // Amber
  },
  am: {
    id: 'am',
    name: 'Mavericks',
    fullName: 'Aquantis Mavericks',
    color: '#3b82f6', // Blue
  },
  ag: {
    id: 'ag',
    name: 'Gladiators',
    fullName: 'AWC Gladiators',
    color: '#ef4444', // Red
  },
};

export const MATCH_OPTIONS = [5, 10, 15];

export const DEFAULT_MATCHES = 10;

export const ROLE_LABELS = {
  batsman: 'Batsmen',
  bowler: 'Bowlers',
  allrounder: 'Allrounders',
};

export const ROLE_ICONS = {
  batsman: '🏏',
  bowler: '⚡',
  allrounder: '⭐',
};
