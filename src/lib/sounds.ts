import type { SoundPack } from "@/types";

export const playSound = (
  audioContext: AudioContext | null,
  soundPack: SoundPack,
  type: 'correct' | 'incorrect',
  audioCache: Record<string, AudioBuffer>
) => {
  if (!audioContext || soundPack === 'none') return;
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => console.warn("Could not resume audio context", e));
  }
  if (audioContext.state !== 'running') return;
  
  try {
    if (soundPack === 'default') {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

      if (type === "correct") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.05);
      } else {
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
      }
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      const soundMap = {
          mechanical: { correct: 'mech-press', incorrect: 'mech-error' },
          typewriter: { correct: 'type-press', incorrect: 'type-error' },
          beep: { correct: 'beep-correct', incorrect: 'beep-incorrect' },
      };
      
      const soundKey = (soundMap as any)[soundPack]?.[type];
      const audioBuffer = audioCache[soundKey];

      if (audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(soundPack === 'mechanical' ? 0.3 : 0.5, audioContext.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
      }
    }
  } catch(e) {
      console.warn("Error playing sound", e);
  }
};

    