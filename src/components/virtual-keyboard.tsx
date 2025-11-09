
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VirtualKeyboardProps {
  activeKey: string | null;
  errorKey: string | null;
}

const keyboardLayout = [
    ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
    ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
    ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "MetaRight", "ControlRight"],
];

const keyDisplayMap: { [key: string]: string } = {
  Backquote: "`", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0", Minus: "-", Equal: "=",
  KeyQ: "Q", KeyW: "W", KeyE: "E", KeyR: "R", KeyT: "T", KeyY: "Y", KeyU: "U", KeyI: "I", KeyO: "O", KeyP: "P",
  BracketLeft: "[", BracketRight: "]", Backslash: "\\",
  KeyA: "A", KeyS: "S", KeyD: "D", KeyF: "F", KeyG: "G", KeyH: "H", KeyJ: "J", KeyK: "K", KeyL: "L", Semicolon: ";", Quote: "'",
  KeyZ: "Z", KeyX: "X", KeyC: "C", KeyV: "V", KeyB: "B", KeyN: "N", KeyM: "M", Comma: ",", Period: ".", Slash: "/",
  ShiftLeft: "Shift", ShiftRight: "Shift", ControlLeft: "Ctrl", ControlRight: "Ctrl",
  AltLeft: "Alt", AltRight: "Alt", MetaLeft: "Cmd", MetaRight: "Cmd", Backspace: "Bksp",
  CapsLock: "Caps", Enter: "Enter", Tab: "Tab", Space: "Space"
};


export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKey, errorKey }) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeKey) {
      setPressedKey(activeKey);
      const timer = setTimeout(() => setPressedKey(null), 150);
      return () => clearTimeout(timer);
    }
  }, [activeKey]);
  
  useEffect(() => {
    if (errorKey) {
      setPressedKey(errorKey); // Show error highlight
      const timer = setTimeout(() => setPressedKey(null), 150); // Error highlight is also temporary
      return () => clearTimeout(timer);
    }
  }, [errorKey]);


  const getKeyClass = (key: string) => {
    const isPressed = pressedKey === key;
    const isErrorPress = errorKey === key && isPressed;

    let widthClass = "w-12"; // Default width
    if (["Backspace", "Enter", "ShiftLeft", "ShiftRight"].includes(key)) widthClass = "w-24";
    if (key === "Tab") widthClass = "w-16";
    if (key === "CapsLock") widthClass = "w-20";
    if (key === "Space") widthClass = "flex-grow w-96";
    
    return cn(
      "h-12 flex-shrink-0 flex items-center justify-center m-1 rounded-md border border-input shadow-sm transition-all duration-75 ease-in-out transform",
      "bg-card hover:bg-secondary text-xs md:text-sm font-medium",
      widthClass,
      isPressed && !isErrorPress && "bg-primary text-primary-foreground scale-105 shadow-lg",
      isErrorPress && "bg-destructive text-destructive-foreground scale-105 shadow-lg border-red-700",
    );
  };

  return (
    <div className="p-1 md:p-4 bg-background rounded-lg shadow-inner mt-6 w-full max-w-4xl mx-auto hidden md:block">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center">
          {row.map((key) => (
            <div key={key} className={getKeyClass(key)}>
              {keyDisplayMap[key] || key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
