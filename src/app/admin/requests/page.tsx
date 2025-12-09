// =====================================================
// The Hub - Requests Page (طلبات المكان)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Clock, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate, translateRequestType, exportToCSV } from '@/lib/utils';
import type { Request } from '@/types/database';

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
        setRequests(data || []);
        setLoading(false);
    }

    async function updateStatus(id: string, status: 'received' | 'completed') {
        await supabase.from('requests').update({ status }).eq('id', id);
        fetchData();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">طلبات المكان</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-5 h-5" />طلب جديد</button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>الطلب</th><th>النوع</th><th>التكلفة</th><th>التاريخ</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td><div className="font-medium">{req.item_name}</div><div className="text-sm text-workspace-muted">{req.description}</div></td>
                                <td><span className="badge">{translateRequestType(req.type)}</span></td>
                                <td className="text-hub-orange">{formatCurrency(req.estimated_cost)}</td>
                                <td>{formatDate(req.created_at)}</td>
                                <td>
                                    <span className={`badge ${req.status === 'completed' ? 'badge-success' : req.status === 'received' ? 'badge-warning' : 'badge-info'}`}>
                                        {req.status === 'completed' ? 'تم' : req.status === 'received' ? 'تم الاستلام' : 'في الانتظار'}
                                    </span>
                                </td>
                                <td>
                                    {req.status === 'pending' && <button onClick={() => updateStatus(req.id, 'received')} className="btn btn-secondary text-sm py-1">استلام</button>}
                                    {req.status === 'received' && <button onClick={() => updateStatus(req.id, 'completed')} className="btn btn-primary text-sm py-1">تم التنفيذ</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && <RequestModal onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function RequestModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ type: 'supply', item_name: '', description: '', quantity: 1, estimated_cost: 0 });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await supabase.from('requests').insert([form]);
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">طلب جديد</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div><label className="block text-sm mb-2">النوع</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input"><option value="supply">مستلزمات نظافة</option><option value="food">أكل</option><option value="drink">مشروبات</option><option value="maintenance">صيانة</option><option value="other">أخرى</option></select></div>
                        <div><label className="block text-sm mb-2">اسم الطلب</label><input required value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm mb-2">التفاصيل</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={3} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">الكمية</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">التكلفة المتوقعة</label><input type="number" min="0" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: +e.target.value })} className="input" /></div>
                        </div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'إضافة'}</button></div>
                </form>
            </div>
        </div>
    );
}
