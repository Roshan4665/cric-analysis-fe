import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TeamDetails from './pages/TeamDetails';
import PlayerProfile from './pages/PlayerProfile';
import AnimationPage from './pages/AnimationPage';
import Methodology from './pages/Methodology';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team/:teamId" element={<TeamDetails />} />
            <Route path="/team/:teamId/player/:playerId" element={<PlayerProfile />} />
            <Route path="/team/:teamId/player/:playerId/animation" element={<AnimationPage />} />
            <Route path="/methodology" element={<Methodology />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
