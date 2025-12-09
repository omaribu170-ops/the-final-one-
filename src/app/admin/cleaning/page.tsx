// =====================================================
// The Hub - Cleaning Page
// صفحة النظافة
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { SprayCan, Check, X, Calendar, Clock, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, translateCleaningArea, exportToCSV } from '@/lib/utils';
import type { CleaningLog } from '@/types/database';

const TIME_SLOTS = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

const AREAS: ('bathroom' | 'hall')[] = ['bathroom', 'hall'];

export default function CleaningPage() {
    const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
    const [logs, setLogs] = useState<CleaningLog[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('cleaning_logs').select('*').order('log_date', { ascending: false });
        setLogs(data || []);
        setLoading(false);
    }

    async function handleCheck(slot: string, area: 'bathroom' | 'hall') {
        if (slot < currentTime) return;
        await supabase.from('cleaning_logs').upsert({
            log_date: today, time_slot: slot, area, status: 'checked', checked_at: new Date().toISOString()
        }, { onConflict: 'log_date,time_slot,area' });
        fetchData();
    }

    const todayLogs = logs.filter(l => l.log_date === today);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">النظافة</h1>
            </div>

            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button onClick={() => setActiveTab('today')} className={`px-4 py-2 rounded-lg ${activeTab === 'today' ? 'gradient-main text-white' : 'text-workspace-muted'}`}>
                    <Calendar className="w-5 h-5 inline ml-2" />اليوم
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg ${activeTab === 'history' ? 'gradient-main text-white' : 'text-workspace-muted'}`}>
                    <Clock className="w-5 h-5 inline ml-2" />السجل
                </button>
            </div>

            {activeTab === 'today' && (
                <div className="card">
                    <h3 className="font-bold text-lg mb-4">سجل اليوم - {formatDate(new Date())}</h3>
                    <table className="w-full text-center">
                        <thead><tr className="border-b border-white/10"><th className="p-3 text-right">الوقت</th><th>الحمامات</th><th>القاعات</th></tr></thead>
                        <tbody>
                            {TIME_SLOTS.map(slot => {
                                const isPast = slot < currentTime;
                                const bath = todayLogs.find(l => l.time_slot === slot && l.area === 'bathroom');
                                const hall = todayLogs.find(l => l.time_slot === slot && l.area === 'hall');
                                return (
                                    <tr key={slot} className="border-b border-white/5">
                                        <td className="p-3 text-right">{slot}</td>
                                        <td className="p-3">
                                            {bath?.status === 'checked' ? <Check className="w-5 h-5 text-green-400 mx-auto" /> :
                                                isPast ? <X className="w-5 h-5 text-red-400 mx-auto" /> :
                                                    <button onClick={() => handleCheck(slot, 'bathroom')} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 mx-auto"><SprayCan className="w-4 h-4 mx-auto" /></button>}
                                        </td>
                                        <td className="p-3">
                                            {hall?.status === 'checked' ? <Check className="w-5 h-5 text-green-400 mx-auto" /> :
                                                isPast ? <X className="w-5 h-5 text-red-400 mx-auto" /> :
                                                    <button onClick={() => handleCheck(slot, 'hall')} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 mx-auto"><SprayCan className="w-4 h-4 mx-auto" /></button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="card">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-lg">السجل التاريخي</h3>
                        <button onClick={() => exportToCSV(logs.map(l => ({ التاريخ: l.log_date, الوقت: l.time_slot, المنطقة: translateCleaningArea(l.area), الحالة: l.status })), 'cleaning')} className="btn btn-secondary"><Download className="w-5 h-5" />Export</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...new Set(logs.filter(l => l.log_date !== today).map(l => l.log_date))].slice(0, 30).map(date => {
                            const dayLogs = logs.filter(l => l.log_date === date);
                            const checked = dayLogs.filter(l => l.status === 'checked').length;
                            return (
                                <div key={date} className="p-4 rounded-xl bg-white/5">
                                    <div className="font-bold mb-2">{formatDate(date)}</div>
                                    <div className="text-sm text-workspace-muted">{checked}/{TIME_SLOTS.length * 2} فحص ({Math.round(checked / (TIME_SLOTS.length * 2) * 100)}%)</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
