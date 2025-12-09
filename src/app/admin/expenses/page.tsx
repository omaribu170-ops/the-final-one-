// =====================================================
// The Hub - Expenses Page (مصروفات المكان)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, X, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import type { Expense } from '@/types/database';

const categories = { rent: 'إيجار', utilities: 'فواتير', salary: 'مرتبات', supplies: 'مستلزمات', maintenance: 'صيانة', other: 'أخرى' };

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        setExpenses(data || []);
        setLoading(false);
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">المصروفات</h1><p className="text-workspace-muted">إجمالي: {formatCurrency(total)}</p></div>
                <div className="flex gap-2">
                    <button onClick={() => exportToCSV(expenses.map(e => ({ العنوان: e.title, المبلغ: e.amount, التصنيف: categories[e.category as keyof typeof categories], التاريخ: e.expense_date })), 'expenses')} className="btn btn-secondary"><Download className="w-5 h-5" /></button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-5 h-5" />إضافة مصروف</button>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>العنوان</th><th>التصنيف</th><th>المبلغ</th><th>التاريخ</th><th></th></tr></thead>
                    <tbody>
                        {expenses.map(exp => (
                            <tr key={exp.id}>
                                <td><div className="font-medium">{exp.title}</div>{exp.description && <div className="text-sm text-workspace-muted">{exp.description}</div>}</td>
                                <td><span className="badge">{categories[exp.category as keyof typeof categories]}</span></td>
                                <td className="text-red-400 font-bold">{formatCurrency(exp.amount)}</td>
                                <td>{formatDate(exp.expense_date)}</td>
                                <td><button onClick={async () => { await supabase.from('expenses').delete().eq('id', exp.id); fetchData(); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function ExpenseModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ title: '', description: '', amount: 0, category: 'other', expense_date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await supabase.from('expenses').insert([form]);
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">إضافة مصروف</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div><label className="block text-sm mb-2">العنوان</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm mb-2">التفاصيل</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={2} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">المبلغ</label><input type="number" required min="0" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">التصنيف</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">{Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                        </div>
                        <div><label className="block text-sm mb-2">التاريخ</label><input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} className="input" /></div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'إضافة'}</button></div>
                </form>
            </div>
        </div>
    );
}
