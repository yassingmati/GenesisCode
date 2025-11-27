// src/pages/admin/components/MediaBadge.jsx
import React from 'react';
import { Chip } from "@nextui-org/react";
import { IconX, IconPlayerPlay, IconFileText } from '@tabler/icons-react';

const langColors = {
  fr: 'primary',
  en: 'success',
  ar: 'warning'
};

export default function MediaBadge({ lang, hasMedia, onPreview, onDelete, mediaType = 'video' }) {
  if (!hasMedia) return null;

  const Icon = mediaType === 'video' ? IconPlayerPlay : IconFileText;

  return (
    <Chip
      color={langColors[lang] || 'default'}
      variant="flat"
      size="sm"
      startContent={<Icon size={14} />}
      onClose={onDelete}
      onClick={onPreview}
      className="cursor-pointer"
    >
      {mediaType.toUpperCase()} {lang.toUpperCase()}
    </Chip>
  );
}
