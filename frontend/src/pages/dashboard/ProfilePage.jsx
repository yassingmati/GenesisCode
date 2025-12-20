// ... imports ...
import { useNavigate } from 'react-router-dom';
import {
  Card, CardBody, CardHeader, Button, Input, Avatar, Tabs, Tab, Chip, Progress, Divider, Spacer, Tooltip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@nextui-org/react";

// ... existing code ...

export default function ProfilePage() {
  const navigate = useNavigate(); // Hook for navigation
  const [user, setUser] = useState(null);
  // ... existing state ...
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal

  // ... loadProfile, loadProgress, handleUpdateProfile, handleAvatarChange ...

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      const userId = user._id || user.id;
      await axios.delete(`${API_BASE}/users/${userId}`, { headers: getAuthHeader() });

      toast.success("Compte supprimé avec succès");

      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }

      // Redirect to login
      navigate('/login');
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error(err.response?.data?.message || "Erreur lors de la suppression du compte");
      setSaving(false); // Only stop saving if error, otherwise we redirect
    }
  };

  // ... handleChangePassword ...

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Avatar Modal */}
      <AvatarSelector
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarChange}
        currentAvatar={user?.avatar}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-danger">Supprimer le compte ?</ModalHeader>
              <ModalBody>
                <p className="font-semibold text-red-600">
                  Attention : Cette action est irréversible.
                </p>
                <p>
                  Toutes vos données, y compris votre progression, vos badges et vos informations personnelles seront définitivement effacées.
                </p>
                <p>Êtes-vous sûr de vouloir continuer ?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button color="danger" onPress={handleDeleteAccount} isLoading={saving}>
                  Confirmer la suppression
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ... Header Profile Card ... */}

      {/* ... Tabs ... */}

      {/* Inside Security Tab */}
      <Card className="mt-6 border-red-200 bg-red-50 dark:bg-red-900/10">
        <CardHeader className="text-danger font-bold">Zone Dangereuse</CardHeader>
        <CardBody className="flex flex-row justify-between items-center p-6">
          <div>
            <h4 className="font-semibold text-danger-600">Supprimer le compte</h4>
            <p className="text-sm text-gray-500">Une fois supprimé, votre compte ne peut plus être récupéré.</p>
          </div>
          <Button color="danger" variant="flat" startContent={<IconAlertTriangle />} onPress={() => setIsDeleteModalOpen(true)}>
            Supprimer
          </Button>
        </CardBody>
      </Card>

      {/* ... Other Tabs ... */}

    </div>
  );
}