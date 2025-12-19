import React, { useEffect, useState } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@nextui-org/react";
import { IconDotsVertical, IconTrash, IconShield } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { api } from '../components/common';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRoles, setNewRoles] = useState([]);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion Utilisateurs</h1>
      <Card>
        <Table aria-label="Utilisateurs">
          <TableHeader>
            <TableColumn>UTILISATEUR</TableColumn>
            <TableColumn>RÔLES</TableColumn>
            <TableColumn>STATUT</TableColumn>
            <TableColumn>INSCRIPTION</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Aucun utilisateur" isLoading={loading}>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <User
                    name={`${user.firstName || ''} ${user.lastName || ''}`}
                    description={user.email}
                    avatarProps={{ src: user.avatar }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(user.roles || []).map(role => (
                      <Chip key={role} size="sm" color={role === 'admin' ? "danger" : "default"}>
                        {role}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={user.isVerified ? "success" : "warning"} variant="dot">
                    {user.isVerified ? "Vérifié" : "Non Vérifié"}
                  </Chip>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <IconDotsVertical size={18} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                      <DropdownItem startContent={<IconShield size={16} />} onPress={() => openRoleModal(user)}>
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
              <ModalHeader>Gérer les rôles de {selectedUser?.firstName}</ModalHeader>
              <ModalBody>
                <Select
                  label="Rôles"
                  selectionMode="multiple"
                  selectedKeys={newRoles}
                  onSelectionChange={setNewRoles}
                >
                  <SelectItem key="student" value="student">Étudiant</SelectItem>
                  <SelectItem key="parent" value="parent">Parent</SelectItem>
                  <SelectItem key="admin" value="admin">Administrateur</SelectItem>
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
    </div>
  );
}
