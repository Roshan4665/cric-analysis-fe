import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { getTopPerformers } from '../services/api';
import type { TeamId, BatsmanRanking, BowlerRanking, AllrounderRanking } from '../types/cricket';
import { TEAMS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';

interface TeamCardProps {
  teamId: TeamId;
  index: number;
}

interface TopPerformers {
  batsman: BatsmanRanking[];
  bowler: BowlerRanking[];
  allrounder: AllrounderRanking[];
}

const TeamCard = ({ teamId, index }: TeamCardProps) => {
  const [performers, setPerformers] = useState<TopPerformers | null>(null);
  const [loading, setLoading] = useState(true);
  const team = TEAMS[teamId];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopPerformers(teamId, 10);
        setPerformers(data);
      } catch (error) {
        console.error(`Error fetching data for ${teamId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card p-6"
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-12 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{team.name}</h2>
            <p className="text-sm text-gray-400">{team.fullName}</p>
          </div>
        </div>
        <div className="text-3xl">🏏</div>
      </div>

      <div className="space-y-4">
        {/* Top Batsman */}
        {performers?.batsman[0] && (
          <div className="bg-dark-bg/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-primary">TOP BATSMAN</span>
              <FiTrendingUp className="text-primary text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{performers.batsman[0].playerName}</p>
                <p className="text-xs text-gray-400">
                  Avg: {performers.batsman[0].battingAverage.toFixed(1)} • SR: {performers.batsman[0].strikeRate.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {performers.batsman[0].playerPoints.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Bowler */}
        {performers?.bowler[0] && (
          <div className="bg-dark-bg/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-secondary">TOP BOWLER</span>
              <FiTrendingUp className="text-secondary text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{performers.bowler[0].playerName}</p>
                <p className="text-xs text-gray-400">
                  Avg: {performers.bowler[0].bowlingAverage.toFixed(1)} • Econ: {performers.bowler[0].economy.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-secondary">
                  {performers.bowler[0].playerPoints.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Allrounder */}
        {performers?.allrounder[0] && (
          <div className="bg-dark-bg/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-accent">TOP ALLROUNDER</span>
              <FiTrendingUp className="text-accent text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{performers.allrounder[0].playerName}</p>
                <p className="text-xs text-gray-400">
                  Bat Avg: {performers.allrounder[0].battingAverage.toFixed(1)} • Bowl Avg: {performers.allrounder[0].bowlingAverage.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-accent">
                  {performers.allrounder[0].playerPoints.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link to={`/team/${teamId}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 rounded-lg flex items-center justify-center gap-2 text-gray-100 font-semibold transition-all"
        >
          View Full Rankings
          <FiArrowRight />
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default TeamCard;
