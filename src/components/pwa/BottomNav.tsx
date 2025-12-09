// =====================================================
// The Hub - PWA Bottom Navbar
// شريط التنقل السفلي للتطبيق
// =====================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Plus, ShoppingBag, User } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/tools', icon: Wrench, label: 'الأدوات' },
    { href: '/booking', icon: Plus, label: 'حجز', isCenter: true },
    { href: '/store', icon: ShoppingBag, label: 'المتجر' },
    { href: '/profile', icon: User, label: 'حسابي' },
];

export default function BottomNav() {
    const pathname = usePathname();

    // إخفاء الـ navbar في صفحات الأدمن
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return null;
    }

    return (
        <nav className="navbar">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (item.isCenter) {
                    return (
                        <Link key={item.href} href={item.href} className="navbar-item-center" aria-label={item.label}>
                            <div className="navbar-center-btn">
                                <Icon className="w-6 h-6" />
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link key={item.href} href={item.href} className={`navbar-item ${isActive ? 'navbar-item-active' : ''}`} aria-label={item.label}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs mt-1">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
