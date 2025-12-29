import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@nextui-org/react";
import { IconDotsVertical, IconTrash, IconShield, IconUserShield, IconSearch } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { systemApi as api } from './components/common';
import { motion } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRoles, setNewRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
      await api.put(`/admin/users/${selectedUser._id}/role`, { roles: Array.from(newRoles) });
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

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[1600px] mx-auto min-h-screen"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight mb-2">
            Gestion Utilisateurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gérez les comptes, les rôles et les permissions.</p>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <IconSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-white/80 dark:bg-[#1e293b]/50 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden p-2">
        <Table
          aria-label="Utilisateurs"
          removeWrapper
          classNames={{
            th: "bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wider",
            td: "py-3 group-data-[first=true]:first:before:rounded-none group-data-[first=true]:last:before:rounded-none",
            table: "min-h-[400px]"
          }}
        >
          <TableHeader>
            <TableColumn key="user">UTILISATEUR</TableColumn>
            <TableColumn key="role">RÔLES</TableColumn>
            <TableColumn key="status">STATUT</TableColumn>
            <TableColumn key="date">INSCRIPTION</TableColumn>
            <TableColumn key="actions" align="end">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Aucun utilisateur trouvé" isLoading={loading}>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-default group">
                <TableCell>
                  <User
                    name={<span className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{`${user.firstName || ''} ${user.lastName || ''}`}</span>}
                    description={<span className="text-gray-500 dark:text-gray-400">{user.email}</span>}
                    avatarProps={{
                      src: user.avatar,
                      className: "ring-2 ring-offset-2 ring-indigo-500/20 dark:ring-indigo-500/10 transition-transform group-hover:scale-110"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(user.roles || []).map(role => (
                      <Chip
                        key={role}
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: role === 'admin' ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                          content: "font-semibold"
                        }}
                      >
                        {role === 'admin' ? 'Administrateur' : role === 'student' ? 'Étudiant' : role === 'parent' ? 'Parent' : role}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="dot"
                    color={user.isVerified ? "success" : "warning"}
                    classNames={{
                      base: "border-0 bg-transparent px-0 gap-2",
                      dot: user.isVerified ? "bg-emerald-500" : "bg-amber-500"
                    }}
                  >
                    <span className={user.isVerified ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
                      {user.isVerified ? "Vérifié" : "Non Vérifié"}
                    </span>
                  </Chip>
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light" className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                        <IconDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                      <DropdownItem startContent={<IconUserShield size={16} />} onPress={() => openRoleModal(user)}>
                        Gérer Rôles
                      </DropdownItem>
                      <DropdownItem className="text-danger" color="danger" startContent={<IconTrash size={16} />} onPress={() => handleDelete(user._id)}>
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Gérer les rôles
                <span className="text-xs font-normal text-gray-500">Pour {selectedUser?.firstName} {selectedUser?.lastName}</span>
              </ModalHeader>
              <ModalBody>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-2 flex items-start gap-3">
                  <IconUserShield className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Les permissions seront mises à jour immédiatement après l'enregistrement.
                  </p>
                </div>
                <Select
                  label="Rôles attribués"
                  selectionMode="multiple"
                  selectedKeys={newRoles}
                  onSelectionChange={setNewRoles}
                  placeholder="Sélectionner des rôles"
                  variant="bordered"
                >
                  <SelectItem key="student" value="student">Étudiant</SelectItem>
                  <SelectItem key="parent" value="parent">Parent</SelectItem>
                  <SelectItem key="admin" value="admin" className="text-danger">Administrateur</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Annuler</Button>
                <Button color="primary" onPress={() => handleRoleUpdate(onClose)}>Enregistrer</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
