// src/pages/admin/components/SearchBar.jsx
import React from 'react';
import { Input } from "@nextui-org/react";
import { IconSearch } from '@tabler/icons-react';

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <Input
      classNames={{
        base: "max-w-full sm:max-w-[20rem]",
        inputWrapper: "bg-default-100"
      }}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      startContent={<IconSearch size={18} className="text-default-400" />}
      isClearable
      onClear={() => onChange('')}
      size="sm"
    />
  );
}
