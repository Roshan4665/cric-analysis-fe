import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"></div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
