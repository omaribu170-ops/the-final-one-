// =====================================================
// The Hub - Entertainment Hub Page (ليالي الألعاب)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Plus, X, Trophy, Users, Calendar, Clock, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { GameNight, Tournament } from '@/types/database';

export default function EntertainmentPage() {
    const [gameNights, setGameNights] = useState<GameNight[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('game_nights').select('*, tournaments(*)').order('event_date', { ascending: false });
        setGameNights(data || []);
        setLoading(false);
    }

    const upcoming = gameNights.find(g => g.status === 'upcoming');
    const past = gameNights.filter(g => g.status === 'completed');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Entertainment Hub</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-5 h-5" />ليلة ألعاب جديدة</button>
            </div>

            {/* ليلة الألعاب القادمة */}
            {upcoming && (
                <div className="card gradient-border">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-purple-500/20"><Gamepad2 className="w-8 h-8 text-purple-400" /></div>
                        <div>
                            <h2 className="text-2xl font-bold">{upcoming.title}</h2>
                            <p className="text-workspace-muted">{upcoming.description}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl text-center"><Calendar className="w-5 h-5 mx-auto mb-2 text-hub-orange" /><div className="font-bold">{formatDate(upcoming.event_date)}</div><div className="text-xs text-workspace-muted">التاريخ</div></div>
                        <div className="p-4 bg-white/5 rounded-xl text-center"><Clock className="w-5 h-5 mx-auto mb-2 text-hub-orange" /><div className="font-bold">{upcoming.start_time}</div><div className="text-xs text-workspace-muted">البداية</div></div>
                        <div className="p-4 bg-white/5 rounded-xl text-center"><Gift className="w-5 h-5 mx-auto mb-2 text-hub-orange" /><div className="font-bold">{formatCurrency(upcoming.total_prizes_value)}</div><div className="text-xs text-workspace-muted">الجوائز</div></div>
                        <div className="p-4 bg-white/5 rounded-xl text-center"><Users className="w-5 h-5 mx-auto mb-2 text-hub-orange" /><div className="font-bold">{formatCurrency(upcoming.entry_fee)}</div><div className="text-xs text-workspace-muted">رسم الدخول</div></div>
                    </div>
                </div>
            )}

            {/* السجل */}
            <div className="card">
                <h3 className="font-bold text-lg mb-4">ليالي الألعاب السابقة</h3>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>الاسم</th><th>التاريخ</th><th>الجوائز</th><th>الحالة</th></tr></thead>
                        <tbody>
                            {past.map(gn => (
                                <tr key={gn.id}>
                                    <td className="font-medium">{gn.title}</td>
                                    <td>{formatDate(gn.event_date)}</td>
                                    <td className="text-hub-orange">{formatCurrency(gn.total_prizes_value)}</td>
                                    <td><span className="badge badge-success">انتهت</span></td>
                                </tr>
                            ))}
                            {past.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-workspace-muted">لا توجد ليالي سابقة</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <GameNightModal onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function GameNightModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '18:00', entry_fee: 0, total_prizes_value: 0 });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await supabase.from('game_nights').insert([{ ...form, status: 'upcoming' }]);
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">ليلة ألعاب جديدة</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div><label className="block text-sm mb-2">اسم الليلة</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" placeholder="مثال: ليلة بلوت" /></div>
                        <div><label className="block text-sm mb-2">الوصف</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={2} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">التاريخ</label><input type="date" required value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">الوقت</label><input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="input" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">رسم الدخول</label><input type="number" min="0" value={form.entry_fee} onChange={e => setForm({ ...form, entry_fee: +e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">إجمالي الجوائز</label><input type="number" min="0" value={form.total_prizes_value} onChange={e => setForm({ ...form, total_prizes_value: +e.target.value })} className="input" /></div>
                        </div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'إنشاء'}</button></div>
                </form>
            </div>
        </div>
    );
}
