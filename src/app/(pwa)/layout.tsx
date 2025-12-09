// =====================================================
// The Hub - PWA Layout
// التخطيط الأساسي لتطبيق العملاء
// =====================================================

import BottomNav from '@/components/pwa/BottomNav';
import Header from '@/components/pwa/Header';

export default function PWALayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pwa-container">
            <Header showModeSwitch />
            <main className="pwa-content">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
