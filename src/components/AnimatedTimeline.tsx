import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SnapshotMetadata {
  snapshotId: string;
  date: string;
}

interface TimelineDataPoint {
  date: string;
  rating: number;
  rank: number;
}

interface AnimatedTimelineProps {
  snapshots: SnapshotMetadata[];
  playerId: number;
  fetchSnapshotData: (snapshotId: string) => Promise<{ rating: number; rank: number } | null>;
  title?: string;
}

const SPEED_OPTIONS = [
  { label: '1x', pointsPerSecond: 1 },
  { label: '2x', pointsPerSecond: 2 },
  { label: '4x', pointsPerSecond: 4 },
];

const AnimatedTimeline = ({ 
  snapshots, 
  fetchSnapshotData,
  title = 'Animated Performance Timeline' 
}: AnimatedTimelineProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedData, setLoadedData] = useState<TimelineDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0); // Default to 1x
  const intervalRef = useRef<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const pointsPerSecond = SPEED_OPTIONS[speedIndex].pointsPerSecond;
  const visibleData = loadedData.slice(0, currentIndex + 1);
  const currentPoint = loadedData[currentIndex];
  const progress = ((currentIndex + 1) / snapshots.length) * 100;

  // Animation interval - runs every 1 second
  useEffect(() => {
    if (isPlaying && currentIndex < snapshots.length) {
      intervalRef.current = window.setInterval(async () => {
        setIsLoading(true);
        
        // Calculate how many points to load based on speed multiplier
        const pointsToLoad = Math.min(pointsPerSecond, snapshots.length - loadedData.length);
        const startIdx = loadedData.length;
        const endIdx = startIdx + pointsToLoad;
        
        // Fetch multiple snapshots in parallel
        const fetchPromises = [];
        for (let i = startIdx; i < endIdx && i < snapshots.length; i++) {
          const snapshot = snapshots[i];
          fetchPromises.push(
            fetchSnapshotData(snapshot.snapshotId).then(data => {
              if (data) {
                return {
                  date: snapshot.date,
                  rating: data.rating,
                  rank: data.rank,
                };
              }
              return null;
            })
          );
        }
        
        try {
          const newDataPoints = await Promise.all(fetchPromises);
          const validDataPoints = newDataPoints.filter(d => d !== null) as TimelineDataPoint[];
          
          if (validDataPoints.length > 0) {
            setLoadedData(prev => [...prev, ...validDataPoints]);
            setCurrentIndex(prev => Math.min(prev + pointsPerSecond, snapshots.length - 1));
          }
        } catch (error) {
          console.error('Error loading snapshots:', error);
        } finally {
          setIsLoading(false);
        }
        
        // Check if we've reached the end
        if (loadedData.length + pointsToLoad >= snapshots.length) {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 1000); // Run every 1 second
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, snapshots, loadedData.length, fetchSnapshotData, pointsPerSecond]);

  // Auto-scroll to keep current point visible
  useEffect(() => {
    if (chartContainerRef.current && isPlaying) {
      const container = chartContainerRef.current;
      const scrollPercentage = (currentIndex / snapshots.length) * container.scrollWidth;
      container.scrollTo({
        left: scrollPercentage - container.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, isPlaying, snapshots.length]);

  const handlePlayPause = async () => {
    if (currentIndex >= snapshots.length - 1 && loadedData.length >= snapshots.length) {
      // Reset if at the end
      setCurrentIndex(0);
      setLoadedData([]);
    }
    
    // Load first batch if starting fresh
    if (currentIndex === 0 && loadedData.length === 0) {
      setIsLoading(true);
      try {
        const pointsToLoad = Math.min(pointsPerSecond, snapshots.length);
        const fetchPromises = [];
        
        for (let i = 0; i < pointsToLoad; i++) {
          const snapshot = snapshots[i];
          fetchPromises.push(
            fetchSnapshotData(snapshot.snapshotId).then(data => {
              if (data) {
                return {
                  date: snapshot.date,
                  rating: data.rating,
                  rank: data.rank,
                };
              }
              return null;
            })
          );
        }
        
        const newDataPoints = await Promise.all(fetchPromises);
        const validDataPoints = newDataPoints.filter(d => d !== null) as TimelineDataPoint[];
        
        if (validDataPoints.length > 0) {
          setLoadedData(validDataPoints);
          setCurrentIndex(pointsToLoad - 1);
        }
      } catch (error) {
        console.error('Error loading first batch:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setLoadedData([]);
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length);
  };

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 mt-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <>
                <FiPause className="text-lg" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <FiPlay className="text-lg" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeedChange}
            disabled={isLoading || isPlaying}
            className="px-4 py-2 bg-dark-card hover:bg-dark-card/70 rounded-lg text-gray-100 font-semibold transition-colors border border-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {SPEED_OPTIONS[speedIndex].label}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
            disabled={isLoading || isPlaying}
            className="p-2 bg-dark-card hover:bg-dark-card/70 rounded-lg text-gray-100 transition-colors border border-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
            title="Restart"
          >
            <FiRefreshCw className="text-lg" />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Snapshot {currentIndex + 1} of {snapshots.length}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-dark-bg/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current Point Info */}
      <AnimatePresence mode="wait">
        {currentPoint && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-dark-bg/30 rounded-lg p-4 mb-6"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="text-sm font-semibold text-gray-100">{currentPoint.date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Rating</div>
                <div className="text-xl font-bold text-primary">{currentPoint.rating.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Rank</div>
                <div className="text-xl font-bold text-accent">#{currentPoint.rank}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center text-sm text-gray-400 mb-4">
          Loading {pointsPerSecond} data point{pointsPerSecond > 1 ? 's' : ''}...
        </div>
      )}

      {/* Animated Chart */}
      <div
        ref={chartContainerRef}
        className="overflow-x-auto"
        style={{
          minWidth: '100%',
          maxHeight: '400px',
        }}
      >
        <div style={{ minWidth: Math.max(800, visibleData.length * 15) }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={Math.max(0, Math.floor(visibleData.length / 20))}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
                domain={[400, 1000]}
              />
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
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  const isLastPoint = index === visibleData.length - 1;
                  
                  if (isLastPoint) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="#fbbf24"
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    );
                  }
                  
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#00d084"
                    />
                  );
                }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-gray-500">
        {!isPlaying && currentIndex === 0 && `Press Play to see the animated timeline (${pointsPerSecond} point${pointsPerSecond > 1 ? 's' : ''} per second)`}
        {!isPlaying && currentIndex > 0 && currentIndex < snapshots.length - 1 && 'Paused - Press Play to continue'}
        {isPlaying && `Playing... (${pointsPerSecond} point${pointsPerSecond > 1 ? 's' : ''} per second)`}
        {currentIndex >= snapshots.length - 1 && loadedData.length >= snapshots.length && 'Animation complete - Press Play or Restart to watch again'}
      </div>
    </motion.div>
  );
};

export default AnimatedTimeline;
