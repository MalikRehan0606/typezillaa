
"use client";

import { useRef, useCallback } from 'react';
import type { SoundPack } from '@/types';

// This hook manages playing sounds using the Web Audio API.
// It avoids creating and destroying AudioContexts on every key press
// by creating a single, persistent context.
export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // This function ensures the AudioContext is created only once and
  // resumes it if it was suspended by the browser (a common browser policy).
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (!audioContextRef.current) {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        } catch (e) {
            console.warn("Web Audio API is not supported by this browser.");
            return null;
        }
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.warn("Could not resume audio context", e));
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback((soundPack: SoundPack, type: 'correct' | 'incorrect') => {
    const audioContext = getAudioContext();
    if (!audioContext || soundPack === 'none') return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      let volume = 0.05;
      let waveType: OscillatorType = 'sine';
      let freq = 880;
      let attackTime = 0.01;
      let decayTime = 0.05;
      let freqDrop = 0;

      // Base sound for incorrect keypresses
      if (type === 'incorrect') {
          freq = 220;
          waveType = 'square';
          decayTime = 0.1;
      }

      // Sound Pack specific settings
      switch(soundPack) {
        case 'pop':
          volume = 0.06;
          waveType = 'sine';
          attackTime = 0.001;
          if (type === 'correct') {
            freq = 600;
            freqDrop = 400; // Pitch drops quickly for a "pop"
            decayTime = 0.08;
          } else {
            freq = 200;
            freqDrop = 100;
            decayTime = 0.12;
          }
          break;
        
        case 'click':
          volume = 0.03;
          waveType = 'triangle';
          attackTime = 0.001;
          decayTime = 0.03;
           if (type === 'correct') {
            freq = 1500;
          } else {
            freq = 440;
            decayTime = 0.05;
          }
          break;
      }

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + decayTime);

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(freq, now);
      if (freqDrop > 0) {
        oscillator.frequency.exponentialRampToValueAtTime(freq - freqDrop, now + decayTime);
      }

      oscillator.start(now);
      oscillator.stop(now + attackTime + decayTime + 0.05);

    } catch (e) {
      console.warn("Error playing sound", e);
    }
  }, [getAudioContext]);

  return play;
};
