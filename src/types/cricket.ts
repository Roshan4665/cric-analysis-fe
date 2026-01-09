// Team IDs
export type TeamId = 'kr' | 'ck' | 'am' | 'ag';

// Player Roles
export type PlayerRole = 'batsman' | 'bowler' | 'allrounder';

// Team Info
export interface TeamInfo {
  id: TeamId;
  name: string;
  fullName: string;
  color: string;
}

// Batsman Ranking
export interface BatsmanRanking {
  playerId: number;
  playerName: string;
  playerPoints: number;
  innings: number;
  battingAverage: number;
  strikeRate: number;
  confidence: number;
}

// Bowler Ranking
export interface BowlerRanking {
  playerId: number;
  playerName: string;
  playerPoints: number;
  innings: number;
  bowlingAverage: number;
  economy: number;
  confidence: number;
}

// Allrounder Ranking
export interface AllrounderRanking {
  playerId: number;
  playerName: string;
  playerPoints: number;
  totalInnings: number;
  battingAverage: number;
  strikeRate: number;
  bowlingAverage: number;
  economy: number;
  confidence: number;
}

// Generic Rankings Response
export interface RankingsResponse<T> {
  role: PlayerRole;
  teamId: TeamId;
  numMatches: number;
  rankings: T[];
}

// Historical Snapshot
export interface HistoricalSnapshot {
  snapshotId: string;
  firstMatchId: string;
  firstMatchDate: string;
  matchIds: string[];
}

// Historical Rankings Response
export interface HistoricalRankingsResponse {
  role: PlayerRole;
  teamId: TeamId;
  totalSnapshots: number;
  snapshots: HistoricalSnapshot[];
}

// Player Historical Summary
export interface PlayerHistoricalSummary {
  playerId: number;
  playerName: string;
  role: PlayerRole;
  teamId: TeamId;
  summary: {
    totalAppearances: number;
    currentSnapshot: {
      snapshotId: string;
      rating: number;
      rank: number;
      date: string;
    };
    highestRating: {
      rating: number;
      rank: number;
      snapshotId: string;
      firstMatchId: string;
      date: string;
      matchIds: string[];
    };
    lowestRating: {
      rating: number;
      rank: number;
      snapshotId: string;
      firstMatchId: string;
      date: string;
      matchIds: string[];
    };
    highestRank: {
      rank: number;
      rating: number;
      snapshotId: string;
      firstMatchId: string;
      date: string;
      matchIds: string[];
    };
    lowestRank: {
      rank: number;
      rating: number;
      snapshotId: string;
      firstMatchId: string;
      date: string;
      matchIds: string[];
    };
  };
}

// Snapshot Details Response
export interface SnapshotDetailsResponse<T> {
  snapshotId: string;
  role: PlayerRole;
  teamId: TeamId;
  firstMatchId: string;
  firstMatchDate: string;
  matchIds: string[];
  rankings: T[];
}

// Search Result
export interface SearchResult {
  playerId: number;
  playerName: string;
  teamId: TeamId;
  role: PlayerRole;
  currentRating?: number;
  currentRank?: number;
}

// API Error
export interface ApiError {
  message: string;
  role?: PlayerRole;
  teamId?: TeamId;
  numMatches?: number;
}
