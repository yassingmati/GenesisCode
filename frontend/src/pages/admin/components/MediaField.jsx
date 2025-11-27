// src/pages/admin/components/MediaField.jsx
import React from 'react';
import { Card, CardBody, Progress, Link } from "@nextui-org/react";

export default function MediaField({ lang, file, previewUrl, onChange, uploading, progress, mediaType = 'video' }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {mediaType.toUpperCase()} {lang.toUpperCase()}
      </label>

      {previewUrl && (
        <Card className="mb-2">
          <CardBody className="p-2">
            {mediaType === 'video' ? (
              <video
                src={previewUrl}
                controls
                className="w-full max-h-20 rounded-md"
              />
            ) : (
              <Link
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                size="sm"
              >
                Voir PDF
              </Link>
            )}
          </CardBody>
        </Card>
      )}

      <input
        type="file"
        accept={mediaType === 'video' ? 'video/*' : 'application/pdf'}
        onChange={e => onChange(e.target.files[0])}
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
      />

      {uploading && (
        <Progress
          size="sm"
          value={progress || 0}
          color="primary"
          label={`Upload... ${progress || 0}%`}
          showValueLabel
        />
      )}
    </div>
  );
}
