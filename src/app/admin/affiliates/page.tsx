// =====================================================
// The Hub - Affiliates Page (المسوقين)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Share2, Users, Wallet, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getInitials, copyToClipboard } from '@/lib/utils';
import type { User, AffiliateEarning } from '@/types/database';

export default function AffiliatesPage() {
    const [affiliates, setAffiliates] = useState<(User & { earnings: AffiliateEarning[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('users').select('*, earnings:affiliate_earnings(*)').not('affiliate_code', 'is', null).order('created_at', { ascending: false });
        setAffiliates(data || []);
        setLoading(false);
    }

    async function handleCopy(code: string) {
        await copyToClipboard(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">المسوقين</h1>
                    <p className="text-workspace-muted">نسبة التسويق: 30% من ساعات العملاء</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-hub-orange" />
                    <div className="text-2xl font-bold">{affiliates.length}</div>
                    <div className="text-sm text-workspace-muted">مسوق</div>
                </div>
                <div className="card text-center">
                    <Share2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold">{affiliates.reduce((s, a) => s + (a.earnings?.length || 0), 0)}</div>
                    <div className="text-sm text-workspace-muted">إحالة</div>
                </div>
                <div className="card text-center">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold">{formatCurrency(affiliates.reduce((s, a) => s + (a.earnings?.reduce((es, e) => es + e.amount, 0) || 0), 0))}</div>
                    <div className="text-sm text-workspace-muted">إجمالي الأرباح</div>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>المسوق</th><th>كود التسويق</th><th>الإحالات</th><th>الأرباح</th><th>تاريخ الانضمام</th></tr></thead>
                    <tbody>
                        {affiliates.map(aff => (
                            <tr key={aff.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full gradient-main flex items-center justify-center font-bold text-sm">{getInitials(aff.name)}</div>
                                        <div><div className="font-medium">{aff.name}</div><div className="text-sm text-workspace-muted">{aff.phone}</div></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <code className="px-3 py-1 rounded-lg bg-white/5 font-mono">{aff.affiliate_code}</code>
                                        <button onClick={() => handleCopy(aff.affiliate_code!)} className="p-2 hover:bg-white/5 rounded-lg">
                                            {copiedCode === aff.affiliate_code ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                                <td>{aff.earnings?.length || 0}</td>
                                <td className="text-hub-orange font-bold">{formatCurrency(aff.earnings?.reduce((s, e) => s + e.amount, 0) || 0)}</td>
                                <td>{formatDate(aff.created_at)}</td>
                            </tr>
                        ))}
                        {affiliates.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-workspace-muted">لا يوجد مسوقين</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
