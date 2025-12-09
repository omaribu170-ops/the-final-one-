// =====================================================
// The Hub - Sessions Management Page
// صفحة إدارة الجلسات
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Clock,
    Plus,
    X,
    Search,
    Download,
    Play,
    Square,
    Users,
    CreditCard,
    Wallet,
    Banknote,
    FileText,
    Printer,
    Coffee,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import {
    formatCurrency,
    formatDate,
    formatTime,
    formatDuration,
    calculateHours,
    exportToCSV,
    translatePaymentMethod,
} from '@/lib/utils';
import type { Session, Table, User, Product } from '@/types/database';

// =====================================================
// الصفحة الرئيسية
// =====================================================
export default function SessionsPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [historySessions, setHistorySessions] = useState<Session[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewSessionModal, setShowNewSessionModal] = useState(false);
    const [endingSession, setEndingSession] = useState<Session | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // =====================================================
    // جلب البيانات
    // =====================================================
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // جلب الجلسات النشطة
            const { data: activeData } = await supabase
                .from('sessions')
                .select(`
          *,
          table:tables(*),
          members:session_members(*, user:users(*)),
          orders:session_orders(*, product:products(*))
        `)
                .eq('status', 'active')
                .order('start_time', { ascending: false });

            // جلب سجل الجلسات
            const { data: historyData } = await supabase
                .from('sessions')
                .select(`
          *,
          table:tables(*),
          members:session_members(*, user:users(*))
        `)
                .eq('status', 'closed')
                .order('end_time', { ascending: false })
                .limit(100);

            // جلب الترابيزات
            const { data: tablesData } = await supabase
                .from('tables')
                .select('*')
                .eq('is_active', true)
                .order('table_number');

            // جلب الأعضاء
            const { data: membersData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'user')
                .eq('is_active', true);

            // جلب المنتجات
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .eq('is_for_sale', true);

            setActiveSessions(activeData || []);
            setHistorySessions(historyData || []);
            setTables(tablesData || []);
            setMembers(membersData || []);
            setProducts(productsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // تصدير CSV
    // =====================================================
    function handleExport() {
        const data = historySessions.map((s) => ({
            'التاريخ': formatDate(s.start_time),
            'وقت البدء': formatTime(s.start_time),
            'وقت الانتهاء': s.end_time ? formatTime(s.end_time) : '-',
            'الترابيزة': s.table?.name || '-',
            'عدد الأشخاص': s.members?.length || 0,
            'سعر الترابيزة': s.table_price,
            'سعر المنتجات': s.products_price,
            'الإجمالي': s.total_price,
            'طريقة الدفع': translatePaymentMethod(s.payment_method || ''),
        }));
        exportToCSV(data, 'sessions-history');
    }

    return (
        <div className="space-y-6">
            {/* =====================================================
          الهيدر
          ===================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الجلسات</h1>
                    <p className="text-workspace-muted">
                        {activeSessions.length} جلسة نشطة
                    </p>
                </div>

                <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    جلسة جديدة
                </button>
            </div>

            {/* =====================================================
          التابات
          ===================================================== */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'active'
                            ? 'gradient-main text-white'
                            : 'text-workspace-muted hover:bg-white/5'
                        }`}
                >
                    <Clock className="w-5 h-5 inline-block ml-2" />
                    الجلسات النشطة ({activeSessions.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'history'
                            ? 'gradient-main text-white'
                            : 'text-workspace-muted hover:bg-white/5'
                        }`}
                >
                    <FileText className="w-5 h-5 inline-block ml-2" />
                    السجل
                </button>
            </div>

            {/* =====================================================
          المحتوى
          ===================================================== */}
            {activeTab === 'active' ? (
                <ActiveSessionsTab
                    sessions={activeSessions}
                    loading={loading}
                    onEndSession={(session) => setEndingSession(session)}
                    onRefresh={fetchData}
                />
            ) : (
                <HistoryTab
                    sessions={historySessions}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    onExport={handleExport}
                />
            )}

            {/* =====================================================
          Modal جلسة جديدة
          ===================================================== */}
            {showNewSessionModal && (
                <NewSessionModal
                    tables={tables}
                    members={members}
                    products={products}
                    activeSessions={activeSessions}
                    onClose={() => setShowNewSessionModal(false)}
                    onSave={() => {
                        fetchData();
                        setShowNewSessionModal(false);
                    }}
                />
            )}

            {/* =====================================================
          Modal إنهاء الجلسة
          ===================================================== */}
            {endingSession && (
                <EndSessionModal
                    session={endingSession}
                    onClose={() => setEndingSession(null)}
                    onConfirm={() => {
                        fetchData();
                        setEndingSession(null);
                    }}
                />
            )}
        </div>
    );
}

// =====================================================
// تاب الجلسات النشطة
// =====================================================
function ActiveSessionsTab({
    sessions,
    loading,
    onEndSession,
    onRefresh,
}: {
    sessions: Session[];
    loading: boolean;
    onEndSession: (session: Session) => void;
    onRefresh: () => void;
}) {
    // تحديث كل 30 ثانية
    useEffect(() => {
        const interval = setInterval(onRefresh, 30000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="h-8 bg-white/5 rounded w-1/2 mb-4" />
                        <div className="h-20 bg-white/5 rounded mb-4" />
                        <div className="h-10 bg-white/5 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-16">
                <Clock className="w-20 h-20 mx-auto mb-4 text-workspace-muted opacity-50" />
                <h3 className="text-xl font-bold mb-2">مفيش جلسات نشطة</h3>
                <p className="text-workspace-muted">ابدأ بإضافة جلسة جديدة</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
                <ActiveSessionCard
                    key={session.id}
                    session={session}
                    onEnd={() => onEndSession(session)}
                />
            ))}
        </div>
    );
}

// =====================================================
// بطاقة الجلسة النشطة
// =====================================================
function ActiveSessionCard({
    session,
    onEnd,
}: {
    session: Session;
    onEnd: () => void;
}) {
    const [elapsed, setElapsed] = useState('');
    const [currentPrice, setCurrentPrice] = useState(0);

    // تحديث التايمر والسعر
    useEffect(() => {
        function update() {
            const hours = calculateHours(session.start_time);
            const pricePerPerson = session.table?.price_per_hour_per_person || 0;
            const memberCount = session.members?.length || 1;
            const tablePrice = Math.ceil(hours) * pricePerPerson * memberCount;
            const productsPrice = session.products_price || 0;

            setCurrentPrice(tablePrice + productsPrice);
            setElapsed(formatDuration(hours));
        }

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [session]);

    return (
        <div className="card border-hub-orange/30">
            {/* الهيدر */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-main flex items-center justify-center font-bold">
                        T{session.table?.table_number}
                    </div>
                    <div>
                        <div className="font-bold">{session.table?.name}</div>
                        <div className="text-sm text-workspace-muted">
                            بدأت {formatTime(session.start_time)}
                        </div>
                    </div>
                </div>

                {/* التايمر */}
                <div className="text-left">
                    <div className="text-2xl font-bold text-hub-orange font-mono">
                        {elapsed}
                    </div>
                </div>
            </div>

            {/* الأعضاء */}
            <div className="flex items-center gap-2 mb-4 text-sm text-workspace-muted">
                <Users className="w-4 h-4" />
                <span>
                    {session.members?.map((m) => m.user?.name || m.guest_name).join('، ') || 'بدون أعضاء'}
                </span>
            </div>

            {/* السعر الحالي */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 mb-4">
                <span className="text-workspace-muted">السعر حتى الآن</span>
                <span className="text-xl font-bold gradient-text">
                    {formatCurrency(currentPrice)}
                </span>
            </div>

            {/* زر الإنهاء */}
            <button onClick={onEnd} className="btn btn-danger w-full">
                <Square className="w-5 h-5" />
                إنهاء الجلسة
            </button>
        </div>
    );
}

// =====================================================
// تاب السجل
// =====================================================
function HistoryTab({
    sessions,
    loading,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    onExport,
}: {
    sessions: Session[];
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    dateFilter: string;
    setDateFilter: (d: string) => void;
    onExport: () => void;
}) {
    const filteredSessions = sessions.filter((s) => {
        const matchesSearch = searchQuery
            ? s.members?.some((m) =>
                m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.user?.phone?.includes(searchQuery)
            )
            : true;

        const matchesDate = dateFilter
            ? s.start_time.startsWith(dateFilter)
            : true;

        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-4">
            {/* الفلاتر */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الرقم..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pr-12"
                    />
                </div>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input w-auto"
                />
                <button onClick={onExport} className="btn btn-secondary">
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            {/* الجدول */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الترابيزة</th>
                            <th>المدة</th>
                            <th>الأعضاء</th>
                            <th>الإجمالي</th>
                            <th>طريقة الدفع</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={6}>
                                        <div className="h-12 bg-white/5 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredSessions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-workspace-muted">
                                    مفيش جلسات سابقة
                                </td>
                            </tr>
                        ) : (
                            filteredSessions.map((session) => (
                                <tr key={session.id}>
                                    <td>
                                        <div>{formatDate(session.start_time)}</div>
                                        <div className="text-sm text-workspace-muted">
                                            {formatTime(session.start_time)} - {session.end_time ? formatTime(session.end_time) : '-'}
                                        </div>
                                    </td>
                                    <td>{session.table?.name}</td>
                                    <td>
                                        {session.end_time
                                            ? formatDuration(calculateHours(session.start_time, session.end_time))
                                            : '-'}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-workspace-muted" />
                                            <span>{session.members?.length || 0}</span>
                                        </div>
                                    </td>
                                    <td className="font-bold text-hub-orange">
                                        {formatCurrency(session.total_price)}
                                    </td>
                                    <td>
                                        <span className="badge">
                                            {translatePaymentMethod(session.payment_method || '')}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =====================================================
// Modal جلسة جديدة
// =====================================================
function NewSessionModal({
    tables,
    members,
    products,
    activeSessions,
    onClose,
    onSave,
}: {
    tables: Table[];
    members: User[];
    products: Product[];
    activeSessions: Session[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>([]);

    // الترابيزات المتاحة (غير مشغولة)
    const availableTables = tables.filter(
        (t) => !activeSessions.some((s) => s.table_id === t.id)
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedTable) return;

        setLoading(true);

        try {
            // إنشاء الجلسة
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .insert([{
                    table_id: selectedTable.id,
                    status: 'active',
                }])
                .select()
                .single();

            if (sessionError) throw sessionError;

            // إضافة الأعضاء
            if (selectedMembers.length > 0) {
                const membersToInsert = selectedMembers.map((userId) => ({
                    session_id: session.id,
                    user_id: userId,
                }));

                await supabase.from('session_members').insert(membersToInsert);
            }

            // إضافة المنتجات
            if (selectedProducts.length > 0) {
                const productsToInsert = selectedProducts.map((p) => {
                    const product = products.find((pr) => pr.id === p.id);
                    return {
                        session_id: session.id,
                        product_id: p.id,
                        quantity: p.quantity,
                        price_at_time: product?.price || 0,
                        total_price: (product?.price || 0) * p.quantity,
                    };
                });

                await supabase.from('session_orders').insert(productsToInsert);
            }

            onSave();
        } catch (error) {
            console.error('Error creating session:', error);
            alert('حصل مشكلة في إنشاء الجلسة');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-xl font-bold">جلسة جديدة</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-6">
                        {/* اختيار الترابيزة */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-3">
                                اختر الترابيزة *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {availableTables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        onClick={() => setSelectedTable(table)}
                                        className={`p-4 rounded-xl border text-center transition-all ${selectedTable?.id === table.id
                                                ? 'border-hub-orange bg-hub-orange/10'
                                                : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="font-bold">T{table.table_number}</div>
                                        <div className="text-sm text-workspace-muted">{table.name}</div>
                                        <div className="text-xs text-hub-orange mt-1">
                                            {formatCurrency(table.price_per_hour_per_person)}/ساعة
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {availableTables.length === 0 && (
                                <p className="text-center py-4 text-workspace-muted">
                                    كل الترابيزات مشغولة
                                </p>
                            )}
                        </div>

                        {/* اختيار الأعضاء */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-3">
                                الأعضاء (اختياري)
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-xl p-2">
                                {members.map((member) => (
                                    <label
                                        key={member.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedMembers([...selectedMembers, member.id]);
                                                } else {
                                                    setSelectedMembers(selectedMembers.filter((id) => id !== member.id));
                                                }
                                            }}
                                            className="w-5 h-5 rounded accent-hub-orange"
                                        />
                                        <span>{member.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* إضافة منتجات */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-3">
                                منتجات (اختياري)
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-xl p-2">
                                {products.map((product) => {
                                    const selected = selectedProducts.find((p) => p.id === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Coffee className="w-5 h-5 text-workspace-muted" />
                                                <span>{product.name_ar || product.name}</span>
                                                <span className="text-hub-orange text-sm">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selected && selected.quantity > 1) {
                                                            setSelectedProducts(
                                                                selectedProducts.map((p) =>
                                                                    p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
                                                                )
                                                            );
                                                        } else if (selected) {
                                                            setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center">{selected?.quantity || 0}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selected) {
                                                            setSelectedProducts(
                                                                selectedProducts.map((p) =>
                                                                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                                                                )
                                                            );
                                                        } else {
                                                            setSelectedProducts([...selectedProducts, { id: product.id, quantity: 1 }]);
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !selectedTable}
                        >
                            {loading ? <span className="loading" /> : 'بدء الجلسة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =====================================================
// Modal إنهاء الجلسة
// =====================================================
function EndSessionModal({
    session,
    onClose,
    onConfirm,
}: {
    session: Session;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [step, setStep] = useState<'confirm' | 'payment'>('confirm');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'visa' | 'wallet'>('cash');
    const [paymentDetails, setPaymentDetails] = useState('');

    // حساب السعر النهائي
    const hours = calculateHours(session.start_time);
    const pricePerPerson = session.table?.price_per_hour_per_person || 0;
    const memberCount = session.members?.length || 1;
    const tablePrice = Math.ceil(hours) * pricePerPerson * memberCount;
    const productsPrice = session.orders?.reduce((sum, o) => sum + o.total_price, 0) || 0;
    const totalPrice = tablePrice + productsPrice;

    async function handleConfirmEnd() {
        setStep('payment');
    }

    async function handleConfirmPayment() {
        setLoading(true);

        try {
            // تحديث الجلسة
            const { error } = await supabase
                .from('sessions')
                .update({
                    status: 'closed',
                    end_time: new Date().toISOString(),
                    table_price: tablePrice,
                    products_price: productsPrice,
                    total_price: totalPrice,
                    payment_method: paymentMethod,
                    payment_details: paymentDetails || null,
                    is_paid: true,
                })
                .eq('id', session.id);

            if (error) throw error;

            onConfirm();
        } catch (error) {
            console.error('Error ending session:', error);
            alert('حصل مشكلة في إنهاء الجلسة');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-xl font-bold">
                        {step === 'confirm' ? 'إنهاء الجلسة' : 'تأكيد الدفع'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="modal-body">
                    {step === 'confirm' ? (
                        <div className="space-y-4">
                            <p className="text-center text-lg mb-6">
                                هل أنت متأكد إنك عايز تقفل الجلسة؟
                            </p>

                            {/* تفاصيل الفاتورة */}
                            <div className="p-4 rounded-xl bg-white/5 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-workspace-muted">الترابيزة</span>
                                    <span>{session.table?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-workspace-muted">المدة</span>
                                    <span>{formatDuration(hours)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-workspace-muted">عدد الأشخاص</span>
                                    <span>{memberCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-workspace-muted">سعر الترابيزة</span>
                                    <span>{formatCurrency(tablePrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-workspace-muted">سعر المنتجات</span>
                                    <span>{formatCurrency(productsPrice)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                                    <span>الإجمالي</span>
                                    <span className="gradient-text">{formatCurrency(totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-center mb-4">متأكد إنهم دفعوا؟</p>

                            <div className="text-center text-3xl font-bold gradient-text mb-6">
                                {formatCurrency(totalPrice)}
                            </div>

                            {/* طريقة الدفع */}
                            <div>
                                <label className="block text-sm text-workspace-muted mb-3">
                                    وسيلة الدفع
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'cash', label: 'كاش', icon: Banknote },
                                        { value: 'visa', label: 'فيزا', icon: CreditCard },
                                        { value: 'wallet', label: 'محفظة', icon: Wallet },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPaymentMethod(value as typeof paymentMethod)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === value
                                                    ? 'border-hub-orange bg-hub-orange/10'
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-sm">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* تفاصيل إضافية */}
                            {paymentMethod === 'visa' && (
                                <div>
                                    <label className="block text-sm text-workspace-muted mb-2">
                                        اسم صاحب الكارت
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDetails}
                                        onChange={(e) => setPaymentDetails(e.target.value)}
                                        className="input"
                                        placeholder="الاسم على الكارت"
                                    />
                                </div>
                            )}

                            {paymentMethod === 'wallet' && (
                                <div>
                                    <label className="block text-sm text-workspace-muted mb-2">
                                        اسم صاحب التحويل أو رقم المحفظة
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDetails}
                                        onChange={(e) => setPaymentDetails(e.target.value)}
                                        className="input"
                                        placeholder="الاسم أو الرقم"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
                        إلغاء
                    </button>
                    {step === 'confirm' ? (
                        <button onClick={handleConfirmEnd} className="btn btn-primary">
                            تأكيد
                        </button>
                    ) : (
                        <button onClick={handleConfirmPayment} className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading" /> : 'تأكيد الدفع'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
