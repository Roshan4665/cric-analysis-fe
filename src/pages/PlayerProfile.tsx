import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiAward, FiHelpCircle, FiChevronRight } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { refreshRankings, getPreviousRanking, getPlayerHistoricalSummary, getHistoricalRankings, getSnapshotDetails, findPlayerProfiles } from '../services/api';
import type { TeamId, PlayerRole, SearchResult } from '../types/cricket';
import { TEAMS, ROLE_LABELS, ROLE_ICONS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

const PlayerProfile = () => {
  const { teamId, playerId } = useParams<{ teamId: TeamId; playerId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const role = (location.state as any)?.role as PlayerRole | undefined;

  const [playerData, setPlayerData] = useState<any>(null);
  const [previousPlayerData, setPreviousPlayerData] = useState<any>(null);
  const [previousRank, setPreviousRank] = useState<number>(0);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [snapshotMetadata, setSnapshotMetadata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRank, setCurrentRank] = useState<number>(0);
  const [otherProfiles, setOtherProfiles] = useState<SearchResult[]>([]);

  const team = teamId ? TEAMS[teamId] : null;

  useEffect(() => {
    // Reset state immediately when route changes to prevent rendering stale data
    setPlayerData(null);
    setPreviousPlayerData(null);
    setPreviousRank(0);
    setHistoricalData(null);
    setChartData([]);
    setSnapshotMetadata([]);
    setOtherProfiles([]);
    setCurrentRank(0);
    setLoading(true);

    if (!team || !playerId || !role) {
      navigate('/');
      return;
    }
    fetchPlayerData();
  }, [teamId, playerId, role]);

  const fetchPlayerData = async () => {
    if (!teamId || !playerId || !role) return;

    setLoading(true);
    try {
      // Get current and previous rankings to find player
      const [rankings, prevRankings] = await Promise.all([
        refreshRankings<any>(role, teamId, 10),
        getPreviousRanking<any>(role, teamId, 10).catch(() => [])
      ]);
      
      const player = rankings.find((p: any) => p.playerId === Number(playerId));
      const rank = rankings.findIndex((p: any) => p.playerId === Number(playerId)) + 1;
      
      setPlayerData(player);
      setCurrentRank(rank);

      // Find previous player data
      if (prevRankings.length > 0) {
        const prevPlayer = prevRankings.find((p: any) => p.playerId === Number(playerId));
        if (prevPlayer) {
          const prevRank = prevRankings.findIndex((p: any) => p.playerId === Number(playerId)) + 1;
          setPreviousPlayerData(prevPlayer);
          setPreviousRank(prevRank);
        }
      }

      // Get historical data for all roles
      try {
        const historical = await getPlayerHistoricalSummary(
          role,
          teamId,
          Number(playerId)
        );
        setHistoricalData(historical);

        // Fetch chart data
        await fetchChartData(teamId, role, Number(playerId), player, rank);
      } catch (error) {
        console.log('Historical data not available');
      }

      // Fetch other profiles for this player
      try {
        const profiles = await findPlayerProfiles(Number(playerId));
        // Filter out current profile
        const otherProfilesList = profiles.filter(
          p => !(p.teamId === teamId && p.role === role)
        );
        setOtherProfiles(otherProfilesList);
      } catch (error) {
        console.log('Error fetching other profiles');
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (
    teamId: TeamId,
    role: PlayerRole,
    playerId: number,
    playerData: any,
    currentRank: number
  ) => {
    try {
      const snapshots = await getHistoricalRankings(role, teamId);
      
      // Store snapshot metadata for lazy loading in AnimatedTimeline
      const metadata = snapshots.snapshots.map(snapshot => ({
        snapshotId: snapshot.snapshotId,
        date: new Date(snapshot.firstMatchDate).toLocaleDateString(),
      }));
      setSnapshotMetadata(metadata);
      
      // Fetch sample data for static chart (show ~20 points max)
      // Exclude the last snapshot since we'll add current data with today's date
      const step = Math.max(1, Math.floor((snapshots.snapshots.length - 1) / 20));
      const sampledSnapshots = snapshots.snapshots.slice(0, -1).filter((_, i) => i % step === 0);
      
      const sampledDataPromises = sampledSnapshots.map(async (snapshot) => {
        const details = await getSnapshotDetails<any>(snapshot.snapshotId);
        const player = details.rankings.find((p: any) => p.playerId === playerId);
        
        if (player) {
          const rank = details.rankings.indexOf(player) + 1;
          const rating = player.playerPoints;
          return {
            date: new Date(snapshot.firstMatchDate).toLocaleDateString(),
            rating,
            rank,
          };
        }
        return null;
      });

      let sampledData = (await Promise.all(sampledDataPromises)).filter(Boolean);
      
      // Add current data point as the final point if we have playerData
      // This ensures the chart always ends with the most recent rating
      if (playerData) {
        sampledData.push({
          date: new Date().toLocaleDateString(),
          rating: playerData.playerPoints,
          rank: currentRank,
        });
      }
      
      setChartData(sampledData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!playerData || !team || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Player not found</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const rating = playerData.playerPoints;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/team/${teamId}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back to {team.name}
        </motion.button>

        {/* Player Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ backgroundColor: team.color + '30', color: team.color }}
              >
                #{currentRank}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                  {playerData.playerName}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-400">{ROLE_LABELS[role]}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{team.fullName}</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-5xl font-bold text-primary">
                {rating?.toFixed(0) || 'N/A'}
              </div>
              <div className="text-gray-500 mt-1">Current Rating</div>
              <Link to="/methodology" className="mt-3 inline-block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-dark-card hover:bg-dark-card/70 rounded-lg text-gray-300 hover:text-gray-100 transition-all border border-dark-border text-sm"
                >
                  <FiHelpCircle />
                  <span>How is this calculated?</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Change from Last Match */}
        {previousPlayerData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4 mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Change from Last Match</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Rank Change */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Rank</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-gray-300">#{previousRank}</span>
                  {previousRank !== currentRank ? (
                    <>
                      {previousRank > currentRank ? (
                        <FiTrendingUp className="text-green-500 flex-shrink-0" size={14} />
                      ) : (
                        <FiTrendingDown className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className="text-base sm:text-lg font-bold text-gray-300">#{currentRank}</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-500">(No change)</span>
                  )}
                </div>
              </div>
              
              {/* Rating Change */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Rating</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-primary">{previousPlayerData.playerPoints.toFixed(0)}</span>
                  {previousPlayerData.playerPoints !== playerData.playerPoints ? (
                    <>
                      {playerData.playerPoints > previousPlayerData.playerPoints ? (
                        <FiTrendingUp className="text-green-500 flex-shrink-0" size={14} />
                      ) : (
                        <FiTrendingDown className="text-red-500 flex-shrink-0" size={14} />
                      )}
                      <span className="text-base sm:text-lg font-bold text-primary">{playerData.playerPoints.toFixed(0)}</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-500">(No change)</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">Recent Performance</h2>
          
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === 'batsman' && (
              <>
                <StatCard title="Batting Average" value={playerData.battingAverage?.toFixed(1) || 'N/A'} icon="📊" />
                <StatCard title="Strike Rate" value={playerData.strikeRate?.toFixed(1) || 'N/A'} icon="⚡" />
                <StatCard title="Innings" value={playerData.innings?.toString() || 'N/A'} icon="🏏" />
                <StatCard
                  title="Confidence"
                  value={`${((playerData.confidence || 0) * 100).toFixed(0)}%`}
                  icon="🎯"
                />
              </>
            )}
            {role === 'bowler' && (
              <>
                <StatCard title="Bowling Average" value={playerData.bowlingAverage?.toFixed(1) || 'N/A'} icon="📊" />
                <StatCard title="Economy" value={playerData.economy?.toFixed(1) || 'N/A'} icon="💰" />
                <StatCard title="Innings" value={playerData.innings?.toString() || 'N/A'} icon="⚡" />
                <StatCard
                  title="Confidence"
                  value={`${((playerData.confidence || 0) * 100).toFixed(0)}%`}
                  icon="🎯"
                />
              </>
            )}
            {role === 'allrounder' && (
              <>
                <StatCard title="Bat Avg" value={playerData.battingAverage?.toFixed(1) || 'N/A'} icon="🏏" />
                <StatCard title="Bowl Avg" value={playerData.bowlingAverage?.toFixed(1) || 'N/A'} icon="⚡" />
                <StatCard title="Strike Rate" value={playerData.strikeRate?.toFixed(1) || 'N/A'} icon="📊" />
                <StatCard title="Economy" value={playerData.economy?.toFixed(1) || 'N/A'} icon="💰" />
              </>
            )}
          </div>
        </motion.div>

        {/* Other Teams & Roles */}
        {otherProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Other Teams & Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherProfiles.map((profile) => (
                <motion.button
                  key={`${profile.teamId}-${profile.role}`}
                  onClick={() =>
                    navigate(`/team/${profile.teamId}/player/${profile.playerId}`, {
                      state: { role: profile.role },
                    })
                  }
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 text-left hover:bg-dark-card/70 transition-all border-2 border-transparent hover:border-primary/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{ROLE_ICONS[profile.role]}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-100">
                        {ROLE_LABELS[profile.role]}
                      </div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: TEAMS[profile.teamId].color }}
                      >
                        {TEAMS[profile.teamId].fullName}
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400 text-xl flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
                    <div>
                      <div className="text-xs text-gray-500">Rating</div>
                      <div className="text-lg font-bold text-primary">
                        {profile.currentRating?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rank</div>
                      <div className="text-lg font-bold text-gray-300">
                        #{profile.currentRank}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Career Milestones */}
        {historicalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
              <FiAward className="text-accent" />
              Career Milestones
            </h2>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-400">
                For <span className="font-semibold" style={{ color: team.color }}>{team.fullName}</span> as <span className="font-semibold text-gray-300">{ROLE_LABELS[role]}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MilestoneCard
                title="Best Rank"
                rank={historicalData.summary.highestRank.rank}
                rating={historicalData.summary.highestRank.rating || 999}
                date={new Date(historicalData.summary.highestRank.date).toLocaleDateString()}
                icon={<FiTrendingUp className="text-green-500" />}
              />
              <MilestoneCard
                title="Best Rating"
                rank={historicalData.summary.highestRating.rank}
                rating={historicalData.summary.highestRating.rating || 999}
                date={new Date(historicalData.summary.highestRating.date).toLocaleDateString()}
                icon={<FiTrendingUp className="text-primary" />}
              />
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Total Appearances: {historicalData.summary.totalAppearances} ranking periods
            </div>
          </motion.div>
        )}

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Performance Timeline</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#00d084"
                  strokeWidth={3}
                  dot={{ fill: '#00d084', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* View Animation Button */}
        {snapshotMetadata.length > 0 && teamId && playerId && role && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mt-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">
                Match-by-Match Performance Animation
              </h2>
              <p className="text-gray-400 mb-6">
                See how this player's rating evolved over time with an animated timeline
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(`/team/${teamId}/player/${playerId}/animation`, {
                    state: { role, playerName: playerData.playerName },
                  })
                }
                className="btn-primary px-8 py-3 text-lg"
              >
                View Animated Timeline
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-card p-4"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-gray-100">{value}</div>
  </motion.div>
);

const MilestoneCard = ({
  title,
  rank,
  rating,
  date,
  icon,
}: {
  title: string;
  rank: number;
  rating: number;
  date: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-dark-bg/30 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-sm font-semibold text-gray-300">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-primary">#{rank}</span>
      <span className="text-xl text-gray-400">({rating.toFixed(0)})</span>
    </div>
    <div className="text-xs text-gray-500 mt-2">{date}</div>
  </div>
);

export default PlayerProfile;
