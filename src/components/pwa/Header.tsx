// =====================================================
// The Hub - PWA Header
// هيدر التطبيق
// =====================================================

'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, User, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    showUser?: boolean;
    showModeSwitch?: boolean;
}

export default function Header({ title, showBack = false, showUser = true, showModeSwitch = false }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isEntertainmentMode, setIsEntertainmentMode] = useState(false);

    // إخفاء الهيدر في صفحات معينة
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return null;
    }

    return (
        <header className="pwa-header">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button onClick={() => router.back()} className="p-2 -mr-2 rounded-xl hover:bg-white/5">
                        <ArrowRight className="w-6 h-6" />
                    </button>
                )}

                {title ? (
                    <h1 className="text-xl font-bold">{title}</h1>
                ) : (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-main flex items-center justify-center font-bold text-white">H</div>
                        <span className="font-bold text-lg">The Hub</span>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-2">
                {showModeSwitch && (
                    <button
                        onClick={() => setIsEntertainmentMode(!isEntertainmentMode)}
                        className={`p-2 rounded-xl transition-all ${isEntertainmentMode ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5'}`}
                        aria-label="تبديل الوضع"
                    >
                        <Gamepad2 className="w-5 h-5" />
                    </button>
                )}

                {showUser && (
                    <Link href="/profile" className="p-2 rounded-xl hover:bg-white/5">
                        <User className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </header>
    );
}
