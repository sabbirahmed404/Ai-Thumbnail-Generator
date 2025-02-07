'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ThumbnailPreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export default function ThumbnailPreview({ imageUrl, isLoading }: ThumbnailPreviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No thumbnail generated yet. Upload an image to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="font-medium text-sm">Original Image</p>
        <Card className="overflow-hidden">
          <img
            src={imageUrl}
            alt="Original"
            className="w-full h-[200px] object-cover"
          />
        </Card>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-sm">Generated Thumbnail</p>
        <Card className="overflow-hidden">
          <img
            src={imageUrl}
            alt="Thumbnail"
            className="w-full h-[200px] object-cover"
          />
        </Card>
      </div>
    </div>
  );
} 