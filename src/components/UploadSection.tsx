'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface UploadSectionProps {
  onSubmit: (file: File, instruction: string) => void;
}

export default function UploadSection({ onSubmit }: UploadSectionProps) {
  console.log('Rendering UploadSection component');

  useEffect(() => {
    console.log('UploadSection component mounted');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    console.log('UploadSection handleSubmit called');
    e.preventDefault();
    if (file && instruction) {
      onSubmit(file, instruction);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('File dropped');
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      console.log('File set:', droppedFile.name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="mt-4 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    console.log('File selected:', selectedFile.name);
                    setFile(selectedFile);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="relative"
              >
                Choose file
                <span className="ml-2 text-muted-foreground">or drag and drop</span>
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                PNG, JPG or GIF up to 10MB
              </p>
            </div>
          </div>
          {file && (
            <div className="mt-4 text-sm text-muted-foreground bg-muted/50 py-2 px-4 rounded-md">
              Selected: {file.name}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="instruction"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Instructions
        </label>
        <Textarea
          id="instruction"
          placeholder="Enter your instructions for image manipulation..."
          value={instruction}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            console.log('Instruction changed:', e.target.value);
            setInstruction(e.target.value);
          }}
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!file || !instruction}
      >
        Generate Thumbnail
      </Button>
    </form>
  );
} 