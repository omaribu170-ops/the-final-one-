// =====================================================
// The Hub - Admin Sidebar Component
// القائمة الجانبية للوحة التحكم
// =====================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Table2,
    Users,
    Clock,
    BarChart3,
    SprayCan,
    ShoppingCart,
    Wallet,
    UserCog,
    ListTodo,
    Package,
    Gamepad2,
    Share2,
    Bell,
    Mail,
    MessageSquare,
    Settings,
    CalendarCheck,
    LogOut,
    X,
    Menu,
} from 'lucide-react';
import { useState } from 'react';

// =====================================================
// قائمة الروابط
// =====================================================
const menuItems = [
    { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { name: 'الترابيزات', href: '/admin/tables', icon: Table2 },
    { name: 'الأعضاء', href: '/admin/members', icon: Users },
    { name: 'الجلسات', href: '/admin/sessions', icon: Clock },
    { name: 'الإحصائيات', href: '/admin/statistics', icon: BarChart3, superAdmin: true },
    { name: 'النظافة', href: '/admin/cleaning', icon: SprayCan },
    { name: 'طلبات المكان', href: '/admin/requests', icon: ShoppingCart },
    { name: 'المصروفات', href: '/admin/expenses', icon: Wallet },
    { name: 'الموظفين', href: '/admin/employees', icon: UserCog, superAdmin: true },
    { name: 'المهام', href: '/admin/tasks', icon: ListTodo },
    { name: 'المخزن', href: '/admin/inventory', icon: Package },
    { name: 'Entertainment Hub', href: '/admin/entertainment', icon: Gamepad2 },
    { name: 'المسوقين', href: '/admin/affiliates', icon: Share2 },
    { name: 'الإشعارات', href: '/admin/notifications', icon: Bell },
    { name: 'الإيميلات', href: '/admin/emails', icon: Mail },
    { name: 'الرسائل SMS', href: '/admin/sms', icon: MessageSquare },
    { name: 'الحجوزات', href: '/admin/bookings', icon: CalendarCheck },
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings, superAdmin: true },
];

// =====================================================
// Props
// =====================================================
interface SidebarProps {
    userRole?: 'super_admin' | 'admin' | 'staff';
}

// =====================================================
// Sidebar Component
// =====================================================
export default function AdminSidebar({ userRole = 'super_admin' }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // فلترة الروابط حسب الصلاحيات
    const filteredItems = menuItems.filter((item) => {
        if (item.superAdmin && userRole !== 'super_admin') {
            return false;
        }
        return true;
    });

    return (
        <>
            {/* =====================================================
          زر فتح القائمة (موبايل)
          ===================================================== */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-50 p-3 rounded-xl bg-workspace-card border border-white/10 lg:hidden"
                aria-label="فتح القائمة"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* =====================================================
          Overlay (موبايل)
          ===================================================== */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* =====================================================
          القائمة الجانبية
          ===================================================== */}
            <aside
                className={`
          fixed top-0 right-0 h-screen w-72 bg-workspace-card border-l border-white/8
          z-50 transition-transform duration-300 overflow-hidden
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
            >
                {/* =====================================================
            الهيدر
            ===================================================== */}
                <div className="p-6 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* اللوجو */}
                        <div className="w-10 h-10 rounded-xl gradient-main flex items-center justify-center font-bold text-white">
                            H
                        </div>
                        <div>
                            <h1 className="font-bold text-lg gradient-text">The Hub</h1>
                            <p className="text-xs text-workspace-muted">لوحة التحكم</p>
                        </div>
                    </div>

                    {/* زر إغلاق (موبايل) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/5 lg:hidden"
                        aria-label="إغلاق القائمة"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* =====================================================
            الروابط
            ===================================================== */}
                <nav className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
                    <ul className="space-y-1">
                        {filteredItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${isActive
                                                ? 'gradient-main text-white shadow-lg shadow-hub-red/20'
                                                : 'text-workspace-muted hover:bg-white/5 hover:text-white'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* =====================================================
            الفوتر - تسجيل الخروج
            ===================================================== */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/8">
                    <button
                        onClick={() => {
                            // TODO: Implement logout
                            console.log('Logout');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
