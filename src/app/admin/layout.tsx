// =====================================================
// The Hub - Admin Layout
// التخطيط الأساسي للوحة التحكم
// =====================================================

import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-workspace-bg">
            {/* =====================================================
          القائمة الجانبية
          ===================================================== */}
            <AdminSidebar userRole="super_admin" />

            {/* =====================================================
          المحتوى الرئيسي
          ===================================================== */}
            <main className="lg:mr-72 min-h-screen">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
