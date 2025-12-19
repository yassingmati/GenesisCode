import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@nextui-org/react";
import { IconWorld } from '@tabler/icons-react';

const LanguageSelector = ({ className = '', showLabel = true, size = 'md' }) => {
  const { language, setLanguage, isLoading } = useLanguage();

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block">
          Langue:
        </span>
      )}

      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            variant="light"
            className="min-w-fit px-3 font-medium text-gray-700 dark:text-gray-200"
            size={size}
            startContent={<span className="text-lg">{currentLang.flag}</span>}
            isLoading={isLoading}
          >
            <span className={`${!showLabel ? 'hidden sm:inline' : ''}`}>{currentLang.label}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Language selection"
          variant="flat"
          selectionMode="single"
          selectedKeys={new Set([language])}
          onSelectionChange={(keys) => setLanguage(Array.from(keys)[0])}
        >
          {languages.map((lang) => (
            <DropdownItem key={lang.code} startContent={<span className="text-xl">{lang.flag}</span>}>
              {lang.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;
