// =====================================================
// The Hub - Inventory Page (المخزن)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, X, Edit2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, translateProductType } from '@/lib/utils';
import type { Product } from '@/types/database';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data } = await supabase.from('products').select('*').order('name');
        setProducts(data || []);
        setLoading(false);
    }

    const filtered = filter === 'all' ? products : products.filter(p => p.type === filter);
    const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_alert);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold">المخزن</h1><p className="text-workspace-muted">{products.length} منتج</p></div>
                <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn btn-primary"><Plus className="w-5 h-5" />إضافة منتج</button>
            </div>

            {lowStock.length > 0 && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    <div><span className="font-bold text-yellow-400">{lowStock.length} منتج</span> وصل للحد الأدنى من المخزون</div>
                </div>
            )}

            <div className="flex gap-2 flex-wrap">
                {['all', 'food', 'drink', 'supply', 'equipment'].map(t => (
                    <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm ${filter === t ? 'gradient-main text-white' : 'bg-white/5 text-workspace-muted'}`}>
                        {t === 'all' ? 'الكل' : translateProductType(t)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(product => (
                    <div key={product.id} className={`card ${product.stock_quantity <= product.min_stock_alert ? 'border-yellow-500/30' : ''}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold">{product.name_ar || product.name}</h3>
                                <span className="badge text-xs">{translateProductType(product.type)}</span>
                            </div>
                            <button onClick={() => { setEditing(product); setShowModal(true); }} className="p-2 hover:bg-white/5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-workspace-muted">السعر</span>
                            <span className="text-hub-orange font-bold">{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-workspace-muted">المخزون</span>
                            <span className={product.stock_quantity <= product.min_stock_alert ? 'text-yellow-400 font-bold' : ''}>{product.stock_quantity}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && <ProductModal product={editing} onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function ProductModal({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ name: product?.name || '', name_ar: product?.name_ar || '', type: product?.type || 'food', price: product?.price || 0, cost_price: product?.cost_price || 0, stock_quantity: product?.stock_quantity || 0, min_stock_alert: product?.min_stock_alert || 5, is_for_sale: product?.is_for_sale ?? true });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        if (product) {
            await supabase.from('products').update(form).eq('id', product.id);
        } else {
            await supabase.from('products').insert([form]);
        }
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">{product ? 'تعديل' : 'إضافة'} منتج</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">الاسم (EN)</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">الاسم (AR)</label><input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="input" /></div>
                        </div>
                        <div><label className="block text-sm mb-2">النوع</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Product['type'] })} className="input"><option value="food">أكل</option><option value="drink">مشروبات</option><option value="supply">مستلزمات</option><option value="equipment">معدات</option></select></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">سعر البيع</label><input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">سعر التكلفة</label><input type="number" min="0" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: +e.target.value })} className="input" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">المخزون</label><input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: +e.target.value })} className="input" /></div>
                            <div><label className="block text-sm mb-2">حد التنبيه</label><input type="number" min="0" value={form.min_stock_alert} onChange={e => setForm({ ...form, min_stock_alert: +e.target.value })} className="input" /></div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.is_for_sale} onChange={e => setForm({ ...form, is_for_sale: e.target.checked })} className="w-5 h-5" /><span>متاح للبيع</span></label>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button></div>
                </form>
            </div>
        </div>
    );
}
