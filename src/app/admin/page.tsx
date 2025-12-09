// =====================================================
// The Hub - Admin Dashboard Home
// الصفحة الرئيسية للوحة التحكم
// =====================================================

import {
    Users,
    Clock,
    Wallet,
    TrendingUp,
    Table2,
    Gamepad2,
    CalendarCheck,
    AlertCircle,
} from 'lucide-react';

// =====================================================
// بطاقة الإحصائية
// =====================================================
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'orange',
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; positive: boolean };
    color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
}) {
    const colors = {
        red: 'from-red-500/20 to-red-600/5 border-red-500/20',
        orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
        yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
        green: 'from-green-500/20 to-green-600/5 border-green-500/20',
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    };

    const iconColors = {
        red: 'text-red-400',
        orange: 'text-orange-400',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
        blue: 'text-blue-400',
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-6`}>
            {/* أيقونة الخلفية */}
            <div className="absolute top-4 left-4 opacity-20">
                <Icon className="w-16 h-16" />
            </div>

            {/* المحتوى */}
            <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl bg-white/10 ${iconColors[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-workspace-muted text-sm">{title}</span>
                </div>

                <div className="text-3xl font-bold mb-1">{value}</div>

                {subtitle && (
                    <div className="text-workspace-muted text-sm">{subtitle}</div>
                )}

                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`w-4 h-4 ${!trend.positive && 'rotate-180'}`} />
                        <span>{trend.value}% من الأمس</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================================================
// الصفحة الرئيسية
// =====================================================
export default function AdminDashboard() {
    // TODO: استبدال البيانات الثابتة ببيانات حقيقية من الـ Database
    const stats = {
        activeSessions: 5,
        todayRevenue: 2450,
        totalMembers: 156,
        todayBookings: 8,
        availableTables: 3,
        upcomingGameNight: 'الخميس',
    };

    return (
        <div className="space-y-8">
            {/* =====================================================
          الهيدر
          ===================================================== */}
            <div>
                <h1 className="text-3xl font-bold mb-2">أهلاً بيك يا أدمن! 👋</h1>
                <p className="text-workspace-muted">
                    {new Date().toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {/* =====================================================
          الإحصائيات السريعة
          ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="الجلسات النشطة"
                    value={stats.activeSessions}
                    subtitle="جلسة شغالة دلوقتي"
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="إيرادات اليوم"
                    value={`${stats.todayRevenue} ج.م`}
                    icon={Wallet}
                    trend={{ value: 12, positive: true }}
                    color="green"
                />
                <StatCard
                    title="إجمالي الأعضاء"
                    value={stats.totalMembers}
                    subtitle="عضو مسجل"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="حجوزات اليوم"
                    value={stats.todayBookings}
                    subtitle="حجز جديد"
                    icon={CalendarCheck}
                    color="yellow"
                />
            </div>

            {/* =====================================================
          القسم الثاني - معلومات إضافية
          ===================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* =====================================================
            الجلسات النشطة
            ===================================================== */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">الجلسات النشطة</h2>
                        <a href="/admin/sessions" className="text-hub-orange text-sm hover:underline">
                            عرض الكل ←
                        </a>
                    </div>

                    {stats.activeSessions > 0 ? (
                        <div className="space-y-4">
                            {/* مثال على جلسة نشطة */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl gradient-main flex items-center justify-center font-bold">
                                        T1
                                    </div>
                                    <div>
                                        <div className="font-medium">ترابيزة VIP 1</div>
                                        <div className="text-sm text-workspace-muted">3 أشخاص • بدأت من ساعتين</div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-hub-orange">150 ج.م</div>
                                    <div className="text-xs text-workspace-muted">حتى الآن</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl gradient-main flex items-center justify-center font-bold">
                                        T3
                                    </div>
                                    <div>
                                        <div className="font-medium">ترابيزة عادية 1</div>
                                        <div className="text-sm text-workspace-muted">2 أشخاص • بدأت من ساعة</div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-hub-orange">60 ج.م</div>
                                    <div className="text-xs text-workspace-muted">حتى الآن</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-workspace-muted">
                            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>مفيش جلسات نشطة دلوقتي</p>
                        </div>
                    )}
                </div>

                {/* =====================================================
            معلومات سريعة
            ===================================================== */}
                <div className="space-y-4">
                    {/* الترابيزات المتاحة */}
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                                <Table2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.availableTables}</div>
                                <div className="text-workspace-muted text-sm">ترابيزة متاحة</div>
                            </div>
                        </div>
                    </div>

                    {/* ليلة الألعاب القادمة */}
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                                <Gamepad2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-lg font-bold">{stats.upcomingGameNight}</div>
                                <div className="text-workspace-muted text-sm">ليلة الألعاب القادمة</div>
                            </div>
                        </div>
                    </div>

                    {/* تنبيهات */}
                    <div className="card border-yellow-500/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-medium">3 تنبيهات</div>
                                <div className="text-workspace-muted text-sm">محتاجة انتباه</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
