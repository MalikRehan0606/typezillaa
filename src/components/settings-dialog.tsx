
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { MistakeMode, SoundPack } from '@/types';
import { useLanguage } from '@/contexts/language-provider';

const COLOR_THEME_KEY = "typingColorTheme";
const MISTAKE_MODE_KEY = "typingMistakeMode";
const SOUND_PACK_KEY = "typingSoundPack";

export function SettingsDialog() {
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState('text-green-600');
  const [mistakeMode, setMistakeMode] = useState<MistakeMode>('default');
  const [soundPack, setSoundPack] = useState<SoundPack>('none');
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem(COLOR_THEME_KEY);
    if (savedTheme) {
      setColorTheme(savedTheme);
    }
    const savedMistakeMode = localStorage.getItem(MISTAKE_MODE_KEY) as MistakeMode;
    if (savedMistakeMode) {
      setMistakeMode(savedMistakeMode);
    }
     const savedSoundPack = localStorage.getItem(SOUND_PACK_KEY) as SoundPack;
    if (savedSoundPack) {
      setSoundPack(savedSoundPack);
    }
  }, []);

  const handleColorChange = (value: string) => {
    setColorTheme(value);
    localStorage.setItem(COLOR_THEME_KEY, value);
    toast({
      title: "Color theme updated!",
      description: "Your new color will be applied on your next test.",
    });
  };

  const handleMistakeModeChange = (value: MistakeMode) => {
    setMistakeMode(value);
    localStorage.setItem(MISTAKE_MODE_KEY, value);
    toast({
      title: "Difficulty mode updated!",
      description: "Your new difficulty setting will apply on your next test.",
    });
  };

  const handleSoundPackChange = (value: SoundPack) => {
    setSoundPack(value);
    localStorage.setItem(SOUND_PACK_KEY, value);
    toast({
      title: "Sound pack updated!",
      description: "Sound effects will apply to your next test.",
    });
  };

  if (!isClient) {
    return null; // Don't render on the server
  }

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" className="text-muted-foreground hover:text-primary hover:bg-background">
          <SettingsIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.settingsTitle}</DialogTitle>
          <DialogDescription>
            {t.settingsDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h4 className="mb-2 font-medium text-foreground">{t.correctCharColor}</h4>
            <RadioGroup value={colorTheme} onValueChange={handleColorChange} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text-green-600" id="color-default" />
                <Label htmlFor="color-default">{t.colorDefault}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text-neon-purple" id="color-purple" />
                <Label htmlFor="color-purple">{t.colorPurple}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text-blue-500" id="color-blue" />
                <Label htmlFor="color-blue">{t.colorBlue}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text-incognito" id="color-incognito" />
                <Label htmlFor="color-incognito">{t.colorIncognito}</Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 font-medium text-foreground">{t.difficultyMode}</h4>
            <RadioGroup value={mistakeMode} onValueChange={(value) => handleMistakeModeChange(value as MistakeMode)} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="mode-default" />
                <Label htmlFor="mode-default">{t.difficultyDefault}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="mode-pro" />
                <Label htmlFor="mode-pro">{t.difficultyPro}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="god" id="mode-god" />
                <Label htmlFor="mode-god">{t.difficultyGod}</Label>
              </div>
            </RadioGroup>
          </div>
           <Separator />
           <div>
            <h4 className="mb-2 font-medium text-foreground">Typing Sounds</h4>
            <RadioGroup value={soundPack} onValueChange={(value) => handleSoundPackChange(value as SoundPack)} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="sound-none" />
                <Label htmlFor="sound-none">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="sound-default" />
                <Label htmlFor="sound-default">Default Beep</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pop" id="sound-pop" />
                <Label htmlFor="sound-pop">Pop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="click" id="sound-click" />
                <Label htmlFor="sound-click">Click</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
