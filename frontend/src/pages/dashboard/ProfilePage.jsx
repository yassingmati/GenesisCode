import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../utils/apiConfig';
import ParentInvitationSection from '../../components/ParentInvitationSection';
import AvatarSelector from '../../components/profile/AvatarSelector';
import { Card, CardBody, CardHeader, Button, Input, Avatar, Tabs, Tab, Chip, Progress, Divider, Spacer, Tooltip } from "@nextui-org/react";
import Badge from '../../components/gamification/Badge';
import { IconUser, IconLock, IconTrophy, IconPremiumRights, IconUsers, IconEdit, IconCamera, IconDeviceFloppy, IconLogout, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from 'react-hot-toast';

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

  // Form states
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadProfile();
  }, []);

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
                <Chip startContent={<IconPremiumRights size={16} />} color={user?.subscription?.status === 'active' ? "success" : "default"} variant="flat" className="backdrop-blur-md bg-white/20 text-white">
                  {user?.subscription?.status === 'active' ? 'Premium' : 'Gratuit'}
                </Chip>
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
                <Button color="danger" variant="flat" startContent={<IconAlertTriangle />}>
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
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {p.completed ? '✓' : '⚡'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{p.exercise?.title || "Exercice"}</p>
                              <p className="text-xs text-gray-500">{formatDate(p.updatedAt)}</p>
                            </div>
                          </div>
                          <Chip size="sm" color={p.completed ? "success" : "primary"} variant="flat">{p.xp || 0} XP</Chip>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>Aucun progrès enregistré pour le moment.</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="px-6 py-4 border-b border-divider">
                  <h3 className="text-lg font-semibold">Badges</h3>
                </CardHeader>
                <CardBody className="p-4 grid grid-cols-3 gap-2">
                  {user?.badges?.length > 0 ? user.badges.map((b, i) => (
                    <div key={i} className="flex justify-center">
                      <Badge badgeId={b} size="md" showTitle={true} />
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-8 text-gray-400">
                      <IconTrophy size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Complétez des exercices pour gagner des badges !</p>
                    </div>
                  )}
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
            <div className="mt-4">
              {/* We simply reuse the improved subscription logic but styled with NextUI */}
              <Card className={`border-2 ${user?.subscription?.status === 'active' ? 'border-primary' : 'border-gray-200'}`}>
                <CardBody className="p-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    {user?.subscription?.status === 'active' ? <IconPremiumRights size={40} /> : <IconLock size={40} />}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {user?.subscription?.status === 'active' ? 'Abonnement Premium Actif' : 'Abonnement Gratuit'}
                  </h2>
                  <p className="text-gray-500 max-w-lg mb-8">
                    {user?.subscription?.status === 'active'
                      ? `Votre abonnement est actif jusqu'au ${formatDate(user?.subscription?.currentPeriodEnd)}. Profitez de l'accès illimité !`
                      : "Débloquez tout le potentiel de la plateforme avec notre abonnement Premium. Accès illimité à tous les cours et exercices."}
                  </p>

                  {user?.subscription?.status !== 'active' && (
                    <Button color="primary" size="lg" className="font-bold shadow-lg shadow-primary/40">
                      Voir les offres Premium
                    </Button>
                  )}
                </CardBody>
              </Card>
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