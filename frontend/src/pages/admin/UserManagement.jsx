import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Tooltip } from "@nextui-org/react";
import { IconDotsVertical, IconTrash, IconUserShield, IconSearch, IconRefresh } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';
import { motion } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRoles, setNewRoles] = useState(new Set([]));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) setUsers(data.users);
    } catch (error) {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (onClose) => {
    try {
      const rolesArray = Array.from(newRoles);
      await api.put(`/admin/users/${selectedUser._id}/role`, { roles: rolesArray });
      toast.success("Rôles mis à jour");
      fetchUsers();
      onClose();
    } catch (error) {
      toast.error("Erreur mise à jour rôles");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur suppression");
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRoles(new Set(user.roles || []));
    onOpen();
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[1600px] mx-auto min-h-screen font-sans"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <IconUserShield size={28} />
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight">
              Gestion Utilisateurs
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">
            Gérez les comptes, les rôles et les permissions en temps réel.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <Tooltip content="Actualiser la liste">
            <Button
              isIconOnly
              variant="flat"
              color="primary"
              className="bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm hover:scale-105 transition-transform"
              onPress={fetchUsers}
            >
              <IconRefresh size={20} className={loading ? "animate-spin" : ""} />
            </Button>
          </Tooltip>

          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <IconSearch size={18} />
            </div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm group-hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Glass Card Table */}
      <div className="relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-transparent">
        <Card className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl border-none shadow-2xl rounded-[23px] overflow-hidden">
          <Table
            aria-label="Utilisateurs"
            removeWrapper
            classNames={{
              base: "max-h-[70vh] overflow-auto custom-scrollbar",
              th: "bg-gray-100/50 dark:bg-[#1e293b]/50 text-gray-600 dark:text-gray-300 font-bold uppercase text-xs tracking-wider py-4 border-b border-gray-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md",
              td: "py-4 border-b border-gray-100 dark:border-white/5 group-data-[last=true]:border-none",
              tr: "cursor-default transition-all duration-200 hover:bg-indigo-50/50 dark:hover:bg-white/5 data-[selected=true]:bg-indigo-100",
              emptyWrapper: "min-h-[300px] flex items-center justify-center"
            }}
          >
            <TableHeader>
              <TableColumn key="user">UTILISATEUR</TableColumn>
              <TableColumn key="role">RÔLES</TableColumn>
              <TableColumn key="status">STATUT</TableColumn>
              <TableColumn key="date">INSCRIPTION</TableColumn>
              <TableColumn key="actions" align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <IconSearch size={32} />
                  </div>
                  <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-sm">Essayez d'ajuster vos filtres de recherche.</p>
                </div>
              }
              isLoading={loading}
              loadingContent={
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Chargement...</p>
                </div>
              }
            >
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="group">
                  <TableCell>
                    <User
                      name={
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">
                          {`${user.firstName || ''} ${user.lastName || ''}`}
                        </span>
                      }
                      description={<span className="text-gray-500 dark:text-gray-400 font-medium text-xs mt-0.5">{user.email}</span>}
                      avatarProps={{
                        src: user.avatar,
                        size: "md",
                        isBordered: true,
                        className: "ring-2 ring-offset-2 ring-gray-200 dark:ring-white/10 group-hover:ring-indigo-500/50 transition-all group-hover:scale-105"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {(user.roles || []).map(role => (
                        <div
                          key={role}
                          className={`
                                px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border
                                ${role === 'admin'
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-red-500/5"
                              : role === 'parent'
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/5"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/5"
                            }
                            `}
                        >
                          {role === 'admin' ? 'ADMIN' : role === 'student' ? 'ÉTUDIANT' : role === 'parent' ? 'PARENT' : role.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`
                            inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm
                            ${user.isVerified
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10"
                      }
                        `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                      {user.isVerified ? "VÉRIFIÉ" : "EN ATTENTE"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-200 font-semibold text-sm">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600 text-[10px] font-mono mt-0.5">
                        {new Date(user.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" className="text-gray-400 data-[hover=true]:text-gray-600 dark:data-[hover=true]:text-gray-200 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-white/5 transition-all">
                          <IconDotsVertical size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions" className="p-1">
                        <DropdownItem
                          key="roles"
                          startContent={<IconUserShield size={18} className="text-indigo-500" />}
                          onPress={() => openRoleModal(user)}
                          className="group/item"
                          classNames={{
                            title: "font-semibold text-gray-700 dark:text-gray-200"
                          }}
                        >
                          Gérer les Rôles
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger group/item"
                          color="danger"
                          startContent={<IconTrash size={18} />}
                          onPress={() => handleDelete(user._id)}
                          classNames={{
                            title: "font-semibold"
                          }}
                        >
                          Supprimer
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        classNames={{
          base: "bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 dark:border-white/5 p-6">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Gérer les rôles
                </span>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  Pour <Chip size="sm" variant="flat" avatar={<User avatarProps={{ src: selectedUser?.avatar, size: "xs" }} name="" />}>{selectedUser?.firstName} {selectedUser?.lastName}</Chip>
                </span>
              </ModalHeader>
              <ModalBody className="p-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-500/10 flex items-start gap-4">
                  <div className="p-2 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                    <IconUserShield size={20} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Permissions</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Les rôles définissent ce que l'utilisateur peut voir et faire. Les modifications sont immédiates.
                    </p>
                  </div>
                </div>

                <Select
                  label="Rôles attribués"
                  selectionMode="multiple"
                  selectedKeys={newRoles}
                  onSelectionChange={setNewRoles}
                  placeholder="Sélectionner des rôles"
                  variant="bordered"
                  color="primary"
                  classNames={{
                    trigger: "border-gray-200 dark:border-white/10 min-h-[56px] bg-transparent",
                    value: "font-semibold"
                  }}
                  renderValue={(items) => (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <Chip key={item.key} size="sm" color="primary" variant="flat" className="capitalize">
                          {item.data.children}
                        </Chip>
                      ))}
                    </div>
                  )}
                >
                  <SelectItem key="student" value="student" startContent={<div className="w-2 h-2 rounded-full bg-blue-500" />}>Étudiant</SelectItem>
                  <SelectItem key="parent" value="parent" startContent={<div className="w-2 h-2 rounded-full bg-purple-500" />}>Parent</SelectItem>
                  <SelectItem key="admin" value="admin" className="text-danger" startContent={<div className="w-2 h-2 rounded-full bg-red-500" />}>Administrateur</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter className="p-6 pt-2">
                <Button variant="light" color="danger" onPress={onClose} className="font-semibold">annuler</Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 font-bold" onPress={() => handleRoleUpdate(onClose)}>
                  Enregistrer les modifications
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
