
import React, { useState } from 'react';
import { Rocket, Lightbulb, Trophy, ChevronRight, Check } from 'lucide-react';
import { COURSES, TASKS } from '../constants';
import CourseCard from './CourseCard';

const MainDashboard: React.FC = () => {
  const [tasks, setTasks] = useState(TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <main className="flex-1 p-8 ml-64 mr-80">
      {/* Greeting Banner */}
      <section className="relative glass-panel rounded-3xl p-8 mb-8 overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 via-transparent to-blue-500/10 opacity-50"></div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl animate-bounce">👋</span>
            <h2 className="text-3xl font-bold tracking-tight">Salut Maram, prêt à coder aujourd'hui ?</h2>
          </div>
          
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Rocket size={20} />
            Passer au niveau 26
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-20 animate-pulse delay-75">
          <div className="bg-yellow-400/20 p-3 rounded-full blur-sm">
            <Lightbulb className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="absolute bottom-4 right-10 opacity-20 group-hover:opacity-100 transition-opacity">
           <Trophy className="text-yellow-500" size={80} />
        </div>
      </section>

      {/* Recent Courses */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Cours récents</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COURSES.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button className="glass-panel px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-gray-300">
            Voir tous les cours <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Daily Tasks */}
      <section className="grid grid-cols-1 gap-8">
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Tâches du jour</h3>
          <ul className="space-y-4">
            {tasks.map(task => (
              <li 
                key={task.id} 
                className="flex items-center gap-4 group cursor-pointer"
                onClick={() => toggleTask(task.id)}
              >
                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                  task.completed 
                    ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                    : 'border-white/20 group-hover:border-white/40'
                }`}>
                  {task.completed && <Check size={14} className="text-white" />}
                </div>
                <span className={`text-sm font-medium transition-colors ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {task.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <button className="h-16 cosmic-gradient rounded-3xl flex items-center justify-center gap-3 font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform active:scale-95 group">
             <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             Commencer un nouvel exercice
           </button>
           <button className="h-16 glass-panel border-purple-500/50 rounded-3xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-white/10 transition-all">
             <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">GC</div>
             Continuer ton parcours GenesisCode
           </button>
        </div>
      </section>
    </main>
  );
};

export default MainDashboard;
