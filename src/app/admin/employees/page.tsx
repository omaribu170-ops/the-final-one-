// =====================================================
// The Hub - Employees Page (الموظفين - سوبر أدمن فقط)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { UserCog, Plus, X, Eye, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, formatCurrency, translateShift, getInitials } from '@/lib/utils';
import type { Employee, User } from '@/types/database';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<(Employee & { user: User })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewing, setViewing] = useState<(Employee & { user: User }) | null>(null);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('employees').select('*, user:users(*)').order('created_at', { ascending: false });
        setEmployees(data || []);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">الموظفين</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-5 h-5" />إضافة موظف</button>
            </div>

            {viewing ? (
                <div className="card">
                    <button onClick={() => setViewing(null)} className="text-workspace-muted mb-4">← رجوع</button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full gradient-main flex items-center justify-center text-xl font-bold">{getInitials(viewing.user?.name || '')}</div>
                        <div><h2 className="text-2xl font-bold">{viewing.user?.name}</h2><p className="text-workspace-muted">{viewing.user?.email}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">الهاتف</div><div>{viewing.user?.phone || '-'}</div></div>
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">العنوان</div><div>{viewing.address || '-'}</div></div>
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">الوردية</div><div>{translateShift(viewing.shift)}</div></div>
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">المرتب</div><div className="text-hub-orange font-bold">{formatCurrency(viewing.salary)}</div></div>
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">تاريخ التعيين</div><div>{formatDate(viewing.hire_date)}</div></div>
                        <div className="p-4 bg-white/5 rounded-xl"><div className="text-workspace-muted text-sm">رقم طوارئ</div><div>{viewing.emergency_contact || '-'}</div></div>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>الموظف</th><th>الوردية</th><th>المرتب</th><th>تاريخ التعيين</th><th></th></tr></thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full gradient-main flex items-center justify-center font-bold text-sm">{getInitials(emp.user?.name || '')}</div><div><div className="font-medium">{emp.user?.name}</div><div className="text-sm text-workspace-muted">{emp.user?.phone}</div></div></div></td>
                                    <td><span className="badge">{translateShift(emp.shift)}</span></td>
                                    <td className="text-hub-orange font-bold">{formatCurrency(emp.salary)}</td>
                                    <td>{formatDate(emp.hire_date)}</td>
                                    <td><button onClick={() => setViewing(emp)} className="p-2 hover:bg-white/5 rounded-lg"><Eye className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <EmployeeModal onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function EmployeeModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', shift: 'full', salary: 0, emergency_contact: '' });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Create user first
        const { data: user } = await supabase.from('users').insert([{ name: form.name, email: form.email, phone: form.phone, role: 'staff', is_verified: true }]).select().single();
        if (user) {
            await supabase.from('employees').insert([{ user_id: user.id, address: form.address, shift: form.shift, salary: form.salary, emergency_contact: form.emergency_contact }]);
        }
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">إضافة موظف</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div><label className="block text-sm mb-2">الاسم</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">الإيميل</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">الهاتف</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" /></div>
                        </div>
                        <div><label className="block text-sm mb-2">العنوان</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">الوردية</label><select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} className="input"><option value="morning">صباحية</option><option value="evening">مسائية</option><option value="night">ليلية</option><option value="full">كاملة</option></select></div>
                            <div><label className="block text-sm mb-2">المرتب</label><input type="number" min="0" value={form.salary} onChange={e => setForm({ ...form, salary: +e.target.value })} className="input" /></div>
                        </div>
                        <div><label className="block text-sm mb-2">رقم طوارئ</label><input value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} className="input" /></div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'إضافة'}</button></div>
                </form>
            </div>
        </div>
    );
}
