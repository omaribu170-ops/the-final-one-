// =====================================================
// The Hub - Pomodoro Timer
// تايمر بومودورو للتركيز
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const WORK_TIME = 25 * 60; // 25 دقيقة
const BREAK_TIME = 5 * 60; // 5 دقائق
const LONG_BREAK_TIME = 15 * 60; // 15 دقيقة

export default function PomodoroPage() {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
    const [sessions, setSessions] = useState(0);

    const totalTime = mode === 'work' ? WORK_TIME : mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            // انتهى الوقت
            if (mode === 'work') {
                const newSessions = sessions + 1;
                setSessions(newSessions);
                if (newSessions % 4 === 0) {
                    setMode('longBreak');
                    setTimeLeft(LONG_BREAK_TIME);
                } else {
                    setMode('break');
                    setTimeLeft(BREAK_TIME);
                }
            } else {
                setMode('work');
                setTimeLeft(WORK_TIME);
            }
            setIsRunning(false);
            // إشعار صوتي
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('The Hub', { body: mode === 'work' ? 'خد استراحة!' : 'يلا نرجع للشغل!' });
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode, sessions]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const reset = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? WORK_TIME : mode === 'break' ? BREAK_TIME : LONG_BREAK_TIME);
    };

    const switchMode = (newMode: 'work' | 'break' | 'longBreak') => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(newMode === 'work' ? WORK_TIME : newMode === 'break' ? BREAK_TIME : LONG_BREAK_TIME);
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center pb-20">
            {/* اختيار الوضع */}
            <div className="flex gap-2 mb-8">
                {[
                    { key: 'work', label: 'تركيز', icon: Brain },
                    { key: 'break', label: 'استراحة', icon: Coffee },
                    { key: 'longBreak', label: 'استراحة طويلة', icon: Coffee },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => switchMode(key as typeof mode)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm ${mode === key ? 'gradient-main text-white' : 'bg-white/5'}`}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {/* التايمر */}
            <div className="relative w-64 h-64 mb-8">
                {/* الدائرة الخلفية */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="128" cy="128" r="120" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 120}`} strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`} className="transition-all duration-1000" />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E63E32" />
                            <stop offset="100%" stopColor="#F18A21" />
                        </linearGradient>
                    </defs>
                </svg>
                {/* الوقت */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold font-mono">{formatTime(timeLeft)}</div>
                    <div className="text-workspace-muted mt-2">{mode === 'work' ? 'وقت التركيز' : 'وقت الاستراحة'}</div>
                </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-4">
                <button onClick={reset} className="p-4 rounded-full bg-white/5 hover:bg-white/10">
                    <RotateCcw className="w-6 h-6" />
                </button>
                <button onClick={() => setIsRunning(!isRunning)} className="p-6 rounded-full gradient-main shadow-lg shadow-hub-red/30">
                    {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
            </div>

            {/* الجلسات */}
            <div className="mt-8 text-center">
                <div className="text-2xl font-bold">{sessions}</div>
                <div className="text-workspace-muted">جلسة مكتملة</div>
            </div>
        </div>
    );
}
