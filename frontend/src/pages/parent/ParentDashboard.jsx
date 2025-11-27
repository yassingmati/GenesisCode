import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskManagementWidget from '../../components/parent/TaskManagementWidget';
import PaymentControlWidget from '../../components/parent/PaymentControlWidget';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getApiUrl } from '../../utils/apiConfig';
import { Card, CardBody, User, Tabs, Tab, Button, Chip } from "@nextui-org/react";
import { IconLogout, IconSettings, IconPlus } from '@tabler/icons-react';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  CodeGenesis
                </span>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-600 mx-2"></div>
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t('parent.dashboard')}</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                color="primary"
                variant="solid"
                size="sm"
                startContent={<IconPlus size={16} />}
                onClick={() => window.location.href = '/parent/invite-child'}
                className="hidden sm:flex"
              >
                {t('parent.inviteChild')}
              </Button>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                startContent={<IconLogout size={16} />}
                onPress={handleLogout}
              >
                {t('parent.logout')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('parent.dashboard')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('parent.subtitle')}</p>
        </div>

        {children.length === 0 ? (
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <CardBody className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('parent.noChildren')}</p>
              <Button
                color="primary"
                variant="solid"
                startContent={<IconPlus size={18} />}
                onClick={() => window.location.href = '/parent/invite-child'}
              >
                {t('parent.inviteChild')}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar / Child Selector */}
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
                <CardBody className="p-4">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">{t('parent.myChildren')}</h3>
                  <div className="space-y-2">
                    {children.map((childData) => (
                      <div
                        key={childData.child._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3
                          ${selectedChild === childData.child._id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                        `}
                        onClick={() => setSelectedChild(childData.child._id)}
                      >
                        <User
                          name={
                            <span className="text-gray-900 dark:text-white font-medium">
                              {`${childData.child.firstName} ${childData.child.lastName}`}
                            </span>
                          }
                          description={
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">{childData.child.email}</span>
                              {childData.status === 'pending' && (
                                <Chip size="sm" color="warning" variant="flat" className="text-[10px] h-5">{t('parent.pending')}</Chip>
                              )}
                            </div>
                          }
                          avatarProps={{
                            src: `https://i.pravatar.cc/150?u=${childData.child._id}`,
                            isBordered: selectedChild === childData.child._id,
                            color: "primary",
                            size: "sm"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-3">
              {selectedChild && (
                <Card className="bg-white dark:bg-slate-800 shadow-sm min-h-[500px] border border-gray-200 dark:border-slate-700">
                  <CardBody className="p-6">
                    <Tabs
                      aria-label="Options"
                      color="primary"
                      variant="underlined"
                      size="lg"
                      classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-blue-500",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-blue-500 text-gray-500 dark:text-gray-400"
                      }}
                    >
                      <Tab key="tasks" title={t('parent.tabs.tasks')}>
                        <div className="mt-4">
                          <TaskManagementWidget childId={selectedChild} />
                        </div>
                      </Tab>
                      <Tab key="payments" title={t('parent.tabs.payments')}>
                        <div className="mt-4">
                          <PaymentControlWidget childId={selectedChild} />
                        </div>
                      </Tab>
                    </Tabs>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
