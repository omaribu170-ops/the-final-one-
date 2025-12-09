// =====================================================
// The Hub - Booking Page
// صفحة الحجز
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CreditCard, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Table, Product } from '@/types/database';

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [tables, setTables] = useState<Table[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [form, setForm] = useState({
        date: '',
        startTime: '',
        endTime: '',
        peopleCount: 2,
        tableId: '',
        selectedProducts: [] as { id: string; quantity: number }[],
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        supabase.from('tables').select('*').eq('is_active', true).then(({ data }) => setTables(data || []));
        supabase.from('products').select('*').eq('is_active', true).eq('is_for_sale', true).then(({ data }) => setProducts(data || []));
    }, []);

    const selectedTable = tables.find(t => t.id === form.tableId);
    const productsTotal = form.selectedProducts.reduce((sum, sp) => {
        const p = products.find(pr => pr.id === sp.id);
        return sum + (p?.price || 0) * sp.quantity;
    }, 0);

    async function handleSubmit() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { setLoading(false); return; }

        await supabase.from('bookings').insert([{
            user_id: session.user.id,
            booking_date: form.date,
            start_time: form.startTime,
            end_time: form.endTime,
            people_count: form.peopleCount,
            table_id: form.tableId || null,
            status: 'pending',
        }]);

        setLoading(false);
        setSuccess(true);
    }

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">تم استلام طلبك!</h1>
                <p className="text-workspace-muted mb-6">هنتواصل معاك قريب لتأكيد الحجز</p>
                <a href="/" className="btn btn-primary">رجوع للرئيسية</a>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <h1 className="text-2xl font-bold mb-6">احجز جلستك</h1>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex-1 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'gradient-main text-white' : 'bg-white/5'}`}>{s}</div>
                        {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'gradient-main' : 'bg-white/5'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div><label className="block text-sm mb-2">التاريخ</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input" min={new Date().toISOString().split('T')[0]} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm mb-2">من الساعة</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm mb-2">لحد الساعة</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="input" /></div>
                    </div>
                    <div>
                        <label className="block text-sm mb-2">عدد الأشخاص</label>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setForm({ ...form, peopleCount: Math.max(1, form.peopleCount - 1) })} className="w-10 h-10 rounded-xl bg-white/5">-</button>
                            <span className="text-2xl font-bold">{form.peopleCount}</span>
                            <button onClick={() => setForm({ ...form, peopleCount: form.peopleCount + 1 })} className="w-10 h-10 rounded-xl bg-white/5">+</button>
                        </div>
                    </div>
                    <button onClick={() => setStep(2)} disabled={!form.date || !form.startTime} className="btn btn-primary w-full mt-6">التالي</button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <p className="text-workspace-muted mb-4">اختر ترابيزة (اختياري)</p>
                    <div className="grid grid-cols-2 gap-3">
                        {tables.filter(t => t.capacity_max >= form.peopleCount).map(table => (
                            <button key={table.id} onClick={() => setForm({ ...form, tableId: table.id })} className={`p-4 rounded-xl border text-center ${form.tableId === table.id ? 'border-hub-orange bg-hub-orange/10' : 'border-white/10'}`}>
                                <div className="font-bold">T{table.table_number}</div>
                                <div className="text-sm text-workspace-muted">{table.name}</div>
                                <div className="text-xs text-hub-orange mt-1">{formatCurrency(table.price_per_hour_per_person)}/ساعة</div>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">رجوع</button>
                        <button onClick={() => setStep(3)} className="btn btn-primary flex-1">التالي</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-bold mb-4">ملخص الحجز</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-workspace-muted">التاريخ</span><span>{formatDate(form.date)}</span></div>
                            <div className="flex justify-between"><span className="text-workspace-muted">الوقت</span><span>{form.startTime} - {form.endTime}</span></div>
                            <div className="flex justify-between"><span className="text-workspace-muted">الأشخاص</span><span>{form.peopleCount}</span></div>
                            {selectedTable && <div className="flex justify-between"><span className="text-workspace-muted">الترابيزة</span><span>{selectedTable.name}</span></div>}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">رجوع</button>
                        <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1">{loading ? '...' : 'تأكيد الحجز'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
