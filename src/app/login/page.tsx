// =====================================================
// The Hub - Login Page
// صفحة تسجيل الدخول
// =====================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            );
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes('Invalid')) setError('الإيميل أو كلمة السر غلط');
                else setError('حصل مشكلة، جرب تاني');
                return;
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
                    <h1 className="text-2xl font-bold">أهلاً بيك في The Hub</h1>
                    <p className="text-workspace-muted mt-2">سجل دخولك عشان تبدأ</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">الإيميل</label>
                        <div className="relative">
                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input pr-12" placeholder="example@email.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-workspace-muted mb-2">كلمة السر</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="input pr-12 pl-12" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2">
                                {showPassword ? <EyeOff className="w-5 h-5 text-workspace-muted" /> : <Eye className="w-5 h-5 text-workspace-muted" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? 'جاري التحميل...' : 'دخول'}
                    </button>
                </form>

                <p className="text-center mt-6 text-workspace-muted">
                    معندكش حساب؟{' '}
                    <Link href="/register" className="text-hub-orange font-medium">سجل دلوقتي</Link>
                </p>
            </div>
        </div>
    );
}
