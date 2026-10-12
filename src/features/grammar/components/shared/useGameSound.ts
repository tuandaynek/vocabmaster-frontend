import { useCallback, useRef } from 'react';

export function useGameSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, gainValue = 0.1, delay = 0) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;

      const ctx = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = ctx;

      const playAt = (startAt: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, startAt);

        gain.gain.setValueAtTime(gainValue, startAt);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startAt);
        osc.stop(startAt + duration);
      };

      if (ctx.state === 'suspended') {
        void ctx.resume()
          .then(() => playAt(ctx.currentTime + delay))
          .catch(error => console.error('AudioContext resume error:', error));
      } else {
        playAt(ctx.currentTime + delay);
      }
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  }, []);

  // 1. Tiếng click chọn khối từ / nút bấm
  const playSelect = useCallback(() => {
    playTone(400, 'sine', 0.08, 0.05);
  }, [playTone]);

  const playTick = useCallback((urgent = false) => {
    playTone(urgent ? 880 : 660, 'sine', 0.06, urgent ? 0.07 : 0.035);
  }, [playTone]);

  // 2. Tiếng "ting ting" vui vẻ khi trả lời đúng
  const playCorrect = useCallback(() => {
    playTone(523.25, 'sine', 0.15, 0.1, 0);     // C5
    playTone(659.25, 'sine', 0.15, 0.1, 0.08);  // E5
    playTone(783.99, 'sine', 0.25, 0.1, 0.16);  // G5
  }, [playTone]);

  // 3. Tiếng tạch trầm khi trả lời sai
  const playIncorrect = useCallback(() => {
    playTone(150, 'sawtooth', 0.2, 0.15, 0);
    playTone(120, 'sawtooth', 0.25, 0.15, 0.05);
  }, [playTone]);

  // 4. Tiếng game over khi hết tim
  const playGameOver = useCallback(() => {
    playTone(300, 'triangle', 0.3, 0.2, 0);
    playTone(240, 'triangle', 0.3, 0.2, 0.15);
    playTone(180, 'triangle', 0.4, 0.2, 0.3);
  }, [playTone]);

  // 5. Tiếng kèn ăn mừng hoàn thành chặng
  const playVictory = useCallback(() => {
    playTone(523.25, 'sine', 0.15, 0.1, 0);     // C5
    playTone(659.25, 'sine', 0.15, 0.1, 0.1);    // E5
    playTone(783.99, 'sine', 0.15, 0.1, 0.2);    // G5
    playTone(1046.50, 'sine', 0.4, 0.15, 0.3);   // C6
  }, [playTone]);

  return {
    playSelect,
    playTick,
    playCorrect,
    playIncorrect,
    playGameOver,
    playVictory
  };
}