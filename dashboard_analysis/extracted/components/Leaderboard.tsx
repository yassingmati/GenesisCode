
import React, { useState } from 'react';
import { Trophy, Star, Monitor } from 'lucide-react';
import { LEADERBOARD } from '../constants';

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('global');

  return (
    <aside className="w-80 h-screen fixed right-0 top-0 glass-panel p-6 flex flex-col z-10">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-blue-400" />
        <h2 className="text-xl font-bold">Classement</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-8">
        {['Global', 'Mois', 'Jour'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab.toLowerCase() ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {LEADERBOARD.map((user) => (
          <div key={user.rank} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
            <span className={`text-sm font-bold w-4 ${
              user.rank === 1 ? 'text-yellow-500' : 
              user.rank === 2 ? 'text-gray-400' : 
              user.rank === 3 ? 'text-orange-500' : 'text-gray-600'
            }`}>
              {user.rank}
            </span>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs border border-white/5 overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              {user.rank <= 3 && (
                <div className="absolute -top-1 -right-1">
                   <Trophy size={14} className={user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-orange-500'} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[11px] font-bold text-yellow-500">{user.xp} XP</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative Bottom Illustration */}
      <div className="mt-8 pt-6 border-t border-white/5 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0f0a1e] px-4 text-xs font-bold text-gray-500">
          Activité en direct
        </div>
        <div className="relative glass-panel rounded-2xl p-4 overflow-hidden bg-gradient-to-t from-purple-900/40 to-transparent">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                 <Monitor size={16} className="text-yellow-400" />
              </div>
              <div className="text-[10px]">
                <p className="text-white font-bold">Genesis Bot</p>
                <p className="text-gray-400">Prêt à t'aider !</p>
              </div>
           </div>
           {/* Simple Cat/Laptop Representation via styled divs */}
           <div className="flex justify-end mt-4">
              <div className="relative">
                <div className="w-12 h-10 bg-yellow-400 rounded-t-2xl relative">
                   <div className="absolute -top-2 left-1 w-3 h-3 bg-yellow-400 transform rotate-45"></div>
                   <div className="absolute -top-2 right-1 w-3 h-3 bg-yellow-400 transform rotate-45"></div>
                   <div className="flex gap-2 justify-center pt-3">
                     <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                   </div>
                </div>
                <div className="absolute -bottom-2 -left-8 w-20 h-1 bg-white/20 rounded-full"></div>
                <div className="absolute -right-12 bottom-0 w-16 h-12 glass-panel rounded-lg border-2 border-white/20 flex flex-col p-1">
                   <div className="w-full h-1 bg-blue-500 rounded-full mb-1"></div>
                   <div className="w-2/3 h-1 bg-white/10 rounded-full mb-1"></div>
                   <div className="w-1/2 h-1 bg-white/10 rounded-full"></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Leaderboard;
