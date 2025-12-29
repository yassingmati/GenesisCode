
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { Trophy, Star, Zap } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen glass-panel fixed left-0 top-0 flex flex-col p-6 z-10">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <img 
            src="https://picsum.photos/seed/maram/100/100" 
            alt="Avatar" 
            className="w-12 h-12 rounded-lg border-2 border-purple-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-[#1a1333]"></div>
        </div>
        <div>
          <h2 className="text-sm font-bold truncate">Maram Guenouati</h2>
          <p className="text-[10px] text-gray-400 truncate">maramguenouati@gmail.com</p>
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {MENU_ITEMS.map((item, idx) => (
            <li key={idx}>
              <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-purple-600/30 text-white border-l-4 border-purple-500 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                {item.active && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Progress Cards */}
      <div className="mt-auto space-y-4">
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8"></div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-bold bg-purple-900/50">
               25
             </div>
             <div>
               <p className="text-xs font-bold">Niveau 25</p>
               <div className="flex gap-1">
                 <Star size={10} className="text-yellow-500 fill-yellow-500" />
                 <Star size={10} className="text-gray-600" />
                 <Star size={10} className="text-gray-600" />
               </div>
             </div>
           </div>
           <p className="text-[10px] text-gray-400 mb-1">✨ 300 XP pour atteindre le niveau 26</p>
           <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
             <div className="bg-purple-500 h-full" style={{ width: '70%' }}></div>
           </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
               <Trophy size={14} className="text-yellow-500" />
               <span className="text-xs font-bold">Level 25</span>
             </div>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Badge(s) obtenus: 8</p>
          
          <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
               <Zap size={14} className="text-yellow-500" />
               <span className="text-xs font-bold">XP total: 12 120 XP</span>
             </div>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
             <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-[9px] text-center text-gray-500">300 XP pour atteindre le niveau 26</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
