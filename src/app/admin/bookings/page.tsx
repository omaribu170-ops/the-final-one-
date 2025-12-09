// =====================================================
// The Hub - Bookings Page (الحجوزات)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, Check, X, Search, Download, Eye, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, formatCurrency, exportToCSV, getInitials } from '@/lib/utils';
import type { Booking, User, Table } from '@/types/database';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<(Booking & { user: User; table: Table })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('bookings').select('*, user:users(*), table:tables(*)').order('booking_date', { ascending: false });
        setBookings(data || []);
        setLoading(false);
    }

    async function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
        await supabase.from('bookings').update({ status }).eq('id', id);
        fetchData();
    }

    const filtered = bookings.filter(b => {
        const matchesFilter = filter === 'all' || b.status === filter;
        const matchesSearch = !searchQuery || b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.user?.phone?.includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    const pending = bookings.filter(b => b.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">الحجوزات</h1>{pending > 0 && <p className="text-yellow-400">{pending} حجز في الانتظار</p>}</div>
                <button onClick={() => exportToCSV(bookings.map(b => ({ العميل: b.user?.name, التاريخ: b.booking_date, الوقت: `${b.start_time}-${b.end_time}`, الأشخاص: b.people_count, الحالة: b.status })), 'bookings')} className="btn btn-secondary"><Download className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                    <input type="text" placeholder="ابحث بالاسم أو الرقم..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input pr-12" />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm ${filter === s ? 'gradient-main text-white' : 'bg-white/5'}`}>
                            {s === 'all' ? 'الكل' : s === 'pending' ? 'في الانتظار' : s === 'confirmed' ? 'مؤكد' : s === 'cancelled' ? 'ملغي' : 'مكتمل'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>العميل</th><th>التاريخ</th><th>الوقت</th><th>الترابيزة</th><th>الأشخاص</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>
                        {filtered.map(booking => (
                            <tr key={booking.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full gradient-main flex items-center justify-center font-bold text-sm">{getInitials(booking.user?.name || '')}</div>
                                        <div><div className="font-medium">{booking.user?.name}</div><div className="text-sm text-workspace-muted">{booking.user?.phone}</div></div>
                                    </div>
                                </td>
                                <td>{formatDate(booking.booking_date)}</td>
                                <td>{booking.start_time} - {booking.end_time || '?'}</td>
                                <td>{booking.table?.name || '-'}</td>
                                <td><span className="flex items-center gap-1"><Users className="w-4 h-4" />{booking.people_count}</span></td>
                                <td>
                                    <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : booking.status === 'pending' ? 'badge-warning' : booking.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                        {booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'pending' ? 'في الانتظار' : booking.status === 'cancelled' ? 'ملغي' : 'مكتمل'}
                                    </span>
                                </td>
                                <td>
                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => updateStatus(booking.id, 'cancelled')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-workspace-muted">لا توجد حجوزات</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
