
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextDisplay } from "./text-display";
import { StatsBar } from "./stats-bar";
import { VirtualKeyboard } from "./virtual-keyboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCwIcon, Loader2, XIcon, StarIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getRandomText } from "@/lib/sample-texts";
import type { TestStatus, DifficultyLevel, TestResult, MistakeMode, Language, WpmDataPoint, Keystroke, UserProfileData, SoundPack, MatchResult, TestHistoryEntry } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, increment, getDoc, writeBatch, Timestamp, updateDoc, query, orderBy, limit, getDocs, arrayUnion } from "firebase/firestore";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-provider";
import { useSound } from "@/hooks/use-sound";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { ALL_ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";


const LATEST_RESULT_KEY = "latestTestResult";
const COLOR_THEME_KEY = "typingColorTheme";
const MISTAKE_MODE_KEY = "typingMistakeMode";
const SOUND_PACK_KEY = "typingSoundPack";


const TARGET_WPM: Record<DifficultyLevel, number> = {
    simple: 40,
    intermediate: 40,
    expert: 50,
    mixed: 45,
    time: 50,
};

interface TypingChallengeProps {
  level: DifficultyLevel;
  wordCount: number | null;
  timeLimit: number | null;
  language: Language;
  onTestCompleteForMatch?: (result: MatchResult) => void;
  onForfeit?: () => void;
  customText?: string;
  isMatchMode?: boolean;
}

export const TypingChallenge: React.FC<TypingChallengeProps> = ({ level, wordCount, timeLimit: initialTimeLimit, language, onTestCompleteForMatch, onForfeit, customText, isMatchMode = false }) => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAnonymous } = useAuth();
  const { setLanguage, t } = useLanguage();

  const [textToType, setTextToType] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<TestStatus>("pending");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(100);
  const [keystrokes, setKeystrokes] = useState({ correct: 0, incorrect: 0 });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [errorKeyVisual, setErrorKeyVisual] = useState<string | null>(null);
  const [wpm, setWpm] = useState(0);
  const [timerValue, setTimerValue] = useState(initialTimeLimit || 0);
  const [timeLimit, setTimeLimit] = useState<number | null>(initialTimeLimit);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);
  const [errorTimestamps, setErrorTimestamps] = useState<number[]>([]);
  const [correctCharColor, setCorrectCharColor] = useState('text-green-600');
  const [mistakeMode, setMistakeMode] = useState<MistakeMode>('default');
  const [soundPack, setSoundPack] = useState<SoundPack>('none');
  const [isShaking, setIsShaking] = useState(false);
  const [lastErrorIndex, setLastErrorIndex] = useState<number | null>(null);
  const [keystrokeHistory, setKeystrokeHistory] = useState<Keystroke[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordsWithErrors, setWordsWithErrors] = useState<Set<number>>(new Set());


  // State for result data
  const [resultData, setResultData] = useState<TestResult | null>(null);
  
  // State for prompts
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showSaveScorePrompt, setShowSaveScorePrompt] = useState(false);
  
  const playSound = useSound();

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keystrokesRef = useRef(keystrokes);
  keystrokesRef.current = keystrokes;
  const errorTimestampsRef = useRef(errorTimestamps);
  errorTimestampsRef.current = errorTimestamps;
  const signupChoiceRef = useRef<'signup' | 'cancel' | null>(null);


  const calculateStandardDeviation = (numbers: number[]): number => {
    if (numbers.length < 2) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  };

  const finishTest = useCallback(() => {
    if (status === 'completed') return;
    setEndTime(Date.now());
    setStatus("completed");
  }, [status]);


  useEffect(() => {
    setIsLoading(true);
    setLanguage(language); // Sync context with URL param
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem(COLOR_THEME_KEY);
        if (savedTheme) {
            setCorrectCharColor(savedTheme);
        }
        const savedMistakeMode = localStorage.getItem(MISTAKE_MODE_KEY) as MistakeMode;
        if (savedMistakeMode) {
            setMistakeMode(savedMistakeMode);
        }
        const savedSoundPack = localStorage.getItem(SOUND_PACK_KEY) as SoundPack;
        if (savedSoundPack) {
            setSoundPack(savedSoundPack);
        }
    }
    
    setIsLoading(false);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (status !== 'active') return;

    const isProExceeded = mistakeMode === 'pro' && keystrokes.incorrect > 5;
    const isGodExceeded = mistakeMode === 'god' && keystrokes.incorrect > 0;

    if (isProExceeded || isGodExceeded) {
        finishTest();
    }
  }, [keystrokes, mistakeMode, status, finishTest]);

  const triggerSound = useCallback((type: "correct" | "incorrect") => {
    if (soundPack === 'none') return;
    playSound(soundPack, type);
  }, [soundPack, playSound]);

  const calculateCurrentWpm = useCallback((currentTime: number): { wpm: number, rawWpm: number } => {
    if (!startTime) return { wpm: 0, rawWpm: 0 };
    const elapsedTimeInSeconds = (currentTime - startTime) / 1000;
    if (elapsedTimeInSeconds <= 0) return { wpm: 0, rawWpm: 0 };
    const minutes = elapsedTimeInSeconds / 60;
    const grossWords = (keystrokesRef.current.correct + keystrokesRef.current.incorrect) / 5;
    const correctWords = keystrokesRef.current.correct / 5;
    return {
      wpm: Math.max(0, Math.round(correctWords / minutes)),
      rawWpm: Math.max(0, Math.round(grossWords / minutes)),
    };
  }, [startTime]);

  useEffect(() => {
    const { correct, incorrect } = keystrokes;
    const total = correct + incorrect;
    setAccuracy(total === 0 ? 100 : Math.round((correct / total) * 100));
  }, [keystrokes]);

  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const isTimedMode = level === 'time';
    
    let newText = "";
    let newTimeLimit: number | null = null;
    let newTimerValue = 0;
    
    if (customText) {
        newText = customText;
    } else {
        if (isTimedMode) {
          newText = getRandomText(level, language, 100);
          newTimeLimit = initialTimeLimit || 30;
          newTimerValue = newTimeLimit;
        } else if (level === 'simple') {
          newText = getRandomText(level, language, 15);
          newTimeLimit = null; // No time limit for simple mode
          newTimerValue = 0; // Stopwatch starts at 0
        }
        else { // Other word-based challenges
          const words = wordCount || 30;
          newText = getRandomText(level, language, words);
          newTimeLimit = Math.ceil((words * 60) / (TARGET_WPM[level] || 40));
          newTimerValue = newTimeLimit;
        }
    }
    
    setTextToType(newText);
    setTimeLimit(newTimeLimit);
    setTimerValue(newTimerValue);
    
    setUserInput("");
    setCurrentIndex(0);
    setErrorIndices(new Set());
    setWordsWithErrors(new Set());
    setStatus("pending");
    setStartTime(null);
    setEndTime(null);
    setAccuracy(100);
    setKeystrokes({ correct: 0, incorrect: 0 });
    setActiveKey(null);
    setErrorKeyVisual(null);
    setWpm(0);
    setWpmHistory([]);
    setErrorTimestamps([]);
    setIsShaking(false);
    setLastErrorIndex(null);
    setResultData(null);
    setKeystrokeHistory([]);

    if (inputRef.current) inputRef.current.focus();
  }, [level, wordCount, language, initialTimeLimit, customText]);


  useEffect(() => {
    if (!isLoading) resetTest();
  }, [isLoading, resetTest]);

  useEffect(() => {
    if (!isLoading && (status === "pending" || status === "active")) inputRef.current?.focus();
  }, [isLoading, status]);
  
  const startTest = useCallback(() => {
      if (status !== 'pending') return;
      const newStartTime = Date.now();
      setStartTime(newStartTime);
      setStatus("active");
      
      const incrementTestStarted = async () => {
        if (db && !isMatchMode) {
            const batch = writeBatch(db);
            const globalStatsRef = doc(db, 'globalStats', 'main');
            batch.set(globalStatsRef, { totalTestStarted: increment(1) }, { merge: true });

            if (user && !isAnonymous) {
                const userStatsRef = doc(db, 'users', user.uid);
                batch.set(userStatsRef, { testsStarted: increment(1) }, { merge: true });
            }
            
            try {
                await batch.commit();
            } catch (err) {
                console.error("Failed to increment test start counts:", err);
            }
        }
      };
      incrementTestStarted();
  }, [status, user, isAnonymous, isMatchMode]);

  useEffect(() => {
    if (status !== 'active' || !startTime) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedTime = Math.floor((now - startTime) / 1000);
      
      const { wpm: currentWpm, rawWpm: currentRawWpm } = calculateCurrentWpm(now);

      setWpm(currentWpm);
      setWpmHistory(prev => [...prev, { time: elapsedTime, wpm: currentWpm, rawWpm: currentRawWpm, errors: errorTimestampsRef.current.length }]);
      
      if (timeLimit !== null) { // Countdown timer logic
        const timeRemaining = timeLimit - elapsedTime;
        if (timeRemaining > 0) {
          setTimerValue(timeRemaining);
        } else {
          setTimerValue(0);
          finishTest();
        }
      } else { // Stopwatch logic
        setTimerValue(elapsedTime);
      }
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, startTime, timeLimit, finishTest, calculateCurrentWpm]);
  
  const navigateToResults = useCallback((result: TestResult | null) => {
    if (isMatchMode) return; // In match mode, we don't navigate away.
    if (!result) {
        toast({ title: t.error, description: "Could not retrieve test results.", variant: "destructive"});
        router.push('/levels');
        return;
    }
    try {
        localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));
        router.push('/results');
    } catch (error) {
        console.error("Failed to save result to localStorage before navigation:", error);
        toast({ title: t.error, description: "Could not display results page due to browser storage issue.", variant: "destructive" });
        router.push('/results');
    }
  }, [router, toast, t, isMatchMode]);

  const checkForAndSaveNewAchievements = async (
    userId: string,
    userProfile: UserProfileData,
    testHistory: TestHistoryEntry[]
  ) => {
    if (!db) return;
  
    const currentAchievements = userProfile.unlockedAchievements || [];
    const allCalculatedAchievements = checkAchievements(testHistory, userProfile);
    const newlyUnlocked = allCalculatedAchievements.filter(
      (ach) => ach.unlocked && !currentAchievements.includes(ach.id)
    );
  
    if (newlyUnlocked.length > 0) {
      const newAchievementIds = newlyUnlocked.map((ach) => ach.id);
      const userDocRef = doc(db, 'users', userId);
  
      try {
        await updateDoc(userDocRef, {
          unlockedAchievements: arrayUnion(...newAchievementIds),
        });
  
        // Show a toast for each new achievement
        newlyUnlocked.forEach((ach) => {
          toast({
            title: 'Achievement Unlocked!',
            description: (
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span>{ach.name}</span>
              </div>
            ),
          });
        });
      } catch (error) {
        console.error('Failed to save new achievements:', error);
      }
    }
  };
  
  const handleConfirmSaveScore = async () => {
    if (!resultData || !user || isAnonymous || !db) return;

    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data()?.name) {
            console.error("User document or name does not exist, cannot save score.");
            toast({ title: "Error", description: "Your user profile could not be found.", variant: "destructive" });
            navigateToResults(resultData);
            return;
        }

        const latestUserData = userDocSnap.data() as UserProfileData;
        const userName = latestUserData.name;
        
        // --- Streak Logic ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastTestDate = latestUserData.lastTestTimestamp?.toDate();
        if (lastTestDate) {
          lastTestDate.setHours(0, 0, 0, 0);
        }

        let newCurrentStreak = latestUserData.currentStreak || 0;
        let newLongestStreak = latestUserData.longestStreak || 0;

        if (!lastTestDate) {
          // First test ever
          newCurrentStreak = 1;
        } else {
          const diffDays = Math.round((today.getTime() - lastTestDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            // Consecutive day
            newCurrentStreak++;
          } else if (diffDays > 1) {
            // Missed a day or more
            newCurrentStreak = 1; // Reset streak to 1 for the new day
          }
          // If diffDays is 0, they already practiced today, so streak is unchanged.
        }
        
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
        // --- End Streak Logic ---
        
        const personalBests = latestUserData.personalBests || { words: {}, time: {} };
        
        const batch = writeBatch(db);

        const userUpdateData: any = { 
          testsCompleted: increment(resultData.testStatus === 'passed' ? 1 : 0),
          totalTimeTyping: increment(resultData.time),
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastTestTimestamp: Timestamp.now() 
        };
        
        const historyData = {
            wpm: resultData.wpm,
            accuracy: resultData.accuracy,
            level: resultData.level,
            timestamp: serverTimestamp(),
            wordCount: resultData.wordCount,
            time: resultData.time,
            language: resultData.language,
        };

        const testType = resultData.level === 'time' ? 'time' : 'words';
        const testValue = resultData.level === 'time' ? resultData.time : resultData.wordCount;
        let newPersonalBest = false;
        if (testValue) {
            const currentBest = personalBests[testType as 'words' | 'time']?.[testValue];
            if (!currentBest || resultData.wpm > currentBest.wpm || (resultData.wpm === currentBest.wpm && resultData.accuracy > (currentBest.accuracy || 0))) {
                newPersonalBest = true;
                userUpdateData[`personalBests.${testType}.${testValue}`] = { wpm: resultData.wpm, accuracy: resultData.accuracy };
            }
        }

        const leaderboardData: any = {
            name: userName, wpm: resultData.wpm, accuracy: resultData.accuracy,
            level: resultData.level, language: resultData.language,
            timestamp: Date.now(), userId: user.uid,
        };
        if (resultData.level === 'time') leaderboardData.time = resultData.time;
        else leaderboardData.wordCount = resultData.wordCount;

        const historyDocRef = doc(collection(db, `users/${user.uid}/testHistory`));
        const leaderboardDocRef = doc(collection(db, "leaderboard"));

        batch.update(userDocRef, userUpdateData);
        batch.set(historyDocRef, historyData);
        batch.set(leaderboardDocRef, leaderboardData);

        await batch.commit()
            .catch((serverError: any) => {
                if (serverError.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: `batch write to users, testHistory, and leaderboard`,
                        operation: 'write',
                        requestResourceData: { 
                            userUpdate: userUpdateData,
                            history: historyData,
                            leaderboard: leaderboardData
                        },
                    });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                    console.error("Error updating leaderboard/history:", serverError);
                    toast({ title: "Save Error", description: "Could not save your score. " + serverError.message, variant: "destructive" });
                }
                throw serverError; // Re-throw to stop further execution in the try block
            });
        
        // --- Check for new achievements after saving ---
        const updatedUserSnap = await getDoc(userDocRef);
        const updatedUserData = updatedUserSnap.data() as UserProfileData;
        const historyQuery = query(collection(db, `users/${user.uid}/testHistory`), orderBy('timestamp', 'desc'), limit(100));
        const historySnapshot = await getDocs(historyQuery);
        const testHistory = historySnapshot.docs.map(d => d.data() as TestHistoryEntry);
        await checkForAndSaveNewAchievements(user.uid, updatedUserData, testHistory);
        // --- End achievement check ---

        if (newPersonalBest) {
            toast({ title: "New Personal Best!", description: `You set a new record for this test type!` });
        } else {
            toast({ title: t.scoreSaved, description: t.scoreSavedDescription });
        }

    } catch (error) {
        // This catch block will now only handle non-permission errors or re-thrown permission errors.
        console.log("Caught error after commit attempt. Navigation will still proceed.");
    } finally {
        navigateToResults(resultData);
    }
  };

  useEffect(() => {
    if (status !== 'completed' || !startTime || !endTime) {
      return;
    }

    const handleTestCompletion = async () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      const { wpm: finalWpm, rawWpm: finalRawWpm } = calculateCurrentWpm(endTime);
      const wpmValues = wpmHistory.map(p => p.wpm);
      const stdDev = calculateStandardDeviation(wpmValues);
      const avgWpm = wpmValues.reduce((a, b) => a + b, 0) / (wpmValues.length || 1);
      const consistency = avgWpm > 0 ? Math.max(0, Math.round(100 - (stdDev / avgWpm) * 100)) : 0;
      
      const testDuration = Math.floor((endTime - startTime) / 1000);
      const wordsTypedCount = userInput.trim().split(' ').length;
      
      const testFailedDueToMistakes = (mistakeMode === 'god' && keystrokes.incorrect > 0) || (mistakeMode === 'pro' && keystrokes.incorrect > 5);
      
      let wasSuccessful = false;
      if (level === 'time') {
        wasSuccessful = !testFailedDueToMistakes && userInput.length > 0;
      } else {
        const timerRanOut = timeLimit !== null && testDuration >= timeLimit;
        wasSuccessful = userInput.length >= textToType.length && !testFailedDueToMistakes && !timerRanOut;
      }
      
      if (isMatchMode) {
        if(onTestCompleteForMatch) {
            onTestCompleteForMatch({
                wpm: finalWpm,
                accuracy: accuracy,
                time: testDuration,
            });
        }
        return; // Don't proceed with normal result handling in match mode
      }


      const finalResultData: TestResult = {
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: accuracy,
        consistency: consistency,
        time: testDuration,
        level: level,
        language: language,
        wordCount: level === 'time' ? wordsTypedCount : wordCount,
        testTitle: level === "expert" ? "Challenging Words" : "Common Words",
        testStatus: wasSuccessful ? 'passed' : 'failed',
        characterStats: {
          correct: keystrokes.correct,
          incorrect: keystrokes.incorrect,
          total: keystrokes.correct + keystrokes.incorrect,
        },
        wpmHistory: wpmHistory,
        errorTimestamps: errorTimestamps,
        textToType: textToType,
        userInput: userInput,
        keystrokeHistory: keystrokeHistory,
        wordsWithErrors: Array.from(wordsWithErrors),
      };
      
      setResultData(finalResultData);

      if(db && wasSuccessful && !isMatchMode) {
        const statsDocRef = doc(db, 'globalStats', 'main');
        await setDoc(statsDocRef, {
            totalTestsCompleted: increment(1),
            totalTypingTimeInSeconds: increment(testDuration),
        }, { merge: true }).catch(err => console.warn("Could not update global stats", err));
      }

      if (wasSuccessful) {
        if (user && !isAnonymous) {
          setShowSaveScorePrompt(true);
        } else if (isAnonymous) {
          setShowSignupPrompt(true);
        } else {
          navigateToResults(finalResultData);
        }
      } else {
        if (!wasSuccessful) {
            toast({
              title: t.testIncomplete,
              description: t.scoreNotSaved,
              variant: "destructive",
            });
        }
        navigateToResults(finalResultData);
      }
    };
    
    handleTestCompletion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startTime, endTime]);
  
  const getWordIndexFromCharIndex = (charIndex: number): number => {
    let wordIndex = 0;
    let currentLength = 0;
    const words = textToType.split(' ');
    for (let i = 0; i < words.length; i++) {
        currentLength += words[i].length + 1; // +1 for the space
        if (charIndex < currentLength) {
            wordIndex = i;
            break;
        }
    }
    return wordIndex;
  };

 const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (status === "completed" || isLoading) return;

    if (status === 'pending') {
      startTest();
    }
    const typedValue = e.currentTarget.value;
    
    const time = startTime ? Date.now() - startTime : 0;
    setKeystrokeHistory(prev => [...prev, { key: typedValue.slice(-1), time, code: 'Unknown' }]); // Code is less reliable here

    const newErrorIndices = new Set<number>();
    const newWordsWithErrors = new Set<number>();
    let correctStrokes = 0;
    let incorrectStrokes = keystrokes.incorrect; // Assume incorrect strokes are handled by backspace/re-typing

    for(let i=0; i < typedValue.length; i++) {
        const expectedChar = textToType[i];
        const typedChar = typedValue[i];

        if (typedChar === expectedChar) {
            correctStrokes++;
        } else {
            newErrorIndices.add(i);
            const wordIndex = getWordIndexFromCharIndex(i);
            newWordsWithErrors.add(wordIndex);
        }
    }
    
    if (typedValue.length > userInput.length && newErrorIndices.has(typedValue.length - 1)) {
        // A new mistake was made
        const lastCharIndex = typedValue.length - 1;
        setLastErrorIndex(lastCharIndex);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        triggerSound("incorrect");
        setErrorKeyVisual('Unknown'); // We don't have the key code here
        setKeystrokes(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        if (startTime) setErrorTimestamps(prev => [...prev, Math.floor((Date.now() - startTime) / 1000)]);
    } else if (typedValue.length < userInput.length) {
        // Backspace was used
        setLastErrorIndex(null);
    } else if (typedValue.length > userInput.length) {
        // Correct character typed
        setLastErrorIndex(null);
        triggerSound("correct");
        setErrorKeyVisual(null);
        setKeystrokes(prev => ({ ...prev, correct: prev.correct + 1 }));
    }


    setUserInput(typedValue);
    setCurrentIndex(typedValue.length);
    setErrorIndices(newErrorIndices);
    setWordsWithErrors(newWordsWithErrors);
    
    if (typedValue.length >= textToType.length && level !== 'time' && !isMatchMode) {
      finishTest();
    } else if (typedValue.length >= textToType.length && isMatchMode) {
      finishTest();
    }
};

const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status === 'completed' || isLoading) return;

    if (status === 'pending') {
      startTest();
    }
    
    const { key, code } = e;
    setActiveKey(code);
    const time = startTime ? Date.now() - startTime : 0;
    setKeystrokeHistory(prev => [...prev, { key, time, code }]);

    if (key === 'Backspace') {
       if (userInput.length === 0) return;
       const lastCharIndex = userInput.length - 1;
       const newErrorIndices = new Set(errorIndices);
       newErrorIndices.delete(lastCharIndex);
       setErrorIndices(newErrorIndices);
    }

}, [status, isLoading, startTest, startTime, userInput.length, errorIndices]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-2 md:p-4 flex-grow">
        <Card className="w-full max-w-3xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-headline">{t.challengeTitle(level)}</CardTitle>
            <Button variant="outline" size="icon" aria-label="Reset Test" disabled>
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <StatsBar
              timerValue={0}
              wpm={0}
              accuracy={100}
              status="pending"
              t={t}
              mode={timeLimit !== null ? 'countdown' : 'stopwatch'}
            />
            <div className="mt-6 w-full">
              <div className="flex items-center justify-center h-24 text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> {t.loadingChallenge}...
              </div>
            </div>
          </CardContent>
        </Card>
        <VirtualKeyboard activeKey={null} errorKey={null} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 md:p-4 flex-grow">
      {!isMatchMode && (
        <>
          <AlertDialog
            open={showSaveScorePrompt}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setShowSaveScorePrompt(false);
                navigateToResults(resultData);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.saveScorePromptTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.saveScorePromptDescription(resultData?.wpm || 0)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => navigateToResults(resultData)}>
                  {t.dontSave}
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSaveScore}>
                  {t.save}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={showSignupPrompt}
            onOpenChange={(isOpen) => {
              setShowSignupPrompt(isOpen);
              if (!isOpen) { // When dialog closes
                if (signupChoiceRef.current === 'signup') {
                  sessionStorage.setItem('postLoginAction', 'saveLatestResult');
                  localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(resultData));
                  router.push('/signup');
                } else {
                  navigateToResults(resultData);
                }
                signupChoiceRef.current = null; // Reset choice
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.signupPromptTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.signupPromptDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => signupChoiceRef.current = 'cancel'}>
                  {t.noThanks}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => signupChoiceRef.current = 'signup'}>
                  {t.signUp}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    
      <Card className={cn("w-full max-w-3xl shadow-xl", isShaking && "animate-shake")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-headline">{isMatchMode ? '1v1 Match' : t.challengeTitle(level)}</CardTitle>
          {!isMatchMode ? (
            <Button variant="outline" size="icon" onClick={resetTest} aria-label={t.resetTest}>
                <RefreshCwIcon className="h-4 w-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <XIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    If you exit the match, your opponent will be declared the winner. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onForfeit} className="bg-destructive hover:bg-destructive/90">
                    Exit Match
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {status === 'completed' && !isMatchMode ? (
            <div className="flex w-full flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-xl font-semibold text-foreground">{t.testComplete}</p>
              <p className="text-muted-foreground">{t.calculatingResults}...</p>
            </div>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                className="fixed left-[-9999px] top-[-9999px] opacity-0"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (!isLoading && (status === 'active' || status === 'pending')) inputRef.current?.focus();}}
                value={userInput}
                readOnly={false}
                aria-hidden="true"
                tabIndex={-1}
                disabled={status === 'completed'}
              />
              <StatsBar
                timerValue={timerValue}
                wpm={wpm}
                accuracy={accuracy}
                status={status}
                t={t}
                mode={timeLimit !== null ? 'countdown' : 'stopwatch'}
              />
              <div className="mt-6 w-full cursor-text" onClick={() => inputRef.current?.focus()}>
                <TextDisplay
                  textToType={textToType}
                  userInput={userInput}
                  currentIndex={currentIndex}
                  errorIndices={errorIndices}
                  status={status}
                  correctCharColor={correctCharColor}
                  lastErrorIndex={lastErrorIndex}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <VirtualKeyboard activeKey={activeKey} errorKey={errorKeyVisual} />
    </div>
  );
};

    