'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop your image or click the button below to select a file.
        </p>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-6 transition-colors",
            isDragging 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/25 hover:border-primary/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Cloud className="w-16 h-16 text-muted-foreground" />
          <div className="flex flex-col items-center space-y-2 text-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Select File
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 