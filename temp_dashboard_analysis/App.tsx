
import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainDashboard from './components/MainDashboard';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Decorative Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 relative">
          <MainDashboard />
          <Leaderboard />
        </div>
      </div>

      {/* Optional Overlay for Mobile message */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Dashboard optimisé pour ordinateur</h2>
          <p className="text-gray-400">Veuillez utiliser un écran plus large pour profiter de l'expérience complète de CodeGenesis.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
