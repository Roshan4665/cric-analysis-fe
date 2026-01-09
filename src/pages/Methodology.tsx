import { motion } from 'framer-motion';
import { FiArrowLeft, FiActivity, FiTrendingUp, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back to Home
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Rating Methodology
          </h1>
          <p className="text-gray-400 text-lg">
            Understanding how player ratings are calculated
          </p>
        </motion.div>

        {/* Key Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Key Principles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-bg/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Context-Aware</h3>
              <p className="text-sm text-gray-400">
                Ratings account for match context, opponent strength, and positional difficulty
              </p>
            </div>
            
            <div className="bg-dark-bg/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Bayesian Smoothing</h3>
              <p className="text-sm text-gray-400">
                Confidence intervals adjust based on sample size to prevent early conclusions
              </p>
            </div>
            
            <div className="bg-dark-bg/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Temporal Decay</h3>
              <p className="text-sm text-gray-400">
                Recent performances carry more weight than older ones
              </p>
            </div>
            
            <div className="bg-dark-bg/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">Outlier Protection</h3>
              <p className="text-sm text-gray-400">
                Dampening functions prevent extreme performances from skewing ratings
              </p>
            </div>
          </div>
        </motion.div>

        {/* Batting Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <FiActivity className="text-primary text-xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
              Batting Rating System
            </h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed mb-4">
              The batting model is built on Context-Aware Performance Analysis and consistency, evaluating every run relative to the specific match conditions rather than raw totals. The algorithm normalizes a player's Strike Rate against the match aggregate, using a non-linear scaling function to reward high-impact scoring without creating outlier bias. It incorporates a Positional Difficulty Adjustment, progressively weighting runs scored by middle and lower-order batsmen to account for limited balls and high-pressure situations.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Furthermore, the system employs Bayesian Normalization to stabilize ratings for players with small sample sizes, while a time-decay factor ensures the rankings reflect current form over historical reputation.
            </p>
          </div>
        </motion.div>

        {/* Bowling Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <FiTrendingUp className="text-secondary text-xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
              Bowling Rating System
            </h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed mb-4">
              The bowling framework prioritizes Impact Efficiency, balancing wicket-taking ability with match-relative economy rates. We utilize a Workload Decay Model that assigns high value to initial impact while applying diminishing returns to sheer volume, preventing the system from over-rewarding defensive accumulation. Economy rates are assessed via a dampened ratio against the match's overall scoring pace, ensuring tight spells are rewarded relative to the pitch conditions.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The model also accounts for Phase Difficulty, applying multipliers for bowlers operating in the Powerplay, and adjusts all scores based on the calculated strength of the opposition batting lineup.
            </p>
          </div>
        </motion.div>

        {/* All-rounder Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <FiAward className="text-accent text-xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
              All-rounder Rating System
            </h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
              The all-rounder rating is a Composite Utility Metric derived from the geometric integration of batting and bowling scores. Unlike simple additive models, our system requires genuine competency in both disciplines; a player dominant in one skill but negligible in the other will not rank highly. The algorithm filters for "Effective Dual Participation," ensuring the leaderboard highlights true all-rounders who consistently influence the game's outcome with both bat and ball, rather than specialists with incidental secondary contributions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Methodology;
