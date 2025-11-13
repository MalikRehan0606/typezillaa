
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRightIcon, TimerIcon, FileTextIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/language-provider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Header } from '@/components/header';
import { TypingTip } from '@/components/typing-tip';


export default function LevelsPage() {
  const [intermediateWords, setIntermediateWords] = useState("30");
  const [expertWords, setExpertWords] = useState("45");
  const [mixedWords, setMixedWords] = useState("40");
  const [timedDuration, setTimedDuration] = useState("30");

  const wordOptions = ["15", "30", "45", "60"];
  const mixedWordOptions = ["25", "40", "60"];
  const timeOptions = ["15", "30", "60"];

  const { language, t } = useLanguage();

  const wordLevels = [
    {
      name: t.levelSimple,
      description: t.levelSimpleDescription,
      icon: <span className="text-4xl">😊</span>,
      query: "simple" as const,
      borderColor: "border-primary",
      textColor: "text-primary",
    },
    {
      name: t.levelIntermediate,
      description: t.levelIntermediateDescription,
      icon: <span className="text-4xl">😐</span>,
      query: "intermediate" as const,
      borderColor: "border-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      name: t.levelExpert,
      description: t.levelExpertDescription,
      icon: <span className="text-4xl">😡</span>,
      query: "expert" as const,
      borderColor: "border-destructive",
      textColor: "text-destructive",
    },
    {
      name: "Mixed",
      description: "Practice with a mix of words, numbers, and common punctuation.",
      icon: <span className="text-4xl">📝</span>,
      query: "mixed" as const,
      borderColor: "border-purple-500",
      textColor: "text-purple-500",
    },
  ];

  const getWordCountForLevel = (level: typeof wordLevels[number]['query']) => {
    switch (level) {
        case 'intermediate': return intermediateWords;
        case 'expert': return expertWords;
        case 'mixed': return mixedWords;
        default: return '';
    }
  }

  const getWordOptionsForLevel = (level: typeof wordLevels[number]['query']) => {
      switch(level) {
          case 'mixed': return mixedWordOptions;
          default: return wordOptions;
      }
  }

  const getWordSetterForLevel = (level: typeof wordLevels[number]['query']) => {
    switch (level) {
        case 'intermediate': return setIntermediateWords;
        case 'expert': return setExpertWords;
        case 'mixed': return setMixedWords;
        default: return () => {};
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4 md:p-8">
        <section className="py-12 md:py-16 text-center w-full max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">{t.chooseYourChallenge}</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            {t.chooseYourChallengeDescription}
          </p>
          <Tabs defaultValue="words" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="words" className="gap-2"><FileTextIcon /> Words</TabsTrigger>
              <TabsTrigger value="time" className="gap-2"><TimerIcon/> Time</TabsTrigger>
            </TabsList>
            <TabsContent value="words">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {wordLevels.map((level) => (
                  <Card key={level.name} className={cn(`shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 bg-card`, level.borderColor)}>
                    <CardHeader className="items-center text-center">
                      {level.icon}
                      <CardTitle className={cn("text-2xl mt-2", level.textColor)}>{level.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center flex flex-col items-center">
                      <div className="mb-6 h-24 flex flex-col items-center justify-center space-y-2">
                        <CardDescription className="text-sm text-muted-foreground px-2">
                          {level.description}
                        </CardDescription>
                        {level.query !== 'simple' && (
                          <div className="mt-2">
                            <Select
                              onValueChange={getWordSetterForLevel(level.query)}
                              defaultValue={getWordCountForLevel(level.query)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t.wordCount} />
                              </SelectTrigger>
                              <SelectContent>
                                {getWordOptionsForLevel(level.query).map(option => (
                                  <SelectItem key={option} value={option}>{option} {t.words}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <Button asChild className="w-full mt-auto shadow-md hover:shadow-primary/50 transition-shadow">
                        <Link href={`/typing-test?level=${level.query}${level.query !== 'simple' ? `&words=${getWordCountForLevel(level.query)}` : ''}&lang=${language}`}>
                          <div className='flex items-center justify-center'>
                            {t.startChallenge(level.name)} <ChevronRightIcon className="ml-2 h-5 w-5" />
                          </div>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="time">
               <div className="max-w-sm mx-auto">
                   <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 bg-card border-purple-500">
                    <CardHeader className="items-center text-center">
                       <span className="text-4xl">⏱️</span>
                       <CardTitle className="text-2xl mt-2 text-purple-500">Timed Challenge</CardTitle>
                    </CardHeader>
                     <CardContent className="text-center flex flex-col items-center">
                        <div className="mb-6 h-24 flex flex-col items-center justify-center space-y-2">
                            <CardDescription className="text-sm text-muted-foreground px-2">
                                Type as much as you can before the time runs out. Your score is based on speed and accuracy.
                            </CardDescription>
                             <div className="mt-2">
                                <Select
                                  onValueChange={setTimedDuration}
                                  defaultValue={timedDuration}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeOptions.map(option => (
                                      <SelectItem key={option} value={option}>{option} seconds</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                        </div>
                        <Button asChild className="w-full mt-auto shadow-md hover:shadow-purple-500/50 transition-shadow">
                            <Link href={`/typing-test?level=time&time=${timedDuration}&lang=${language}`}>
                              Start Timed Challenge <ChevronRightIcon className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                     </CardContent>
                   </Card>
               </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <TypingTip />
    </div>
  );
}
