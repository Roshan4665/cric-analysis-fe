import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHelpCircle } from 'react-icons/fi';
import TeamCard from '../components/TeamCard';
import type { TeamId } from '../types/cricket';

const Home = () => {
  const teams: TeamId[] = ['kr', 'ck', 'am', 'ag'];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Cricket Analytics Dashboard
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Track performance, analyze trends, and discover top performers
          </p>
          
          {/* Methodology Link */}
          <Link to="/methodology">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 rounded-lg text-gray-100 font-semibold transition-all border border-primary/30 mx-auto"
            >
              <FiHelpCircle className="text-xl" />
              Learn How Ratings Are Calculated
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {teams.map((teamId, index) => (
            <TeamCard key={teamId} teamId={teamId} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>
            Rankings based on last 10 matches • Click on any team to view detailed statistics
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
