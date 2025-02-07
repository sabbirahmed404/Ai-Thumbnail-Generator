'use client';

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";

interface ProcessingProgressProps {
  isOpen: boolean;
  currentStep: string;
  progress: number;
}

export function ProcessingProgress({ isOpen, currentStep, progress }: ProcessingProgressProps) {
  return (
    <Drawer open={isOpen} onOpenChange={() => {}}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Processing Image</DrawerTitle>
            <DrawerDescription>Creating your custom thumbnail...</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-full">
                <Progress value={progress} className="w-full" />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium">{currentStep}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 