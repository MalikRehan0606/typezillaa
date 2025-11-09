
"use client";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/language-provider';
import type { Language } from '@/types';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (value: string) => {
    if (value && value !== language) {
        setLanguage(value as Language);
        toast({
        title: t.languageChanged,
        description: t.languageChangedDescription,
        });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.selectLanguage} className="text-muted-foreground hover:text-primary hover:bg-background">
          <GlobeIcon className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={language} onValueChange={handleLanguageChange}>
          <DropdownMenuRadioItem value="en">{t.languageEnglish}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="es">{t.languageSpanish}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="de">{t.languageGerman}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fr">{t.languageFrench}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
