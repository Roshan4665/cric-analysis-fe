import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import SearchBar from './SearchBar';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-40 glass-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl"
            >
              🏏
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Cricket Analytics
              </h1>
            </div>
          </Link>

          <div className="flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {!isHome && (
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-dark-card hover:bg-primary/20 transition-colors"
                title="Home"
              >
                <FiHome className="text-xl text-gray-300" />
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
