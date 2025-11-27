// src/pages/admin/components/ConfirmDialog.jsx
import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  return (
    <Modal isOpen={open} onClose={onCancel} backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          <p className="text-default-500">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onCancel}>
            Annuler
          </Button>
          <Button color="danger" onPress={onConfirm}>
            Confirmer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
