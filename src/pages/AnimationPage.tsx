import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { getHistoricalRankings, getSnapshotDetails } from '../services/api';
import type { TeamId, PlayerRole } from '../types/cricket';
import { TEAMS, ROLE_LABELS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedTimeline from '../components/AnimatedTimeline';

const AnimationPage = () => {
  const { teamId, playerId } = useParams<{ teamId: TeamId; playerId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, playerName } = (location.state as any) || {};

  const [snapshotMetadata, setSnapshotMetadata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const team = teamId ? TEAMS[teamId] : null;

  useEffect(() => {
    if (!team || !playerId || !role) {
      navigate('/');
      return;
    }
    fetchSnapshotMetadata();
  }, [teamId, playerId, role]);

  const fetchSnapshotMetadata = async () => {
    if (!teamId || !playerId || !role) return;

    setLoading(true);
    try {
      const snapshots = await getHistoricalRankings(role as PlayerRole, teamId);
      
      const metadata = snapshots.snapshots.map(snapshot => ({
        snapshotId: snapshot.snapshotId,
        date: new Date(snapshot.firstMatchDate).toLocaleDateString(),
      }));
      setSnapshotMetadata(metadata);
    } catch (error) {
      console.error('Error fetching snapshot metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSnapshotData = async (snapshotId: string) => {
    const details = await getSnapshotDetails<any>(snapshotId);
    const player = details.rankings.find((p: any) => p.playerId === Number(playerId));
    
    if (player) {
      const rank = details.rankings.indexOf(player) + 1;
      return {
        rating: player.playerPoints,
        rank,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!team || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Animation not available</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/team/${teamId}/player/${playerId}`, { state: { role } })}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back to Profile
        </motion.button>

        {/* Player Info Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">
              {playerName || 'Player'} - Match-by-Match Performance
            </h1>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <span>{ROLE_LABELS[role as PlayerRole]}</span>
              <span>•</span>
              <span style={{ color: team.color }}>{team.fullName}</span>
            </div>
          </div>
        </motion.div>

        {/* Animation Timeline */}
        {snapshotMetadata.length > 0 && (
          <AnimatedTimeline
            snapshots={snapshotMetadata}
            playerId={Number(playerId)}
            fetchSnapshotData={fetchSnapshotData}
            title="Performance Animation"
          />
        )}

        {snapshotMetadata.length === 0 && (
          <div className="glass-card p-8 text-center text-gray-400">
            No historical data available for animation
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationPage;
