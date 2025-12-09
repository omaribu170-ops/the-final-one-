// =====================================================
// The Hub - Statistics Page
// صفحة الإحصائيات (للسوبر أدمن فقط)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Wallet,
    Gamepad2,
    Coffee,
    Download,
    Calendar,
    Trophy,
    Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatNumber, getStartOfDay, getStartOfMonth } from '@/lib/utils';

// =====================================================
// الصفحة الرئيسية
// =====================================================
export default function StatisticsPage() {
    const [period, setPeriod] = useState<'daily' | 'monthly' | 'half_yearly' | 'yearly'>('monthly');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        dailyRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        tableRevenue: 0,
        productRevenue: 0,
        totalMembers: 0,
        avgDailySessions: 0,
        totalGameNights: 0,
        gameNightParticipants: 0,
        gameNightFees: 0,
        totalPrizes: 0,
        netAfterPrizes: 0,
        totalExpenses: 0,
        netProfit: 0,
        topSpenders: [] as { name: string; amount: number; hours: number }[],
        topGamers: [] as { name: string; games: number }[],
        topWinners: [] as { name: string; wins: number }[],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [period]);

    async function fetchStats() {
        setLoading(true);
        try {
            // الحصول على التواريخ حسب الفترة
            const now = new Date();
            let startDate: Date;

            switch (period) {
                case 'daily':
                    startDate = getStartOfDay();
                    break;
                case 'monthly':
                    startDate = getStartOfMonth();
                    break;
                case 'half_yearly':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                    break;
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }

            // إجمالي الإيرادات من الجلسات
            const { data: sessionsData } = await supabase
                .from('sessions')
                .select('total_price, table_price, products_price')
                .eq('status', 'closed')
                .gte('created_at', startDate.toISOString());

            const totalRevenue = sessionsData?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0;
            const tableRevenue = sessionsData?.reduce((sum, s) => sum + (s.table_price || 0), 0) || 0;
            const productRevenue = sessionsData?.reduce((sum, s) => sum + (s.products_price || 0), 0) || 0;

            // عدد الأعضاء
            const { count: membersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'user');

            // عدد ليالي الألعاب
            const { data: gameNightsData } = await supabase
                .from('game_nights')
                .select('*')
                .gte('created_at', startDate.toISOString());

            const { data: prizesData } = await supabase
                .from('tournament_participants')
                .select('prize_won')
                .gte('registered_at', startDate.toISOString());

            const totalPrizes = prizesData?.reduce((sum, p) => sum + (p.prize_won || 0), 0) || 0;

            // المصروفات
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('amount')
                .gte('created_at', startDate.toISOString());

            const totalExpenses = expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

            // أكثر 3 أعضاء دفعاً
            const { data: topSpendersData } = await supabase
                .from('session_members')
                .select(`
          user:users(name),
          session:sessions(total_price)
        `)
                .limit(3);

            setStats({
                totalRevenue,
                dailyRevenue: totalRevenue, // سيتم حسابها بشكل صحيح
                monthlyRevenue: totalRevenue,
                yearlyRevenue: totalRevenue,
                tableRevenue,
                productRevenue,
                totalMembers: membersCount || 0,
                avgDailySessions: Math.round((sessionsData?.length || 0) / 30),
                totalGameNights: gameNightsData?.length || 0,
                gameNightParticipants: 0,
                gameNightFees: 0,
                totalPrizes,
                netAfterPrizes: totalRevenue - totalPrizes,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses - totalPrizes,
                topSpenders: [],
                topGamers: [],
                topWinners: [],
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleExport() {
        // TODO: تصدير PDF
        alert('جاري العمل على هذه الميزة');
    }

    return (
        <div className="space-y-6">
            {/* =====================================================
          الهيدر
          ===================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الإحصائيات</h1>
                    <p className="text-workspace-muted">نظرة شاملة على أداء المكان</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as typeof period)}
                        className="input w-auto"
                    >
                        <option value="daily">يومي</option>
                        <option value="monthly">شهري</option>
                        <option value="half_yearly">نصف سنوي</option>
                        <option value="yearly">سنوي</option>
                    </select>
                    <button onClick={handleExport} className="btn btn-secondary">
                        <Download className="w-5 h-5" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* =====================================================
          البطاقات الرئيسية
          ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="إجمالي الإيرادات"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={Wallet}
                    color="green"
                    loading={loading}
                />
                <StatCard
                    title="إيرادات الترابيزات"
                    value={formatCurrency(stats.tableRevenue)}
                    icon={Clock}
                    color="orange"
                    loading={loading}
                />
                <StatCard
                    title="إيرادات المنتجات"
                    value={formatCurrency(stats.productRevenue)}
                    icon={Coffee}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    title="صافي الربح"
                    value={formatCurrency(stats.netProfit)}
                    icon={TrendingUp}
                    color={stats.netProfit >= 0 ? 'green' : 'red'}
                    loading={loading}
                />
            </div>

            {/* =====================================================
          إحصائيات الأعضاء والجلسات
          ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="عدد الأعضاء"
                    value={formatNumber(stats.totalMembers)}
                    subtitle="عضو مسجل"
                    icon={Users}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    title="متوسط الجلسات"
                    value={stats.avgDailySessions}
                    subtitle="جلسة يومياً"
                    icon={Target}
                    color="orange"
                    loading={loading}
                />
                <StatCard
                    title="ليالي الألعاب"
                    value={stats.totalGameNights}
                    subtitle="ليلة"
                    icon={Gamepad2}
                    color="purple"
                    loading={loading}
                />
            </div>

            {/* =====================================================
          إحصائيات الألعاب والجوائز
          ===================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-purple-400" />
                        إحصائيات الألعاب
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                            <span className="text-workspace-muted">إجمالي الجوائز</span>
                            <span className="font-bold text-red-400">{formatCurrency(stats.totalPrizes)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                            <span className="text-workspace-muted">الربح بعد خصم الجوائز</span>
                            <span className="font-bold text-green-400">{formatCurrency(stats.netAfterPrizes)}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-red-400" />
                        المصروفات
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                            <span className="text-workspace-muted">إجمالي المصروفات</span>
                            <span className="font-bold text-red-400">{formatCurrency(stats.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                            <span className="text-workspace-muted">صافي الربح النهائي</span>
                            <span className="font-bold text-green-400 text-xl">{formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
          أكثر الأعضاء
          ===================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TopListCard
                    title="أكثر 3 أعضاء دفعاً"
                    icon={Wallet}
                    items={stats.topSpenders.map((s) => ({
                        name: s.name,
                        value: formatCurrency(s.amount),
                        subtitle: `${s.hours} ساعة`,
                    }))}
                    loading={loading}
                />
                <TopListCard
                    title="أكثر 3 مشاركين في الألعاب"
                    icon={Gamepad2}
                    items={stats.topGamers.map((s) => ({
                        name: s.name,
                        value: `${s.games} لعبة`,
                    }))}
                    loading={loading}
                />
                <TopListCard
                    title="أكثر 3 فائزين"
                    icon={Trophy}
                    items={stats.topWinners.map((s) => ({
                        name: s.name,
                        value: `${s.wins} فوز`,
                    }))}
                    loading={loading}
                />
            </div>
        </div>
    );
}

// =====================================================
// بطاقة الإحصائية
// =====================================================
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'orange',
    loading = false,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
    loading?: boolean;
}) {
    const colors = {
        red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
        orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
        yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
        green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    };

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-10 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-8 bg-white/5 rounded w-3/4" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-6`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5" />
                <span className="text-workspace-muted text-sm">{title}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <div className="text-sm text-workspace-muted mt-1">{subtitle}</div>}
        </div>
    );
}

// =====================================================
// بطاقة القائمة
// =====================================================
function TopListCard({
    title,
    icon: Icon,
    items,
    loading = false,
}: {
    title: string;
    icon: React.ElementType;
    items: { name: string; value: string; subtitle?: string }[];
    loading?: boolean;
}) {
    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-6 bg-white/5 rounded w-1/2 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-white/5 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-hub-orange" />
                {title}
            </h3>
            {items.length === 0 ? (
                <p className="text-center py-8 text-workspace-muted">لا توجد بيانات</p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                                        i === 1 ? 'bg-gray-400 text-black' :
                                            'bg-orange-600 text-white'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    {item.subtitle && (
                                        <div className="text-xs text-workspace-muted">{item.subtitle}</div>
                                    )}
                                </div>
                            </div>
                            <span className="font-bold text-hub-orange">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
