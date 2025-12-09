// =====================================================
// The Hub - Store Page
// صفحة المتجر (تعمل فقط أثناء الجلسة)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, ShoppingCart, X, Check, Coffee, Pizza } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, translateProductType } from '@/lib/utils';
import type { Product, Session } from '@/types/database';

export default function StorePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [success, setSuccess] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => { checkSession(); fetchProducts(); }, []);

    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data } = await supabase.from('session_members').select('session:sessions(*)').eq('user_id', session.user.id).eq('session.status', 'active').single();
            if (data?.session) setActiveSession(data.session as unknown as Session);
        }
        setLoading(false);
    }

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('*').eq('is_active', true).eq('is_for_sale', true);
        setProducts(data || []);
    }

    function addToCart(productId: string) {
        setCart(prev => {
            const existing = prev.find(c => c.id === productId);
            if (existing) return prev.map(c => c.id === productId ? { ...c, quantity: c.quantity + 1 } : c);
            return [...prev, { id: productId, quantity: 1 }];
        });
    }

    function removeFromCart(productId: string) {
        setCart(prev => prev.map(c => c.id === productId ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
    }

    async function submitOrder() {
        if (!activeSession || cart.length === 0) return;
        setOrdering(true);

        const orders = cart.map(c => {
            const product = products.find(p => p.id === c.id);
            return {
                session_id: activeSession.id,
                product_id: c.id,
                quantity: c.quantity,
                price_at_time: product?.price || 0,
                total_price: (product?.price || 0) * c.quantity,
            };
        });

        await supabase.from('session_orders').insert(orders);
        setCart([]);
        setOrdering(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    }

    const cartTotal = cart.reduce((sum, c) => {
        const product = products.find(p => p.id === c.id);
        return sum + (product?.price || 0) * c.quantity;
    }, 0);

    const filtered = filter === 'all' ? products : products.filter(p => p.type === filter);

    if (loading) return <div className="text-center py-16">جاري التحميل...</div>;

    if (!activeSession) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-20 h-20 text-workspace-muted mb-6" />
                <h1 className="text-2xl font-bold mb-2">المتجر مغلق</h1>
                <p className="text-workspace-muted">المتجر بيفتح بس لما تكون في جلسة</p>
            </div>
        );
    }

    return (
        <div className="pb-32">
            <h1 className="text-2xl font-bold mb-6">المتجر</h1>

            {success && (
                <div className="fixed top-20 left-4 right-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3 z-50">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>تم إضافة طلبك للفاتورة!</span>
                </div>
            )}

            {/* الفلتر */}
            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                {['all', 'drink', 'food'].map(t => (
                    <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === t ? 'gradient-main text-white' : 'bg-white/5'}`}>
                        {t === 'all' ? 'الكل' : t === 'drink' ? '☕ مشروبات' : '🍕 أكل'}
                    </button>
                ))}
            </div>

            {/* المنتجات */}
            <div className="grid grid-cols-2 gap-4">
                {filtered.map(product => {
                    const inCart = cart.find(c => c.id === product.id);
                    return (
                        <div key={product.id} className="card">
                            <div className="text-4xl mb-3">{product.type === 'drink' ? '☕' : '🍕'}</div>
                            <h3 className="font-bold">{product.name_ar || product.name}</h3>
                            <p className="text-hub-orange font-bold mt-1">{formatCurrency(product.price)}</p>

                            {inCart ? (
                                <div className="flex items-center justify-between mt-4">
                                    <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-lg bg-white/5">-</button>
                                    <span className="font-bold">{inCart.quantity}</span>
                                    <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded-lg gradient-main">+</button>
                                </div>
                            ) : (
                                <button onClick={() => addToCart(product.id)} className="btn btn-secondary w-full mt-4 text-sm">
                                    <Plus className="w-4 h-4" />إضافة
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* السلة */}
            {cart.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 p-4 rounded-2xl bg-workspace-card border border-white/10 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-workspace-muted">{cart.reduce((s, c) => s + c.quantity, 0)} منتج</div>
                            <div className="text-xl font-bold">{formatCurrency(cartTotal)}</div>
                        </div>
                        <button onClick={submitOrder} disabled={ordering} className="btn btn-primary">
                            {ordering ? '...' : <><ShoppingCart className="w-5 h-5" />طلب</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
