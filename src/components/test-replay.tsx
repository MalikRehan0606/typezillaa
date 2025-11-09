
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextDisplay } from "./text-display";
import type { Keystroke } from "@/types";
import { Button } from "./ui/button";
import { PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react";

interface TestReplayProps {
  keystrokeHistory: Keystroke[];
  textToType: string;
  onReplayEnd?: () => void;
  correctCharColor: string;
}

export const TestReplay: React.FC<TestReplayProps> = ({
  keystrokeHistory,
  textToType,
  onReplayEnd,
  correctCharColor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentKeystrokeIndex, setCurrentKeystrokeIndex] = useState(0);
  const [replayState, setReplayState] = useState<{
    userInput: string;
    currentIndex: number;
    errorIndices: Set<number>;
    status: "pending" | "playing" | "paused" | "completed";
  }>({
    userInput: "",
    currentIndex: 0,
    errorIndices: new Set(),
    status: "pending",
  });

  const replayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleNextKeystroke = useCallback(() => {
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
    }
    
    if (currentKeystrokeIndex >= keystrokeHistory.length -1) {
      setIsPlaying(false);
      setReplayState(prev => ({...prev, status: "completed"}));
      onReplayEnd?.();
      return;
    }

    const currentKeyData = keystrokeHistory[currentKeystrokeIndex];
    const nextKeyData = keystrokeHistory[currentKeystrokeIndex + 1];
    const delay = nextKeyData ? nextKeyData.time - currentKeyData.time : 100;

    replayTimeoutRef.current = setTimeout(() => {
      setCurrentKeystrokeIndex((prev) => prev + 1);
    }, Math.max(delay, 20)); // Ensure a minimum delay
  }, [currentKeystrokeIndex, keystrokeHistory, onReplayEnd]);

  const startReplay = useCallback(() => {
    if (currentKeystrokeIndex < keystrokeHistory.length) {
      setIsPlaying(true);
      setReplayState(prev => ({...prev, status: "playing"}));
    }
  }, [currentKeystrokeIndex, keystrokeHistory.length]);

  const pauseReplay = useCallback(() => {
    setIsPlaying(false);
     setReplayState(prev => ({...prev, status: "paused"}));
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
    }
  }, []);

  const resetReplay = useCallback(() => {
    pauseReplay();
    setCurrentKeystrokeIndex(0);
     setReplayState({
        userInput: "",
        currentIndex: 0,
        errorIndices: new Set(),
        status: "pending",
    });
  }, [pauseReplay]);

  const handleResetAndPlay = () => {
    resetReplay();
    setTimeout(() => {
      startReplay();
    }, 50); 
  };
  
  // Auto-play on mount
  useEffect(() => {
    handleResetAndPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main effect to schedule keystrokes when playing
  useEffect(() => {
    if (isPlaying) {
      scheduleNextKeystroke();
    }
    return () => {
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
    };
  }, [isPlaying, scheduleNextKeystroke]);
  
  
  // Core logic to derive the display state from the current position in history
  useEffect(() => {
    // This is a re-calculation from the start of history every time the index changes.
    // It's less efficient than updating from the previous state, but much more robust and less prone to bugs.
    let derivedUserInput = "";
    const derivedErrorIndices = new Set<number>();
    
    // Loop through history up to the current point in the replay
    for (let i = 0; i <= currentKeystrokeIndex; i++) {
        if (i >= keystrokeHistory.length) break;
        
        const { key } = keystrokeHistory[i];
        
        if (key === "Backspace") {
            if (derivedUserInput.length > 0) {
                // Remove the error index for the character being deleted
                derivedErrorIndices.delete(derivedUserInput.length - 1);
                derivedUserInput = derivedUserInput.slice(0, -1);
            }
        } else if (key.length === 1) {
            const charIndex = derivedUserInput.length;
            // Check for an error at the new position
            if (charIndex < textToType.length && key !== textToType[charIndex]) {
                derivedErrorIndices.add(charIndex);
            }
            derivedUserInput += key;
        }
    }

    setReplayState({
      userInput: derivedUserInput,
      currentIndex: derivedUserInput.length,
      errorIndices: derivedErrorIndices,
      status: replayState.status // Preserve the play/pause/completed status
    });
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKeystrokeIndex, keystrokeHistory, textToType]);


  const handlePlayPause = () => {
    if (isPlaying) {
      pauseReplay();
    } else {
      startReplay();
    }
  };
  
  const progress = keystrokeHistory.length > 0 ? ((currentKeystrokeIndex + 1) / keystrokeHistory.length) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-2xl font-headline mb-4">Test Replay</h3>

      <TextDisplay
        textToType={textToType}
        userInput={replayState.userInput}
        currentIndex={replayState.currentIndex}
        errorIndices={replayState.errorIndices}
        status={replayState.status as any}
        correctCharColor={correctCharColor}
        lastErrorIndex={null}
      />

      <div className="w-full max-w-3xl mt-4">
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-center items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            disabled={replayState.status === "completed"}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleResetAndPlay}>
            <RotateCcwIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
