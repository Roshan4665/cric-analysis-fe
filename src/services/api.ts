import axios from 'axios';
import { getApiBaseUrl } from '../utils/constants';
import type {
  TeamId,
  PlayerRole,
  BatsmanRanking,
  BowlerRanking,
  AllrounderRanking,
  HistoricalRankingsResponse,
  PlayerHistoricalSummary,
  SnapshotDetailsResponse,
  SearchResult,
} from '../types/cricket';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

// Get Rankings (cached) - Returns array in rankings property
export const getRankings = async <T>(
  role: PlayerRole,
  teamId: TeamId,
  matches: number
): Promise<T[]> => {
  const response = await api.get('/rankings/getRankings', {
    params: { role, teamId, matches },
  });
  
  // API returns data wrapped in rankings property
  return response.data.rankings || [];
};

// Refresh Rankings (compute fresh) - Returns array in rankings property
export const refreshRankings = async <T>(
  role: PlayerRole,
  teamId: TeamId,
  matches: number
): Promise<T[]> => {
  const response = await api.get('/rankings/refreshRankings', {
    params: { role, teamId, matches },
  });
  
  // API returns data wrapped in rankings property
  return response.data.rankings || [];
};

// Get Previous Rankings (1 match older) - Returns array in rankings property
export const getPreviousRanking = async <T>(
  role: PlayerRole,
  teamId: TeamId,
  matches: number
): Promise<T[]> => {
  const response = await api.get('/rankings/getPreviousRanking', {
    params: { role, teamId, matches },
  });
  
  // API returns data wrapped in rankings property
  return response.data.rankings || [];
};

// Get Historical Rankings
export const getHistoricalRankings = async (
  role: PlayerRole,
  teamId: TeamId
): Promise<HistoricalRankingsResponse> => {
  const response = await api.get('/rankings/getHistoricalRankings', {
    params: { role, teamId },
  });
  return response.data;
};

// Refresh Historical Rankings
export const refreshHistoricalRankings = async (
  role: PlayerRole,
  teamId: TeamId
): Promise<{ success: boolean; totalSnapshots: number; message: string }> => {
  const response = await api.get('/rankings/refreshHistoricalRankings', {
    params: { role, teamId },
  });
  return response.data;
};

// Get Player Historical Summary
export const getPlayerHistoricalSummary = async (
  role: PlayerRole,
  teamId: TeamId,
  playerId: number
): Promise<PlayerHistoricalSummary> => {
  const response = await api.get('/rankings/getPlayerHistoricalSummary', {
    params: { role, teamId, playerId },
  });
  return response.data;
};

// Get Snapshot Details
export const getSnapshotDetails = async <T>(
  snapshotId: string
): Promise<SnapshotDetailsResponse<T>> => {
  const response = await api.get('/rankings/getSnapshotDetails', {
    params: { snapshotId },
  });
  return response.data;
};

// Search across all teams and roles
export const searchPlayers = async (
  query: string
): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const teams: TeamId[] = ['kr', 'ck', 'am', 'ag'];
  const roles: PlayerRole[] = ['batsman', 'bowler', 'allrounder'];
  const results: SearchResult[] = [];

  // Search across all teams and roles
  const promises = teams.flatMap((teamId) =>
    roles.map(async (role) => {
      try {
        const rankings = await refreshRankings<any>(role, teamId, 10);
        const matchingPlayers = rankings.filter((player: any) =>
          player.playerName.toLowerCase().includes(query.toLowerCase())
        );

        return matchingPlayers.map((player: any, index: number) => ({
          playerId: player.playerId,
          playerName: player.playerName,
          teamId,
          role,
          currentRating: player.playerPoints,
          currentRank: index + 1,
        }));
      } catch (error) {
        console.error(`Error searching ${role} in ${teamId}:`, error);
        return [];
      }
    })
  );

  const allResults = await Promise.all(promises);
  allResults.forEach((teamResults) => results.push(...teamResults));

  // Sort by rating descending
  return results.sort((a, b) => (b.currentRating || 0) - (a.currentRating || 0));
};

// Helper to get top performers for a team
export const getTopPerformers = async (teamId: TeamId, matches: number = 10) => {
  try {
    const [batsman, bowler, allrounder] = await Promise.all([
      refreshRankings<BatsmanRanking>('batsman', teamId, matches),
      refreshRankings<BowlerRanking>('bowler', teamId, matches),
      refreshRankings<AllrounderRanking>('allrounder', teamId, matches),
    ]);

    return {
      batsman: batsman.slice(0, 3),
      bowler: bowler.slice(0, 3),
      allrounder: allrounder.slice(0, 3),
    };
  } catch (error) {
    console.error(`Error fetching top performers for ${teamId}:`, error);
    throw error;
  }
};

// Find player across all teams and roles by player ID
export const findPlayerProfiles = async (playerId: number): Promise<SearchResult[]> => {
  const teams: TeamId[] = ['kr', 'ck', 'am', 'ag'];
  const roles: PlayerRole[] = ['batsman', 'bowler', 'allrounder'];
  const results: SearchResult[] = [];

  // Search across all teams and roles
  const promises = teams.flatMap((teamId) =>
    roles.map(async (role) => {
      try {
        const rankings = await refreshRankings<any>(role, teamId, 10);
        const player = rankings.find((p: any) => p.playerId === playerId);
        
        if (player) {
          const rank = rankings.indexOf(player) + 1;
          return {
            playerId: player.playerId,
            playerName: player.playerName,
            teamId,
            role,
            currentRating: player.playerPoints,
            currentRank: rank,
          };
        }
        return null;
      } catch (error) {
        console.error(`Error finding player in ${role} ${teamId}:`, error);
        return null;
      }
    })
  );

  const allResults = await Promise.all(promises);
  allResults.forEach((result) => {
    if (result) results.push(result);
  });

  return results;
};

export default api;
