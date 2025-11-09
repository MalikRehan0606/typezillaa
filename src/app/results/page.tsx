

"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCwIcon, AlertTriangleIcon, HistoryIcon, XIcon, ChevronRightIcon, PlayCircleIcon, BrainCircuitIcon, CheckCircle, XCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import type { TestResult } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SettingsDialog } from '@/components/settings-dialog';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { LanguageSelector } from '@/components/language-selector';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { WordsHistory } from '@/components/words-history';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TestReplay } from '@/components/test-replay';
import { analyzeTyping, type TypingAnalysisOutput } from '@/ai/flows/typing-analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import Image from 'next/image';


const LATEST_RESULT_KEY = "latestTestResult";
const COLOR_THEME_KEY = "typingColorTheme";

// Custom shape for the error marker, rendering an 'x'
const ErrorMarker = (props: any) => {
  const { cx, cy } = props;
  // Don't render if coordinates are invalid or NaN
  if (cx === null || isNaN(cx) || cy === null || isNaN(cy)) {
    return null;
  }
  
  return (
    <text x={cx} y={cy} dy={4} textAnchor="middle" fill="hsl(var(--destructive))" fontSize="14" fontWeight="bold">
      x
    </text>
  );
};

const AiAnalysisDisplay: React.FC<{ analysis: TypingAnalysisOutput }> = ({ analysis }) => {
  return (
    <Card className="w-full mt-4 bg-secondary/30 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <BrainCircuitIcon className="h-6 w-6 text-primary" />
          AI Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold text-primary">Positive Feedback</h4>
          <p className="text-muted-foreground">{analysis.positiveFeedback}</p>
        </div>
        <div>
          <h4 className="font-semibold text-primary">Area for Improvement</h4>
          <p className="text-muted-foreground">{analysis.mainAreaForImprovement}</p>
        </div>
        <div>
          <h4 className="font-semibold text-primary">Actionable Tip</h4>
          <p className="text-muted-foreground">{analysis.improvementTip}</p>
        </div>
         <div>
          <h4 className="font-semibold text-primary">Practice Suggestion</h4>
          <p className="text-muted-foreground">{analysis.practiceSuggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};


export default function ResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAnonymous } = useAuth();
  const [result, setResult] = useState<TestResult | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [startReplay, setStartReplay] = useState(false);
  const { t } = useLanguage();
  const [correctCharColor, setCorrectCharColor] = useState('text-green-600');

  const [aiAnalysis, setAiAnalysis] = useState<TypingAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  useEffect(() => {
    setIsClient(true);
    try {
      const storedResult = localStorage.getItem(LATEST_RESULT_KEY);
      if (storedResult) {
        const parsedResult: TestResult = JSON.parse(storedResult);
        setResult(parsedResult);

        // Calculate wrong words
        if (parsedResult.textToType && parsedResult.userInput) {
            const originalWords = parsedResult.textToType.split(' ');
            const typedWords = parsedResult.userInput.split(' ');
            const incorrect = originalWords.filter((word, index) => typedWords[index] && word !== typedWords[index]);
            setWrongWords(incorrect);
        }

      } else {
        // If there's no result, don't show the page, redirect.
        if (isClient) router.replace('/levels');
      }

      const savedTheme = localStorage.getItem(COLOR_THEME_KEY);
      if (savedTheme) {
        setCorrectCharColor(savedTheme);
      }
    } catch (error) {
      console.error("Could not load test results.", error);
      if (isClient) router.replace('/levels');
    }
  }, [router, isClient]);

  const errorDots = useMemo(() => {
    if (!result || !result.wpmHistory || result.wpmHistory.length === 0) return [];
    
    return result.errorTimestamps.map((time, index) => {
        // Find the closest wpmHistory point in time
        const dataPoint = result.wpmHistory.reduce((prev, curr) => {
            return (Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev);
        });
        
        return {
            time: time,
            wpm: dataPoint ? dataPoint.wpm : 0,
            key: `error-${index}`
        };
    });
  }, [result]);

  const handleGetAiAnalysis = async () => {
    if (isAnonymous) {
      toast({
        title: "Feature Locked",
        description: "AI analysis is only available to signed-in users. Please create an account to use this feature.",
        variant: "destructive",
      });
      return;
    }
    if (!result) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
        const analysisResult = await analyzeTyping({
            wpm: result.wpm,
            accuracy: result.accuracy,
            consistency: result.consistency,
            textToType: result.textToType,
            userInput: result.userInput,
        });
        setAiAnalysis(analysisResult);
    } catch (error) {
        console.error("AI analysis failed:", error);
        toast({
            title: "AI Analysis Failed",
            description: "Could not get feedback from the AI coach. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (!isClient || !result) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const { wpm, accuracy, rawWpm, consistency, time, level, characterStats, wpmHistory, wordCount, language, textToType, keystrokeHistory, userInput, testStatus, wordsWithErrors } = result;
  
  const getRepeatTestUrl = () => {
     let url = `/typing-test?level=${level}&lang=${language}`;
    if (level === 'time' && time) {
        url += `&time=${time}`;
    } else if (wordCount) {
        url += `&words=${wordCount}`;
    } else if (level === 'simple') {
       // Simple level doesn't need params unless it's a custom text
    }
    if(textToType) {
        url += `&customText=${encodeURIComponent(textToType)}`;
    }
    return url;
  }
  
  const handlePracticeWrongWords = () => {
    if (wrongWords.length === 0) return;
    const customText = wrongWords.join(' ');
    const url = `/typing-test?level=simple&lang=${language}&customText=${encodeURIComponent(customText)}`;
    router.push(url);
  };

  const handleToggleAnalysis = () => {
    setStartReplay(false);
    setShowAnalysis(prev => !prev);
  };

  const handleStartReplay = () => {
    setShowAnalysis(false);
    setStartReplay(true);
  };

  const handleReplayEnd = () => {
    setStartReplay(false);
    toast({
        title: "Replay Finished",
        description: "You can watch it again by clicking the replay button.",
    });
  }
  
  const getTestTypeDisplay = () => {
      if (level === 'time') {
          return `Time / ${language.toUpperCase()} / ${time}s`;
      }
      return `${level} / ${language.toUpperCase()}${wordCount ? ` / ${wordCount}w` : ''}`;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground font-mono">
      <header className="py-2 px-6 md:px-8 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={`/sounds/logo.png/logo.png?v=${new Date().getTime()}`} alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <SettingsDialog />
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {startReplay ? (
             <TestReplay 
                keystrokeHistory={keystrokeHistory}
                textToType={textToType}
                onReplayEnd={handleReplayEnd}
                correctCharColor={correctCharColor}
            />
        ) : !showAnalysis ? (
            <>
                <div className="flex flex-col md:flex-row gap-8 w-full">
                    <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-1/4">
                        <div>
                        <p className="text-sm text-muted-foreground">{t.wpm}</p>
                        <p className="text-6xl font-bold text-primary">{wpm}</p>
                        </div>
                        <div>
                        <p className="text-sm text-muted-foreground">{t.accuracy}</p>
                        <p className="text-6xl font-bold text-primary">{accuracy}%</p>
                        </div>
                    </div>
                    <div className="w-full md:w-3/4">
                        <div className="w-full h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={wpmHistory} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" hide />
                            <RechartsTooltip
                                contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                }}
                                labelStyle={{ color: 'hsl(var(--primary))' }}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorWpm)" strokeWidth={2} />
                            <Area yAxisId="left" type="monotone" dataKey="rawWpm" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorRaw)" strokeWidth={2} />
                            {errorDots.map(dot => (
                                <ReferenceDot 
                                    key={dot.key} 
                                    yAxisId="left" 
                                    x={dot.time} 
                                    y={dot.wpm}
                                    ifOverflow="visible"
                                    r={0} // We don't render the dot itself, just the custom shape
                                    shape={<ErrorMarker />}
                                />
                            ))}
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-4 text-center text-muted-foreground w-full">
                    <div className="flex flex-col">
                        <span className="text-sm">{t.resultsTestType}</span>
                        <span className="text-primary text-2xl capitalize">{getTestTypeDisplay()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm">{t.resultsRaw}</span>
                        <span className="text-primary text-2xl">{rawWpm}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm">{t.resultsCharacters}</span>
                        <span className="text-primary text-2xl">{characterStats.correct}/{characterStats.incorrect}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm">{t.resultsConsistency}</span>
                        <span className="text-primary text-2xl">{consistency}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm">{t.time.toLowerCase()}</span>
                        <span className="text-primary text-2xl">{time}s</span>
                    </div>
                    <div className="flex flex-col">
                         <span className="text-sm">Status</span>
                         <span className={cn(
                            "text-2xl font-bold capitalize flex items-center justify-center gap-2",
                            testStatus === 'passed' ? 'text-success' : 'text-destructive'
                         )}>
                             {testStatus === 'passed' ? <CheckCircle /> : <XCircle /> }
                             {testStatus}
                         </span>
                    </div>
                </div>
                 {isAnalyzing ? (
                  <div className="mt-4 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting feedback from AI coach...
                  </div>
                ) : aiAnalysis ? (
                  <AiAnalysisDisplay analysis={aiAnalysis} />
                ) : null}
            </>
        ) : (
            <div className="w-full">
                <WordsHistory
                    textToType={textToType}
                    userInput={userInput}
                    correctCharColor={correctCharColor}
                    wordsWithErrors={new Set(wordsWithErrors || [])}
                />
            </div>
        )}

        <footer className="mt-12 flex w-full items-center justify-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => router.push('/levels')}>
                  <ChevronRightIcon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Test</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => router.push(getRepeatTestUrl())}>
                  <RefreshCwIcon className="h-5 w-5"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Repeat Test</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
                <AlertDialog>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={wrongWords.length === 0}>
                                <AlertTriangleIcon className="h-5 w-5" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Practice Incorrect Words</p>
                    </TooltipContent>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Incorrect Words</AlertDialogTitle>
                        <AlertDialogDescription>
                            Here are the words you typed incorrectly. You can practice them.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex flex-wrap gap-2">
                            {wrongWords.length > 0 ? (
                                wrongWords.map((word, index) => (
                                    <Badge key={index} variant="destructive">{word}</Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No incorrect words! Great job!</p>
                            )}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePracticeWrongWords} disabled={wrongWords.length === 0}>
                                Practice Wrong Words
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Tooltip>

             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleStartReplay} disabled={startReplay}>
                    <PlayCircleIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Replay Test</p>
              </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleGetAiAnalysis} disabled={isAnalyzing || isAnonymous}>
                        <BrainCircuitIcon className="h-5 w-5"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isAnonymous ? 'Login to use AI Analysis' : 'Get AI Analysis'}</p>
                </TooltipContent>
             </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleToggleAnalysis}>
                    {showAnalysis ? <XIcon className="h-5 w-5" /> : <HistoryIcon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showAnalysis ? 'Close Analysis' : 'Show Words History'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </footer>
      </main>
      <TypingTip />
    </div>
  );
}
