import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiHelpCircle } from 'react-icons/fi';
import { refreshRankings } from '../services/api';
import type { TeamId, PlayerRole, BatsmanRanking, BowlerRanking, AllrounderRanking } from '../types/cricket';
import { TEAMS, MATCH_OPTIONS, DEFAULT_MATCHES, ROLE_LABELS, ROLE_ICONS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';

const TeamDetails = () => {
  const { teamId } = useParams<{ teamId: TeamId }>();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<PlayerRole>('batsman');
  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const team = teamId ? TEAMS[teamId] : null;

  useEffect(() => {
    console.log("I;m here");
    if (!team) {
      navigate('/');
      return;
    }
      console.log("I;m here as well");
    fetchRankings();
  }, [teamId, activeRole, matches]);

  const fetchRankings = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      console.log("fetching rankings for : ", activeRole);
      const rankings = await refreshRankings<any>(activeRole, teamId, matches);
      setRankings(rankings || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!teamId || refreshing) return;
    
    setRefreshing(true);
    try {
      const rankings = await refreshRankings<any>(activeRole, teamId, matches);
      setRankings(rankings || []);
    } catch (error) {
      console.error('Error refreshing rankings:', error);
      setRankings([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlayerClick = (playerId: number) => {
    navigate(`/team/${teamId}/player/${playerId}`, {
      state: { role: activeRole },
    });
  };

  if (!team) return null;

  const roles: PlayerRole[] = ['batsman', 'bowler', 'allrounder'];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-2 h-16 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                {team.fullName}
              </h1>
              <p className="text-gray-400">Performance Rankings</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
              {MATCH_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setMatches(option)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    matches === option
                      ? 'bg-primary text-white'
                      : 'bg-dark-card text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Last {option}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="hidden sm:flex btn-primary items-center gap-2 whitespace-nowrap"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Role Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-1">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => 
                  {console.log("Role selected: ", role);
                    setLoading(true);
                  setActiveRole(role);
                  console.log("Role after set active role: ", activeRole)
                }
                }
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeRole === role
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                    : 'bg-dark-card text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{ROLE_ICONS[role]}</span>
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          
          <Link to="/methodology" className="hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 bg-dark-card hover:bg-dark-card/70 rounded-lg text-gray-300 hover:text-gray-100 transition-all border border-dark-border whitespace-nowrap"
            >
              <FiHelpCircle />
              <span>How Ratings Work</span>
            </motion.button>
          </Link>
        </div>

        {/* Rankings List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {rankings.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-400">
                  No rankings available
                </div>
              ) : (
                rankings.map((player, index) => (
                  <motion.div
                    key={player.playerId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() => handlePlayerClick(player.playerId)}
                    className="glass-card p-4 cursor-pointer hover:bg-dark-card/70 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-bg/50 font-bold text-gray-300">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-100">
                            {player.playerName}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                            {activeRole === 'batsman' && (
                              <>
                                <span>Avg: {player.battingAverage.toFixed(1)}</span>
                                <span>SR: {player.strikeRate.toFixed(1)}</span>
                                <span>Inn: {player.innings}</span>
                              </>
                            )}
                            {activeRole === 'bowler' && (
                              <>
                                <span>Avg: {player.bowlingAverage.toFixed(1)}</span>
                                <span>Econ: {player.economy.toFixed(1)}</span>
                                <span>Inn: {player.innings}</span>
                              </>
                            )}
                            {activeRole === 'allrounder' && (
                              <>
                                <span>Bat Avg: {player.battingAverage?.toFixed(1) || 'N/A'}</span>
                                <span>Bowl Avg: {player.bowlingAverage?.toFixed(1) || 'N/A'}</span>
                                <span>Inn: {player.totalInnings}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {player.playerPoints.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                        <div className="mt-1">
                          <span
                            className={`inline-block w-16 h-1.5 rounded-full ${
                              player.confidence >= 0.8
                                ? 'bg-green-500'
                                : player.confidence >= 0.5
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            title={`Confidence: ${(player.confidence * 100).toFixed(0)}%`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Methodology Link for Mobile - Bottom */}
        <Link to="/methodology" className="sm:hidden block mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-card hover:bg-dark-card/70 rounded-lg text-gray-300 hover:text-gray-100 transition-all border border-dark-border"
          >
            <FiHelpCircle />
            <span>Learn More About Rankings</span>
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default TeamDetails;
