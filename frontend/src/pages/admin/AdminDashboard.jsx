import React, { useEffect, useState } from 'react';
import { systemApi as api } from './components/common';
import { motion } from 'framer-motion';
import {
  IconUsers,
  IconBook,
  IconCreditCard,
  IconFiles,
  IconTrendingUp,
  IconArrowUpRight,
  IconActivity,
  IconShieldLock,
  IconDownload
} from '@tabler/icons-react';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, parents: 0 },
    content: { categories: 0, paths: 0, levels: 0, pdfs: 0, videos: 0 },
    payments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData] = useState([
    { label: 'Lun', value: 65, color: 'bg-blue-500' },
    { label: 'Mar', value: 82, color: 'bg-indigo-500' },
    { label: 'Mer', value: 47, color: 'bg-purple-500' },
    { label: 'Jeu', value: 73, color: 'bg-pink-500' },
    { label: 'Ven', value: 91, color: 'bg-rose-500' },
    { label: 'Sam', value: 58, color: 'bg-orange-500' },
    { label: 'Dim', value: 34, color: 'bg-amber-500' },
  ]);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des données.');
        setLoading(false);
      });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }) => (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-xl ${gradient} text-white group hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
          <Icon size={28} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
            <IconArrowUpRight size={14} />
            {trend}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-white/80 text-sm font-medium mb-1 tracking-wide uppercase">{title}</h3>
        <p className="text-4xl font-extrabold tracking-tight drop-shadow-sm">{value}</p>
        {subtitle && <p className="text-white/60 text-xs mt-1 font-medium">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 relative z-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0f172a] p-8 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2 tracking-tight"
            >
              Dashboard <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 text-lg font-medium"
            >
              Vue d'ensemble de l'écosystème CodeGenesis.
            </motion.p>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 border border-red-100 dark:border-red-800 flex items-center gap-3 shadow-sm"
          >
            <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
              <IconActivity size={20} />
            </div>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* User Stats */}
          <StatCard
            title="Étudiants"
            value={stats.users?.students || 0}
            icon={IconUsers}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            subtitle={`${stats.users?.total || 0} utilisateurs au total`}
            trend="+12%"
          />
          <StatCard
            title="Parents"
            value={stats.users?.parents || 0}
            icon={IconUsers}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
            trend="+5%"
          />

          {/* Content Stats */}
          <StatCard
            title="Cours & Catégories"
            value={stats.content?.categories || 0}
            subtitle={`${stats.content?.paths || 0} Parcours, ${stats.content?.levels || 0} Niveaux`}
            icon={IconBook}
            gradient="bg-gradient-to-br from-violet-500 to-purple-700"
            trend="+8%"
          />

          <StatCard
            title="Médias"
            value={(stats.content?.pdfs || 0) + (stats.content?.videos || 0)}
            subtitle={`${stats.content?.pdfs || 0} PDFs, ${stats.content?.videos || 0} Vidéos`}
            icon={IconFiles}
            gradient="bg-gradient-to-br from-pink-500 to-rose-700"
            trend="+15%"
          />

          {/* Financial Stats */}
          <StatCard
            title="Revenus (Mois)"
            value={`${stats.payments}€`}
            icon={IconCreditCard}
            gradient="bg-gradient-to-br from-emerald-400 to-teal-700"
            trend="+8.2%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-[#1e293b]/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <IconTrendingUp size={24} />
                  </div>
                  Activité Hebdomadaire
                </h2>
                <p className="text-sm text-gray-400 mt-1 ml-14">Engagement des utilisateurs sur les 7 derniers jours</p>
              </div>
              <select className="bg-gray-50 dark:bg-white/5 border-none text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <option>Cette semaine</option>
                <option>Semaine dernière</option>
              </select>
            </div>

            <div className="h-72 flex items-end justify-between gap-6 px-4 pb-2">
              {chartData.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-4 flex-1 group cursor-pointer h-full justify-end">
                  <div className="relative w-full flex-grow flex items-end">
                    <div
                      className={`w-full rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-90 relative overflow-hidden ${item.color} shadow-lg shadow-indigo-500/20`}
                      style={{ height: `${item.value}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] dark:from-[#2d3748] dark:to-[#1a202c] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10 h-full flex flex-col justify-between">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-16 -mt-16 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full -ml-10 -mb-10 blur-[60px]"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <IconShieldLock className="text-indigo-400" />
                  Admin Center
                </h3>
                <p className="text-gray-400 mb-8 max-w-[200px] leading-relaxed">Gérez les accès et les rapports de la plateforme.</p>

                <div className="space-y-4">
                  <button className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left transition-all flex items-center gap-4 group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
                    <div className="bg-indigo-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform text-indigo-400">
                      <IconUsers size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">Gérer les accès</div>
                      <div className="text-xs text-gray-500 mt-0.5">Permissions & Rôles</div>
                    </div>
                  </button>

                  <button className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left transition-all flex items-center gap-4 group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                    <div className="bg-purple-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform text-purple-400">
                      <IconDownload size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-300 transition-colors">Rapports</div>
                      <div className="text-xs text-gray-500 mt-0.5">Télécharger les stats</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
