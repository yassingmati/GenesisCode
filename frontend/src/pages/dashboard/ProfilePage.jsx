import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiConfig';
import ParentInvitationSection from '../../components/ParentInvitationSection';
import AvatarSelector from '../../components/profile/AvatarSelector';
import { Card, CardBody, CardHeader, Button, Input, Avatar, Tabs, Tab, Chip, Progress, Divider, Spacer, Tooltip } from "@nextui-org/react";
import Badge from '../../components/gamification/Badge';
import { IconUser, IconLock, IconTrophy, IconPremiumRights, IconUsers, IconEdit, IconCamera, IconDeviceFloppy, IconLogout, IconAlertTriangle, IconCheck, IconListCheck } from "@tabler/icons-react";
import { toast } from 'react-hot-toast';
import { BADGES } from '../../config/badges';

const API_BASE = getApiUrl('/api');

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("general");

  // Form states
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['general', 'security', 'progress', 'subscription', 'family'].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users/profile`, { headers: getAuthHeader() });
      const userData = res.data.user || res.data;
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || ''
      });
      loadProgress(userData._id || userData.id);
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/users/progress/${userId}`, { headers: getAuthHeader() });
      if (res.data) setProgressData(res.data);
    } catch (err) {
      console.warn('Error loading progress:', err);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        avatar: user.avatar // Preserve avatar if not changed here
      };
      const res = await axios.put(`${API_BASE}/users/profile`, payload, { headers: getAuthHeader() });
      const updated = res.data.user || res.data;
      setUser(updated);
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (newAvatar) => {
    // Optimistic update
    const previousAvatar = user.avatar;
    setUser(prev => ({ ...prev, avatar: newAvatar }));

    try {
      // Assuming the API accepts avatar in the PUT /profile endpoint
      await axios.put(`${API_BASE}/users/profile`, { avatar: newAvatar }, { headers: getAuthHeader() });
      toast.success("Avatar modifié !");
    } catch (err) {
      console.error('Avatar update error:', err);
      toast.error("Erreur lors du changement d'avatar");
      setUser(prev => ({ ...prev, avatar: previousAvatar })); // Revert
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setSaving(true);
    try {
      // Implement password change endpoint call here
      // const res = await axios.put(`${API_BASE}/users/change-password`, { 
      //   currentPassword: passwordData.current, 
      //   newPassword: passwordData.new 
      // }, { headers: getAuthHeader() });

      // MOCK for now until endpoint is confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Mot de passe modifié avec succès (Simulation)");
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Password error:', err);
      toast.error(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
      return;
    }

    setSaving(true);
    try {
      await axios.delete(`${API_BASE}/users/${user._id}`, { headers: getAuthHeader() });
      toast.success("Compte supprimé avec succès");

      // Cleanup and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(err.response?.data?.message || "Erreur lors de la suppression du compte");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <AvatarSelector
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarChange}
        currentAvatar={user?.avatar}
      />

      {/* Header Profile Card */}
      <Card className="w-full bg-gradient-to-r from-indigo-900 to-purple-900 text-white overflow-visible mb-8">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <Avatar
                src={user?.avatar}
                className="w-24 h-24 md:w-32 md:h-32 text-4xl border-4 border-white/20"
                isBordered
                color="secondary"
                name={user?.firstName?.charAt(0)}
              />
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 p-2 bg-secondary text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
              >
                <IconCamera size={20} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 truncate">{user?.firstName} {user?.lastName}</h1>
              <p className="text-white/70 mb-4 truncate">{user?.email}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Chip startContent={<IconTrophy size={16} />} color="warning" variant="solid" className="bg-yellow-500/90 text-black font-bold">
                  Niveau {Math.floor((progressData.reduce((acc, p) => acc + (p.xp || 0), 0) / 1000) + 1)}
                </Chip>
                {(() => {
                  const activeSubscription = user?.subscriptions?.find(sub =>
                    sub.status === 'active' && new Date(sub.currentPeriodEnd) > new Date()
                  );
                  return (
                    <Chip startContent={<IconPremiumRights size={16} />} color={activeSubscription ? "success" : "default"} variant="flat" className="backdrop-blur-md bg-white/20 text-white">
                      {activeSubscription ? 'Premium' : 'Gratuit'}
                    </Chip>
                  );
                })()}
              </div>
            </div>

            <div className="w-full md:w-64 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>XP Total</span>
                <span className="font-bold text-yellow-300">{progressData.reduce((acc, p) => acc + (p.xp || 0), 0)} XP</span>
              </div>
              <Progress
                value={(progressData.reduce((acc, p) => acc + (p.xp || 0), 0) % 1000) / 10}
                classNames={{ indicator: "bg-yellow-400" }}
                size="sm"
              />
              <p className="text-xs text-white/50 mt-2 text-right">Prochain niveau à 1000 XP</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          aria-label="Options"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider min-w-[600px] md:min-w-0",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          <Tab
            key="general"
            title={
              <div className="flex items-center space-x-2">
                <IconUser size={18} />
                <span>Informations</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardHeader className="px-6 py-4 border-b border-divider">
                <h3 className="text-lg font-semibold">Informations personnelles</h3>
              </CardHeader>
              <CardBody className="p-6 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    variant="bordered"
                  />
                  <Input
                    label="Nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    variant="bordered"
                  />
                  <Input
                    label="Email"
                    value={user?.email}
                    isReadOnly
                    color="default"
                    variant="flat"
                    description="Contactez le support pour changer d'email"
                  />
                  <Input
                    label="Téléphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    variant="bordered"
                    placeholder="+216 ..."
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button color="primary" isLoading={saving} startContent={<IconDeviceFloppy />} onPress={handleUpdateProfile}>
                    Enregistrer les modifications
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="security"
            title={
              <div className="flex items-center space-x-2">
                <IconLock size={18} />
                <span>Sécurité</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardHeader className="px-6 py-4 border-b border-divider">
                <h3 className="text-lg font-semibold">Mot de passe</h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="max-w-md space-y-4">
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    variant="bordered"
                  />
                  <Divider className="my-2" />
                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    variant="bordered"
                  />
                  <Input
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    variant="bordered"
                    errorMessage={passwordData.confirm && passwordData.new !== passwordData.confirm ? "Les mots de passe ne correspondent pas" : ""}
                  />
                  <Button color="secondary" className="mt-2" onPress={handleChangePassword} isLoading={saving}>
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="mt-6 border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardHeader className="text-danger font-bold">Zone Dangereuse</CardHeader>
              <CardBody className="flex flex-row justify-between items-center p-6">
                <div>
                  <h4 className="font-semibold text-danger-600">Supprimer le compte</h4>
                  <p className="text-sm text-gray-500">Une fois supprimé, votre compte ne peut plus être récupéré.</p>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<IconAlertTriangle />}
                  onPress={handleDeleteAccount}
                  isLoading={saving}
                >
                  Supprimer
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="progress"
            title={
              <div className="flex items-center space-x-2">
                <IconTrophy size={18} />
                <span>Mes Progrès</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <Card className="md:col-span-2">
                <CardHeader className="px-6 py-4 border-b border-divider">
                  <h3 className="text-lg font-semibold">Exercices Récents</h3>
                </CardHeader>
                <CardBody className="p-0">
                  {progressData.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {progressData.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${p.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                              {p.completed ? <IconCheck size={24} /> : <IconTrophy size={24} />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100">
                                {p.exercise?.title || `Exercice ${p.exercise?._id?.substring(0, 6) || '#' + (i + 1)}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{formatDate(p.updatedAt)}</span>
                                {p.completed && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30">
                                    Complété
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Chip size="sm" color={p.completed ? "success" : "primary"} variant="flat" className="font-bold">
                              {p.xp || 0} XP
                            </Chip>
                            {p.bestScore > 0 && (
                              <span className="text-[10px] text-gray-400">Score: {p.bestScore}/{p.pointsMax}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <IconListCheck size={32} className="text-gray-400" />
                      </div>
                      <h4 className="text-gray-900 dark:text-gray-100 font-medium mb-1">Aucune activité récente</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                        Commencez des exercices pour voir votre progression s'afficher ici !
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="px-6 py-4 border-b border-divider flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Badges</h3>
                  <Chip size="sm" variant="flat" color="secondary">
                    {user?.badges?.length || 0} / {Object.keys(BADGES).length}
                  </Chip>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {Object.values(BADGES).map((badge) => {
                      const isUnlocked = user?.badges?.includes(badge.id);
                      return (
                        <Tooltip key={badge.id} content={isUnlocked ? badge.description : "Verrouillé : " + badge.description}>
                          <div className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${isUnlocked ? 'bg-content2 hover:bg-content3 cursor-pointer' : 'opacity-40 grayscale'}`}>
                            <Badge badgeId={badge.id} size="md" showTitle={false} />
                            <span className="text-[10px] text-center font-medium leading-tight line-clamp-2">
                              {badge.title}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab
            key="subscription"
            title={
              <div className="flex items-center space-x-2">
                <IconPremiumRights size={18} />
                <span>Abonnement</span>
              </div>
            }
          >
            <div className="mt-4 flex flex-col gap-4">
              {/* Logic to find all active subscriptions and category accesses */}
              {(() => {
                // 1. Plan Subscriptions
                const activePlanSubs = user?.subscriptions?.filter(sub =>
                  sub.status === 'active' && new Date(sub.currentPeriodEnd) > new Date()
                ) || [];

                // 2. Category Accesses (considered as subscriptions)
                const activeCategoryAccess = user?.categoryAccess?.filter(access =>
                  access.status === 'active' && (!access.expiresAt || new Date(access.expiresAt) > new Date())
                ) || [];

                const allItems = [
                  ...activePlanSubs.map(s => ({ ...s, type: 'subscription', title: s.plan?.name || s.plan?.title || 'Abonnement Premium' })),
                  ...activeCategoryAccess.map(a => {
                    // Category names are in translations.fr.name
                    const catName = a.category?.translations?.fr?.name ||
                      a.category?.translations?.en?.name ||
                      a.category?.translations?.ar?.name ||
                      'Accès Cours';
                    return { ...a, type: 'access', title: catName, currentPeriodEnd: a.expiresAt };
                  })
                ];

                if (allItems.length > 0) {
                  return allItems.map((item, index) => (
                    <div key={item._id || index} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                      {/* Decorative Gradient Background */}
                      <div className={`absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 bg-gradient-to-br ${item.type === 'subscription' ? 'from-purple-600 to-blue-600' : 'from-emerald-500 to-teal-500'}`} />

                      {/* Content */}
                      <div className="relative p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Icon Container */}
                        <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.type === 'subscription' ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-purple-500/20' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'}`}>
                          {item.type === 'subscription' ? <IconPremiumRights size={32} /> : <IconTrophy size={32} />}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                              {item.title}
                            </h3>
                            <Chip size="sm" variant="shadow" classNames={{ base: item.type === 'subscription' ? "bg-gradient-to-r from-purple-500 to-blue-500 border border-white/20" : "bg-gradient-to-r from-emerald-500 to-teal-500 border border-white/20", content: "font-bold text-white tracking-wide" }}>
                              {item.currentPeriodEnd ? 'ACTIF' : 'À VIE'}
                            </Chip>
                          </div>

                          <p className="text-slate-400 text-sm mb-4">
                            {item.description || (item.type === 'subscription' ? "Accès illimité à toute la plateforme" : "Accès complet au contenu de ce cours")}
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                              <IconDeviceFloppy size={14} className={item.type === 'subscription' ? "text-blue-400" : "text-emerald-400"} />
                              <span>
                                {item.currentPeriodEnd
                                  ? `Expire le ${formatDate(item.currentPeriodEnd)}`
                                  : 'Valide à perpétuité'}
                              </span>
                            </div>
                            {item.autoRenew && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-purple-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                <span>Renouvellement auto</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                }

                return (
                  <Card className="border-none bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-xl">
                    <CardBody className="p-8 flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-gray-400 ring-8 ring-gray-50 dark:ring-slate-800/50">
                        <IconLock size={48} stroke={1.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Aucun abonnement actif</h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                        Passez à la vitesse supérieure ! Débloquez l'accès illimité à tous nos parcours et exercices interactifs.
                      </p>
                      <Button
                        color="primary"
                        size="lg"
                        className="font-bold shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-purple-600"
                        endContent={<IconPremiumRights />}
                      >
                        Découvrir les offres Premium
                      </Button>
                    </CardBody>
                  </Card>
                );
              })()}
            </div>
          </Tab>

          <Tab
            key="family"
            title={
              <div className="flex items-center space-x-2">
                <IconUsers size={18} />
                <span>Famille</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <ParentInvitationSection user={user} />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div >
  );
}
