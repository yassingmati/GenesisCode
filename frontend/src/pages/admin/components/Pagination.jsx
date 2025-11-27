// src/pages/admin/components/Pagination.jsx
import React from 'react';
import { Pagination as NextUIPagination } from "@nextui-org/react";

export default function Pagination({ page, pages, onPrev, onNext }) {
  const handleChange = (newPage) => {
    if (newPage > page) {
      onNext();
    } else if (newPage < page) {
      onPrev();
    }
  };

  return (
    <NextUIPagination
      total={pages}
      page={page}
      onChange={handleChange}
      showControls
      color="primary"
      size="sm"
    />
  );
}
