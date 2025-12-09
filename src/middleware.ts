// =====================================================
// The Hub - Middleware
// للتحكم في الوصول والـ Authentication
// =====================================================

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// =====================================================
// المسارات المحمية (تحتاج تسجيل دخول)
// =====================================================
const protectedRoutes = [
    '/admin',
    '/profile',
    '/booking',
    '/store',
    '/tools/somaida',
    '/tools/notes',
];

// =====================================================
// مسارات الأدمن فقط
// =====================================================
const adminRoutes = ['/admin'];

// =====================================================
// مسارات السوبر أدمن فقط
// =====================================================
const superAdminRoutes = [
    '/admin/employees',
    '/admin/statistics',
    '/admin/settings',
];

// =====================================================
// Middleware Function
// =====================================================
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // إنشاء Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // الحصول على الـ Session
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;

    // =====================================================
    // التحقق من المسارات المحمية
    // =====================================================
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !session) {
        // توجيه لصفحة الدخول
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // =====================================================
    // التحقق من مسارات الأدمن
    // =====================================================
    if (session && adminRoutes.some((route) => pathname.startsWith(route))) {
        // جلب بيانات المستخدم
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (!user || !['super_admin', 'admin', 'staff'].includes(user.role)) {
            // ليس أدمن - توجيه للصفحة الرئيسية
            return NextResponse.redirect(new URL('/', request.url));
        }

        // التحقق من مسارات السوبر أدمن
        if (superAdminRoutes.some((route) => pathname.startsWith(route))) {
            if (user.role !== 'super_admin') {
                // ليس سوبر أدمن - توجيه للداشبورد
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    // =====================================================
    // إعادة توجيه المسجلين من صفحات الـ Auth
    // =====================================================
    if (session && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

// =====================================================
// Config - المسارات التي تطبق عليها الـ Middleware
// =====================================================
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         * - api routes (API)
         */
        '/((?!_next/static|_next/image|favicon.ico|icons|images|sw.js|manifest.json|offline.html).*)',
    ],
};
