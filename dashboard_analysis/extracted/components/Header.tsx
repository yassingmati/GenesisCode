
import React from 'react';
import { Zap, Bell, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 z-10 ml-64">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 cosmic-gradient rounded-lg flex items-center justify-center transform rotate-45">
          <div className="transform -rotate-45 text-white font-bold text-lg">C</div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Code<span className="text-blue-400">Genesis</span></h1>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium hover:text-blue-400 transition-colors">Cours</a>
        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Méthode</a>
        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pour qui?</a>
      </nav>

      {/* User Stats/Actions */}
      <div className="flex items-center gap-4">
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="bg-yellow-500/20 p-1 rounded-full">
             <div className="w-4 h-4 bg-yellow-500 rounded-full border border-white/20"></div>
          </div>
          <span className="text-sm font-bold">12 300 XP</span>
        </div>

        <button className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all">
          <Zap size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold">12 120 XP</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0f0a1e]">
              1
            </div>
          </button>
        </div>

        <div className="w-10 h-10 rounded-full cosmic-gradient flex items-center justify-center font-bold text-sm border-2 border-white/10 cursor-pointer hover:scale-105 transition-transform">
          MG
        </div>
      </div>
    </header>
  );
};

export default Header;
