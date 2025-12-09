// =====================================================
// The Hub - Register Page
// صفحة التسجيل
// =====================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { isValidEmail, isValidPhone } from '@/lib/utils';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!isValidEmail(form.email)) { setError('الإيميل ده مش صح يا برنس'); return; }
        if (!isValidPhone(form.phone)) { setError('رقم التليفون ده فيه مشكلة'); return; }
        if (form.password.length < 6) { setError('كلمة السر لازم تكون 6 حروف على الأقل'); return; }
        if (form.password !== form.confirmPassword) { setError('كلمتين السر مش زي بعض'); return; }

        setLoading(true);

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            );

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: { data: { name: form.name, phone: form.phone } }
            });

            if (authError) {
                if (authError.message.includes('already')) setError('الإيميل ده مسجل قبل كدة');
                else setError('حصل مشكلة، جرب تاني');
                return;
            }

            if (authData.user) {
                await supabase.from('users').insert([{
                    id: authData.user.id,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    role: 'user',
                    is_verified: false,
                }]);
            }

            router.push('/');
        } catch (err) {
            setError('حصل مشكلة، جرب تاني');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl gradient-main flex items-center justify-center font-bold text-4xl text-white mx-auto mb-4">H</div>
                    <h1 className="text-2xl font-bold">سجل معانا</h1>
                    <p className="text-workspace-muted mt-2">وابدأ رحلتك في The Hub</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">الاسم</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input pr-12" placeholder="اسمك الكامل" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">الإيميل</label>
                        <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input pr-12" placeholder="example@email.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">رقم التليفون</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input pr-12" placeholder="01xxxxxxxxx" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">كلمة السر</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-12 pl-12" placeholder="6 حروف على الأقل" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2">
                                {showPassword ? <EyeOff className="w-5 h-5 text-workspace-muted" /> : <Eye className="w-5 h-5 text-workspace-muted" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">تأكيد كلمة السر</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="input pr-12" placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? 'جاري التسجيل...' : 'سجل'}
                    </button>
                </form>

                <p className="text-center mt-6 text-workspace-muted">
                    عندك حساب؟{' '}
                    <Link href="/login" className="text-hub-orange font-medium">سجل دخول</Link>
                </p>
            </div>
        </div>
    );
}
