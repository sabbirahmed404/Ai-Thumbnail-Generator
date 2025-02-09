'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { FilterSettings } from "@/components/FilterSettings";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FilterSettings {
  contrast: boolean;
  brightness: boolean;
  saturation: boolean;
  addEmoji: boolean;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    contrast: false,
    brightness: false,
    saturation: false,
    addEmoji: false
  });

  const steps = [
    "Analyzing image...",
    "Generating instructions...",
    "Applying filters...",
    "Adding text overlays...",
    "Creating thumbnail...",
  ];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Create preview URL for the original image
    const previewUrl = URL.createObjectURL(selectedFile);
    setOriginalPreview(previewUrl);
  };

  const updateProgress = (stepIndex: number) => {
    const progressPerStep = 100 / steps.length;
    const currentProgress = (stepIndex + 1) * progressPerStep;
    setProgress(currentProgress);
    setCurrentStep(steps[stepIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !instruction) return;

    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      
      // Step 1: Analyzing image
      updateProgress(0);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('instruction', instruction);
      formData.append('filterSettings', JSON.stringify(filterSettings));

      // Step 2: Generating instructions
      updateProgress(1);
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      // Step 3: Applying filters
      updateProgress(2);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

      // Step 4: Adding text overlays
      updateProgress(3);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

      // Step 5: Creating thumbnail
      updateProgress(4);
      const data = await response.json();
      setThumbnailUrl(data.thumbnailUrl);

      // Complete
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500)); // Show completed state briefly
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid w-full gap-6">
                <UploadDropzone onFileSelect={handleFileSelect} />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea
                    placeholder="Enter your instructions for image manipulation..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <FilterSettings 
                  settings={filterSettings}
                  onSettingsChange={setFilterSettings}
                />
                <Button 
                  type="submit" 
                  disabled={!file || !instruction || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Generate Thumbnail'}
                </Button>
                {error && (
                  <p className="text-sm text-red-500">
                    Error: {error}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {(originalPreview || thumbnailUrl) && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full max-w-xl mx-auto">
                <CarouselContent>
                  {originalPreview && (
                    <CarouselItem>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center text-sm">Original Image</CardTitle>
                        </CardHeader>
                        <CardContent className="flex aspect-video items-center justify-center p-6">
                          <img 
                            src={originalPreview} 
                            alt="Original" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )}
                  {thumbnailUrl && (
                    <CarouselItem>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center text-sm">Generated Thumbnail</CardTitle>
                        </CardHeader>
                        <CardContent className="flex aspect-video items-center justify-center p-6">
                          <img 
                            src={thumbnailUrl} 
                            alt="Thumbnail" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        )}

        <ProcessingProgress 
          isOpen={isLoading} 
          currentStep={currentStep}
          progress={progress}
        />
      </div>
    </div>
  );
}
