// src/admin/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminTaskManagement from '../../components/admin/AdminTaskManagement';
import {
  IconUsers,
  IconBook,
  IconCreditCard,
  IconFiles,
  IconTrendingUp,
  IconArrowUpRight,
  IconActivity
} from '@tabler/icons-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, payments: 0, contentItems: 0 });
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
    axios.get('/api/admin/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des données.');
        setLoading(false);
      });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={`text-${color.split('-')[1]}-600`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <IconArrowUpRight size={14} />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Dashboard <span className="text-indigo-600">Admin</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Vue d'ensemble de l'activité et des performances.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-2">
          <IconActivity size={20} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Utilisateurs Totaux"
          value={stats.users}
          icon={IconUsers}
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard
          title="Cours Actifs"
          value={stats.courses}
          icon={IconBook}
          color="bg-indigo-500"
          trend="+5%"
        />
        <StatCard
          title="Revenus (Mois)"
          value={`${stats.payments}€`}
          icon={IconCreditCard}
          color="bg-emerald-500"
          trend="+8.2%"
        />
        <StatCard
          title="Contenus Créés"
          value={stats.contentItems}
          icon={IconFiles}
          color="bg-purple-500"
          trend="+24%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <IconTrendingUp className="text-indigo-600" />
                Activité Hebdomadaire
              </h2>
              <p className="text-sm text-gray-400 mt-1">Engagement des utilisateurs sur les 7 derniers jours</p>
            </div>
            <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:bg-gray-100 transition-colors">
              <option>Cette semaine</option>
              <option>Semaine dernière</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {chartData.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
                <div className="relative w-full flex justify-end flex-col h-full">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ease-out group-hover:opacity-80 relative overflow-hidden ${item.color}`}
                    style={{ height: `${item.value}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-indigo-600 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Side Panel */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <h3 className="text-2xl font-bold mb-2 relative z-10">Mode Premium</h3>
          <p className="text-indigo-100 mb-8 relative z-10">Accédez aux fonctionnalités avancées d'administration.</p>

          <div className="space-y-4 relative z-10">
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left transition-all flex items-center gap-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <IconUsers size={20} />
              </div>
              <div>
                <div className="font-semibold">Gérer les accès</div>
                <div className="text-xs text-indigo-200">Permissions & Rôles</div>
              </div>
            </button>

            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left transition-all flex items-center gap-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <IconFiles size={20} />
              </div>
              <div>
                <div className="font-semibold">Rapports</div>
                <div className="text-xs text-indigo-200">Télécharger les stats</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Task Management Section */}
      <div className="mt-10">
        <AdminTaskManagement />
      </div>
    </div>
  );
}
