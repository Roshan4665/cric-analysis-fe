import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchPlayers } from '../services/api';
import { TEAMS, ROLE_LABELS } from '../utils/constants';
import type { SearchResult } from '../types/cricket';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await searchPlayers(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(`/team/${result.teamId}/player/${result.playerId}`, {
      state: { role: result.role },
    });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <motion.div
        className="relative"
        initial={false}
        animate={{ scale: isOpen ? 1.02 : 1 }}
      >
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search players..."
          className="w-full pl-12 pr-12 py-3 bg-dark-card border border-dark-border rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-dark-card/95 backdrop-blur-lg border border-dark-border rounded-xl max-h-[400px] overflow-y-auto z-50 shadow-2xl"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <motion.button
                    key={`${result.playerId}-${result.teamId}-${result.role}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-bg/50 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-100">
                          {result.playerName}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: TEAMS[result.teamId].color + '30',
                            color: TEAMS[result.teamId].color,
                          }}
                        >
                          {TEAMS[result.teamId].name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {ROLE_LABELS[result.role]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {result.currentRating?.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                No players found
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Type at least 2 characters to search
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
