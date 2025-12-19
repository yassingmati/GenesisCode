import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, Tabs, Tab } from "@nextui-org/react";

const PRESET_AVATARS = [
    "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    "https://i.pravatar.cc/150?u=a04258114e29026302d",
    "https://i.pravatar.cc/150?u=a04258114e29026702d",
    "https://i.pravatar.cc/150?u=a04258114e29026708c",
    "https://i.pravatar.cc/150?u=a04258114e29026708d",
    // Gamer/Student style avatars (using placeholder services for now as we don't have local assets)
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Tech",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Code",
];

export default function AvatarSelector({ isOpen, onClose, onSelect, currentAvatar }) {
    const [activeTab, setActiveTab] = useState("presets");
    const [selected, setSelected] = useState(currentAvatar);

    const handleSave = () => {
        onSelect(selected);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Choisir un avatar</ModalHeader>
                <ModalBody>
                    <Tabs aria-label="Avatar options" selectedKey={activeTab} onSelectionChange={setActiveTab}>
                        <Tab key="presets" title="Galerie">
                            <div className="grid grid-cols-4 gap-4 p-4 max-h-[400px] overflow-y-auto">
                                {PRESET_AVATARS.map((src, index) => (
                                    <button
                                        key={index}
                                        className={`relative p-2 rounded-xl transition-all ${selected === src ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-default-100'}`}
                                        onClick={() => setSelected(src)}
                                    >
                                        <Avatar src={src} className="w-20 h-20 mx-auto" isBordered={selected === src} color={selected === src ? "primary" : "default"} />
                                    </button>
                                ))}
                            </div>
                        </Tab>
                        <Tab key="upload" title="Importer (Bientôt)">
                            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-default-300 rounded-xl bg-default-50">
                                <div className="text-4xl mb-4">📤</div>
                                <p className="text-default-500 text-center">L'importation d'images personnalisées sera bientôt disponible !</p>
                                <p className="text-tiny text-default-400 mt-2">En attendant, choisissez l'un de nos avatars stylés.</p>
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Annuler
                    </Button>
                    <Button color="primary" onPress={handleSave}>
                        Enregistrer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
