'use client';

import { useEffect, useRef } from 'react';
import { useSound } from '@/context/SoundContext';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isMuted } = useSound();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. ตั้งค่าพื้นฐาน
    audio.volume = 0.4;
    audio.loop = true;

    // 2. Sync Mute State with Context
    audio.muted = isMuted;

    // 3. ฟังก์ชันพยายามเล่นเสียง
    const tryPlay = () => {
      // ถ้า Mute อยู่ ไม่ต้องพยายามเล่น (หรือเล่นแต่เสียงเงียบก็ได้ แต่ Browser อาจ Block ถ้าไม่ได้ mute)
      // แต่ปกติเราเล่นตลอดแล้วแค่ Mute เอา
      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("🔊 Autoplay prevented by browser, waiting for interaction...");
          });
        }
      }
    };

    // 4. ตัวดักจับการคลิก (เพื่อให้ Browser ยอมให้เสียงดัง)
    const handleUserInteraction = () => {
      tryPlay();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    // ลองเล่นเลย
    tryPlay();

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isMuted]); // Re-run/Re-check when mute status changes (mainly for the muted property update)

  return (
    <audio
      ref={audioRef}
      src="/sounds/main_bgm.wav"
      preload="auto"
      className="hidden"
    />
  );
}