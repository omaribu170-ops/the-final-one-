// =====================================================
// The Hub - Profile Page
// صفحة البروفايل
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Wallet, Clock, Trophy, Edit2, LogOut, Share2, Copy, Check, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, copyToClipboard, getInitials } from '@/lib/utils';
import type { User as UserType } from '@/types/database';

export default function ProfilePage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({ hours: 0, sessions: 0, games: 0 });

    useEffect(() => { fetchUser(); }, []);

    async function fetchUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            setUser(data);
            // TODO: Fetch actual stats
        }
        setLoading(false);
    }

    async function handleCopyCode() {
        if (user?.affiliate_code) {
            await copyToClipboard(user.affiliate_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

    if (loading) return <div className="text-center py-16">جاري التحميل...</div>;
    if (!user) return <div className="text-center py-16">يرجى تسجيل الدخول</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* معلومات المستخدم */}
            <div className="card text-center">
                <div className="w-20 h-20 rounded-full gradient-main flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {getInitials(user.name)}
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.nickname && <p className="text-workspace-muted">"{user.nickname}"</p>}
                <div className="flex justify-center gap-4 mt-4 text-sm text-workspace-muted">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email}</span>
                    {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{user.phone}</span>}
                </div>
            </div>

            {/* الرصيد */}
            <div className="card gradient-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-workspace-muted text-sm">رصيد المحفظة</p>
                        <p className="text-3xl font-bold gradient-text">{formatCurrency(user.wallet_balance)}</p>
                    </div>
                    <button className="btn btn-primary"><Plus className="w-5 h-5" />شحن</button>
                </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-3">
                <div className="card text-center py-4">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-hub-orange" />
                    <div className="text-xl font-bold">{stats.hours}</div>
                    <div className="text-xs text-workspace-muted">ساعة</div>
                </div>
                <div className="card text-center py-4">
                    <User className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <div className="text-xl font-bold">{stats.sessions}</div>
                    <div className="text-xs text-workspace-muted">جلسة</div>
                </div>
                <div className="card text-center py-4">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <div className="text-xl font-bold">{stats.games}</div>
                    <div className="text-xs text-workspace-muted">فوز</div>
                </div>
            </div>

            {/* Affiliate Code */}
            {user.affiliate_code && (
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <Share2 className="w-6 h-6 text-hub-orange" />
                        <div>
                            <h3 className="font-bold">كود التسويق</h3>
                            <p className="text-sm text-workspace-muted">شارك كودك واكسب 30% من ساعات أصحابك</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 rounded-xl bg-white/5 font-mono text-lg text-center">{user.affiliate_code}</code>
                        <button onClick={handleCopyCode} className="btn btn-secondary">
                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* الإجراءات */}
            <div className="space-y-2">
                <button className="w-full card flex items-center gap-4 hover:bg-white/5">
                    <Edit2 className="w-5 h-5 text-workspace-muted" />
                    <span>تعديل البيانات</span>
                </button>
                <button onClick={handleLogout} className="w-full card flex items-center gap-4 text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );
}
