'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { playSound as playSfx } from '@/app/lib/sound';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: 'click' | 'correct' | 'wrong' | 'smash' | 'hit') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);

    // Use a ref to track if component is mounted to avoid hydration mismatch potentially,
    // but for localStorage we just use useEffect.
    useEffect(() => {
        try {
            const savedMute = localStorage.getItem('isMuted');
            if (savedMute !== null) {
                setIsMuted(JSON.parse(savedMute));
            }
        } catch (e) {
            console.error("Failed to load mute state", e);
        }
    }, []);

    const toggleMute = () => {
        setIsMuted((prev) => {
            const newState = !prev;
            localStorage.setItem('isMuted', JSON.stringify(newState));
            return newState;
        });
    };

    const playSound = (type: 'click' | 'correct' | 'wrong' | 'smash' | 'hit') => {
        if (isMuted) return;
        playSfx(type);
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
