// =====================================================
// The Hub - Supabase Client (Browser)
// للاستخدام في الـ Client Components
// =====================================================

import { createBrowserClient } from '@supabase/ssr';

// إنشاء Supabase client للمتصفح
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// للاستخدام المباشر
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
