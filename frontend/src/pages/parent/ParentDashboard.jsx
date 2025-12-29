import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskManagementWidget from '../../components/parent/TaskManagementWidget';
import PaymentControlWidget from '../../components/parent/PaymentControlWidget';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getApiUrl } from '../../utils/apiConfig';
import { Card, CardBody, User, Tabs, Tab, Button, Chip, Avatar, Tooltip } from "@nextui-org/react";
import { IconLogout, IconSettings, IconPlus, IconUser, IconChartBar, IconCreditCard, IconTrash } from '@tabler/icons-react';


import ThemeToggle from '../../components/ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/parent/children'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des enfants');
      }

      const data = await response.json();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0].child._id);
      }
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChild = async (childId, e) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir retirer cet enfant de votre liste ? Cette action est irréversible et supprimera l'historique de suivi.")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/parent/children/${childId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // childId passed to this function is now the RELATION ID (_id)
        const relationId = childId;

        // Find the deleted relation to check if it was selected
        const deletedRelation = children.find(c => c._id === relationId);
        const wasSelected = deletedRelation && deletedRelation.child && deletedRelation.child._id === selectedChild;

        setChildren(prev => prev.filter(c => c._id !== relationId));

        if (wasSelected) {
          setSelectedChild(null);
        }
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      {/* Navbar Premium */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis Logo" className="h-10 w-auto relative z-10" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  CodeGenesis
                </span>
              </Link>
              <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
              <span className="text-gray-500 dark:text-slate-400 font-medium hidden md:block tracking-wide text-sm uppercase">
                Espace Parent
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                color="primary"
                variant="shadow"
                radius="full"
                className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600"
                startContent={<IconPlus size={18} />}
                onClick={() => window.location.href = '/parent/invite-child'}
              >
                {t('parent.inviteChild')}
              </Button>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                radius="full"
                onPress={handleLogout}
              >
                <IconLogout size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-slate-400">
              Suivez la progression et gérez les accès de vos enfants.
            </p>
          </div>
        </div>

        {children.length === 0 ? (
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-gray-200 dark:border-slate-800 shadow-xl min-h-[400px] flex items-center justify-center">
            <CardBody className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconUser size={48} className="text-blue-500 opacity-80" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bienvenue sur CodeGenesis</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                Connectez le compte de votre enfant pour commencer à suivre ses progrès et gérer son apprentissage.
              </p>
              <Button
                size="lg"
                color="primary"
                variant="shadow"
                radius="full"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-lg"
                startContent={<IconPlus size={20} />}
                onClick={() => window.location.href = '/parent/invite-child'}
              >
                Inviter un enfant
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Sidebar / Child Selector */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28 z-10">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4 lg:mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mes Enfants</h3>
                  <span className="lg:hidden text-xs text-primary font-medium">Défiler →</span>
                </div>

                <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-4 lg:space-y-3 scrollbar-hide snap-x">
                  {children.map((childData) => (
                    <div
                      key={childData.child._id}
                      onClick={() => setSelectedChild(childData.child._id)}
                      className={`
                          group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 min-w-[260px] lg:w-full shrink-0 snap-center
                          ${selectedChild === childData.child._id
                          ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500 shadow-md'
                          : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-gray-200 dark:hover:border-slate-700'}
                        `}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={`https://i.pravatar.cc/150?u=${childData.child._id}`}
                          size="md"
                          isBordered
                          color={selectedChild === childData.child._id ? "primary" : "default"}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold truncate transition-colors ${selectedChild === childData.child._id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                            {childData.child.firstName}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{childData.child.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {childData.status === 'pending' && (
                            <Tooltip content="Invitation en attente">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            </Tooltip>
                          )}
                          <button
                            onClick={(e) => handleRemoveChild(childData._id, e)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-20 relative"
                            title="Retirer l'enfant"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Button in horizontal list for easy access */}
                  <div
                    onClick={() => window.location.href = '/parent/invite-child'}
                    className="lg:hidden flex items-center justify-center p-4 rounded-2xl cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 min-w-[260px] shrink-0 text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <IconPlus size={20} />
                      <span>Ajouter un enfant</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 hidden lg:block">
                  <Button
                    variant="light"
                    color="primary"
                    startContent={<IconPlus size={16} />}
                    className="w-full justify-start font-medium"
                    onClick={() => window.location.href = '/parent/invite-child'}
                  >
                    Ajouter un enfant
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {selectedChild && (() => {
                const currentChild = children.find(c => c.child._id === selectedChild);
                if (currentChild?.status === 'pending') {
                  return (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/20 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center">
                      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <IconUser size={40} className="text-amber-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Invitation en attente</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                        La demande de suivi a été envoyée à <strong>{currentChild.child.email}</strong>.
                        L'accès aux données sera débloqué une fois que l'enfant aura accepté votre invitation.
                      </p>
                      <Chip color="warning" variant="flat" size="lg">En attente de confirmation</Chip>
                    </div>
                  );
                }

                return (
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-1 shadow-2xl border border-white/20 dark:border-slate-800">
                    <Tabs
                      aria-label="Options"
                      color="primary"
                      variant="bordered"
                      radius="full"
                      size="lg"
                      classNames={{
                        base: "w-full p-2 h-auto",
                        tabList: "w-full bg-gray-100/50 dark:bg-slate-950/50 p-1 border border-white/10 dark:border-slate-800 flex-col md:flex-row h-auto",
                        cursor: "bg-white dark:bg-slate-800 shadow-sm",
                        tab: "h-12 font-medium text-gray-600 dark:text-gray-400 data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-white transition-colors",
                        tabContent: "group-data-[selected=true]:font-bold"
                      }}
                    >
                      <Tab
                        key="tasks"
                        title={
                          <div className="flex items-center gap-2">
                            <IconChartBar size={18} />
                            <span>Progression & Suivi</span>
                          </div>
                        }
                      >
                        <div className="p-3 md:p-8">
                          <TaskManagementWidget childId={selectedChild} />
                        </div>
                      </Tab>
                      <Tab
                        key="payments"
                        title={
                          <div className="flex items-center gap-2">
                            <IconCreditCard size={18} />
                            <span>Abonnements & Contrôles</span>
                          </div>
                        }
                      >
                        <div className="p-3 md:p-8">
                          <PaymentControlWidget childId={selectedChild} />
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
