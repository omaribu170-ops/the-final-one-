// =====================================================
// The Hub - Tables Management Page
// صفحة إدارة الترابيزات
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import {
    Table2,
    Plus,
    Edit2,
    Trash2,
    X,
    Users,
    Clock,
    Wallet,
    Image as ImageIcon,
    Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import type { Table } from '@/types/database';

// =====================================================
// الصفحة الرئيسية
// =====================================================
export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // =====================================================
    // جلب الترابيزات
    // =====================================================
    useEffect(() => {
        fetchTables();
    }, []);

    async function fetchTables() {
        try {
            const { data, error } = await supabase
                .from('tables')
                .select('*')
                .order('table_number');

            if (error) throw error;
            setTables(data || []);
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // حذف ترابيزة
    // =====================================================
    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد إنك عايز تحذف الترابيزة دي؟')) return;

        try {
            const { error } = await supabase
                .from('tables')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTables(tables.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('حصل مشكلة في حذف الترابيزة');
        }
    }

    // =====================================================
    // فلترة الترابيزات
    // =====================================================
    const filteredTables = tables.filter((table) =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.table_number.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            {/* =====================================================
          الهيدر
          ===================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الترابيزات</h1>
                    <p className="text-workspace-muted">إدارة ترابيزات المكان</p>
                </div>

                <button
                    onClick={() => {
                        setEditingTable(null);
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    إضافة ترابيزة
                </button>
            </div>

            {/* =====================================================
          البحث
          ===================================================== */}
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                <input
                    type="text"
                    placeholder="ابحث عن ترابيزة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pr-12"
                />
            </div>

            {/* =====================================================
          الترابيزات
          ===================================================== */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-32 bg-white/5 rounded-xl mb-4" />
                            <div className="h-6 bg-white/5 rounded w-1/2 mb-2" />
                            <div className="h-4 bg-white/5 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : filteredTables.length === 0 ? (
                <div className="text-center py-16">
                    <Table2 className="w-20 h-20 mx-auto mb-4 text-workspace-muted opacity-50" />
                    <h3 className="text-xl font-bold mb-2">مفيش ترابيزات</h3>
                    <p className="text-workspace-muted mb-6">
                        {searchQuery ? 'مفيش نتائج للبحث ده' : 'ابدأ بإضافة أول ترابيزة'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة ترابيزة
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTables.map((table) => (
                        <div
                            key={table.id}
                            className="card group hover:border-hub-orange/30 transition-all"
                        >
                            {/* صورة الترابيزة */}
                            <div className="relative h-32 bg-gradient-to-br from-workspace-primary to-workspace-secondary rounded-xl mb-4 overflow-hidden">
                                {table.image_url ? (
                                    <img
                                        src={table.image_url}
                                        alt={table.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Table2 className="w-12 h-12 text-workspace-muted" />
                                    </div>
                                )}

                                {/* رقم الترابيزة */}
                                <div className="absolute top-3 right-3 px-3 py-1 rounded-lg gradient-main text-white font-bold text-sm">
                                    #{table.table_number}
                                </div>

                                {/* أزرار التحكم */}
                                <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingTable(table);
                                            setShowModal(true);
                                        }}
                                        className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
                                        aria-label="تعديل"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(table.id)}
                                        className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
                                        aria-label="حذف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* معلومات الترابيزة */}
                            <h3 className="font-bold text-lg mb-3">{table.name}</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between text-workspace-muted">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>السعة</span>
                                    </div>
                                    <span className="text-white">
                                        {table.capacity_min} - {table.capacity_max} أشخاص
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-workspace-muted">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4" />
                                        <span>سعر الساعة/فرد</span>
                                    </div>
                                    <span className="text-hub-orange font-bold">
                                        {formatCurrency(table.price_per_hour_per_person)}
                                    </span>
                                </div>
                            </div>

                            {/* حالة الترابيزة */}
                            <div className="mt-4 pt-4 border-t border-white/8">
                                <span className={`badge ${table.is_active ? 'badge-success' : 'badge-danger'}`}>
                                    {table.is_active ? 'متاحة' : 'غير متاحة'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* =====================================================
          Modal إضافة/تعديل ترابيزة
          ===================================================== */}
            {showModal && (
                <TableModal
                    table={editingTable}
                    onClose={() => {
                        setShowModal(false);
                        setEditingTable(null);
                    }}
                    onSave={() => {
                        fetchTables();
                        setShowModal(false);
                        setEditingTable(null);
                    }}
                />
            )}
        </div>
    );
}

// =====================================================
// Modal إضافة/تعديل ترابيزة
// =====================================================
function TableModal({
    table,
    onClose,
    onSave,
}: {
    table: Table | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: table?.name || '',
        table_number: table?.table_number || '',
        price_per_hour_per_person: table?.price_per_hour_per_person || '',
        capacity_min: table?.capacity_min || 1,
        capacity_max: table?.capacity_max || 4,
        image_url: table?.image_url || '',
        is_active: table?.is_active ?? true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                name: formData.name,
                table_number: Number(formData.table_number),
                price_per_hour_per_person: Number(formData.price_per_hour_per_person),
                capacity_min: Number(formData.capacity_min),
                capacity_max: Number(formData.capacity_max),
                image_url: formData.image_url || null,
                is_active: formData.is_active,
            };

            if (table) {
                // تعديل
                const { error } = await supabase
                    .from('tables')
                    .update(data)
                    .eq('id', table.id);
                if (error) throw error;
            } else {
                // إضافة
                const { error } = await supabase
                    .from('tables')
                    .insert([data]);
                if (error) throw error;
            }

            onSave();
        } catch (error) {
            console.error('Error saving table:', error);
            alert('حصل مشكلة في حفظ الترابيزة');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {/* الهيدر */}
                <div className="modal-header">
                    <h2 className="text-xl font-bold">
                        {table ? 'تعديل ترابيزة' : 'إضافة ترابيزة جديدة'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* الفورم */}
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        {/* اسم الترابيزة */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">
                                اسم الترابيزة *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="مثال: ترابيزة VIP 1"
                            />
                        </div>

                        {/* رقم الترابيزة */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">
                                رقم الترابيزة *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.table_number}
                                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                                className="input"
                                placeholder="مثال: 1"
                            />
                        </div>

                        {/* سعر الساعة */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">
                                سعر الساعة للفرد (ج.م) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price_per_hour_per_person}
                                onChange={(e) => setFormData({ ...formData, price_per_hour_per_person: e.target.value })}
                                className="input"
                                placeholder="مثال: 50"
                            />
                        </div>

                        {/* السعة */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-workspace-muted mb-2">
                                    أقل عدد أفراد
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacity_min}
                                    onChange={(e) => setFormData({ ...formData, capacity_min: Number(e.target.value) })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-workspace-muted mb-2">
                                    أكثر عدد أفراد *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity_max}
                                    onChange={(e) => setFormData({ ...formData, capacity_max: Number(e.target.value) })}
                                    className="input"
                                />
                            </div>
                        </div>

                        {/* رابط الصورة */}
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">
                                رابط الصورة (اختياري)
                            </label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="input"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* الحالة */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded accent-hub-orange"
                            />
                            <label htmlFor="is_active" className="cursor-pointer">
                                الترابيزة متاحة للاستخدام
                            </label>
                        </div>
                    </div>

                    {/* الأزرار */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading" />
                            ) : table ? (
                                'حفظ التعديلات'
                            ) : (
                                'إضافة الترابيزة'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
