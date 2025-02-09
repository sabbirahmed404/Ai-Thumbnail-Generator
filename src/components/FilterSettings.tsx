'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface FilterSettings {
  contrast: boolean;
  brightness: boolean;
  saturation: boolean;
  addEmoji: boolean;
}

interface FilterSettingsProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
}

export function FilterSettings({ settings, onSettingsChange }: FilterSettingsProps) {
  const handleCheckboxChange = (filter: keyof FilterSettings) => {
    onSettingsChange({
      ...settings,
      [filter]: !settings[filter]
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">Filter Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Image Filter Settings</SheetTitle>
          <SheetDescription>
            Select which filters to apply to your thumbnail and additional options.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="flex items-center space-x-4">
            <Checkbox 
              id="addEmoji" 
              checked={settings.addEmoji}
              onCheckedChange={() => handleCheckboxChange('addEmoji')}
            />
            <Label htmlFor="addEmoji">
              <div className="grid gap-1.5">
                <div className="font-medium">Add Emoji</div>
                <div className="text-sm text-muted-foreground">
                  Add a contextual emoji to enhance your thumbnail
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-4">
            <Checkbox 
              id="contrast" 
              checked={settings.contrast}
              onCheckedChange={() => handleCheckboxChange('contrast')}
            />
            <Label htmlFor="contrast">
              <div className="grid gap-1.5">
                <div className="font-medium">Contrast</div>
                <div className="text-sm text-muted-foreground">
                  Adjust the difference between light and dark areas
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-4">
            <Checkbox 
              id="brightness" 
              checked={settings.brightness}
              onCheckedChange={() => handleCheckboxChange('brightness')}
            />
            <Label htmlFor="brightness">
              <div className="grid gap-1.5">
                <div className="font-medium">Brightness</div>
                <div className="text-sm text-muted-foreground">
                  Make the image brighter or darker
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-4">
            <Checkbox 
              id="saturation" 
              checked={settings.saturation}
              onCheckedChange={() => handleCheckboxChange('saturation')}
            />
            <Label htmlFor="saturation">
              <div className="grid gap-1.5">
                <div className="font-medium">Saturation</div>
                <div className="text-sm text-muted-foreground">
                  Adjust the intensity of colors
                </div>
              </div>
            </Label>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save Settings</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 