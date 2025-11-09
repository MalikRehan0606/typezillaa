
"use client";

import { cn } from "@/lib/utils";
import React, { useMemo, useRef, useEffect } from "react";

interface TextDisplayProps {
  textToType: string;
  userInput: string;
  currentIndex: number;
  errorIndices: Set<number>;
  status: "pending" | "active" | "completed" | "playing" | "paused" | "replay-completed";
  correctCharColor: string;
  lastErrorIndex: number | null;
}

const CharacterSpan: React.FC<{
  char: string;
  isCurrent: boolean;
  isTyped: boolean;
  isError: boolean;
  isLastError: boolean;
  status: TextDisplayProps["status"];
  correctCharColor: string;
  charRef: React.RefObject<HTMLSpanElement> | null;
}> = React.memo(({ char, isCurrent, isTyped, isError, isLastError, status, correctCharColor, charRef }) => {
  const isCursor = (status === "active" || status === "playing") && isCurrent;
  
  const typedCorrectly = isTyped && !isError;

  return (
    <span
      ref={charRef}
      className={cn(
        "text-2xl md:text-3xl font-mono transition-colors duration-100 ease-in-out px-px",
        {
          "text-destructive": isError,
          "animate-character-error": isLastError,
          [correctCharColor]: typedCorrectly,
          "text-muted-foreground": !isTyped,
          "border-b-2 border-foreground animate-pulse-caret": isCursor && !isError,
        },
        char === " " ? "min-w-[0.5ch]" : ""
      )}
    >
      {char}
    </span>
  );
});
CharacterSpan.displayName = "CharacterSpan";


export const TextDisplay: React.FC<TextDisplayProps> = ({
  textToType,
  userInput,
  currentIndex,
  errorIndices,
  status,
  correctCharColor,
  lastErrorIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  // This effect will run whenever the current typing index changes.
  // It will smoothly scroll the container to keep the active character in the vertical center.
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
        activeCharRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
  }, [currentIndex]);


  return (
    <div
      ref={containerRef}
      className="h-32 overflow-hidden relative p-4 md:p-6 bg-card rounded-lg w-full leading-relaxed select-none"
      aria-label="Text to type"
      tabIndex={-1}
    >
        <p className="whitespace-pre-wrap break-words">
            {textToType.split("").map((char, index) => {
            const isTyped = index < userInput.length;
            const isLastError = index === lastErrorIndex;
            const isError = errorIndices.has(index);
            const isCurrent = index === currentIndex;

            return (
                <CharacterSpan
                key={`${char}-${index}`}
                char={char}
                isCurrent={isCurrent}
                isTyped={isTyped}
                isError={isError}
                isLastError={isLastError}
                status={status}
                correctCharColor={correctCharColor}
                charRef={isCurrent ? activeCharRef : null}
                />
            );
            })}
            {status === "pending" && currentIndex === 0 && (
            <span className="text-2xl md:text-3xl font-mono border-b-2 border-foreground animate-pulse-caret">&nbsp;</span>
            )}
        </p>
    </div>
  );
};
