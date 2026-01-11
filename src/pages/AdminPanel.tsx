import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { refreshHistoricalRankings } from '../services/api';
import type { TeamId, PlayerRole } from '../types/cricket';
import { TEAMS, ROLE_LABELS } from '../utils/constants';

interface RefreshStatus {
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
  newSnapshots?: number;
}

const AdminPanel = () => {
  const teams: TeamId[] = ['kr', 'ck', 'am', 'ag'];
  const roles: PlayerRole[] = ['batsman', 'bowler', 'allrounder'];

  const [refreshStatus, setRefreshStatus] = useState<Record<string, RefreshStatus>>({});

  const handleRefresh = async (teamId: TeamId, role: PlayerRole) => {
    const key = `${teamId}-${role}`;
    
    setRefreshStatus(prev => ({
      ...prev,
      [key]: { loading: true, success: false, error: false, message: '' }
    }));

    try {
      const result = await refreshHistoricalRankings(role, teamId);
      
      setRefreshStatus(prev => ({
        ...prev,
        [key]: {
          loading: false,
          success: result.success,
          error: !result.success,
          message: result.message || `Created ${result.totalSnapshots} snapshots`,
          newSnapshots: result.totalSnapshots
        }
      }));
    } catch (error: any) {
      setRefreshStatus(prev => ({
        ...prev,
        [key]: {
          loading: false,
          success: false,
          error: true,
          message: error.message || 'Failed to refresh rankings'
        }
      }));
    }
  };

  const handleRefreshAll = async () => {
    for (const team of teams) {
      for (const role of roles) {
        await handleRefresh(team, role);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">Refresh historical rankings for all teams and roles</p>
        </motion.div>

        {/* Refresh All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefreshAll}
            className="btn-primary px-6 py-3 flex items-center gap-2"
            disabled={Object.values(refreshStatus).some(s => s.loading)}
          >
            <FiRefreshCw className={Object.values(refreshStatus).some(s => s.loading) ? 'animate-spin' : ''} />
            Refresh All
          </motion.button>
        </motion.div>

        {/* Grid of Teams and Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((teamId) => (
            <motion.div
              key={teamId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TEAMS[teamId].color }}
                />
                <h2 className="text-lg font-bold text-gray-100">
                  {TEAMS[teamId].fullName}
                </h2>
              </div>

              <div className="space-y-3">
                {roles.map((role) => {
                  const key = `${teamId}-${role}`;
                  const status = refreshStatus[key];

                  return (
                    <div key={role} className="border border-dark-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {ROLE_LABELS[role]}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRefresh(teamId, role)}
                          disabled={status?.loading}
                          className={`p-2 rounded-lg transition-colors ${
                            status?.loading
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/80'
                          }`}
                        >
                          <FiRefreshCw
                            size={16}
                            className={status?.loading ? 'animate-spin' : ''}
                          />
                        </motion.button>
                      </div>

                      {status && (
                        <div className="mt-2">
                          {status.success && (
                            <div className="flex items-start gap-2 text-xs">
                              <FiCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={14} />
                              <span className="text-green-500">{status.message}</span>
                            </div>
                          )}
                          {status.error && (
                            <div className="flex items-start gap-2 text-xs">
                              <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                              <span className="text-red-500">{status.message}</span>
                            </div>
                          )}
                          {status.loading && (
                            <div className="text-xs text-gray-400">Refreshing...</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mt-8"
        >
          <h3 className="text-lg font-bold text-gray-100 mb-3">Information</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
            <li>This panel refreshes historical rankings for all combinations of teams and roles</li>
            <li>Each refresh creates snapshots for historical data tracking</li>
            <li>The system will skip creating snapshots if older ones already exist</li>
            <li>Use "Refresh All" to update all teams and roles sequentially</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
