// =====================================================
// The Hub - Root Layout
// التخطيط الأساسي للتطبيق
// =====================================================

import type { Metadata, Viewport } from 'next';
import './globals.css';

// =====================================================
// الـ Metadata الأساسية للتطبيق
// =====================================================
export const metadata: Metadata = {
    title: 'The Hub | مساحة العمل والترفيه',
    description: 'مساحة عمل مشتركة ومركز ترفيهي - احجز مكانك الآن',
    keywords: ['co-working', 'workspace', 'entertainment', 'games', 'مساحة عمل', 'ترفيه'],
    authors: [{ name: 'The Hub Team' }],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'The Hub',
    },
    formatDetection: {
        telephone: true,
    },
    openGraph: {
        title: 'The Hub | مساحة العمل والترفيه',
        description: 'مساحة عمل مشتركة ومركز ترفيهي',
        type: 'website',
        locale: 'ar_EG',
    },
};

// =====================================================
// الـ Viewport للموبايل
// =====================================================
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0a0a0f' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    ],
};

// =====================================================
// الـ Root Layout Component
// =====================================================
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <head>
                {/* خط IBM Plex Arabic */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* أيقونات للموبايل */}
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />

                {/* Splash Screen للـ iOS */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className="min-h-screen antialiased">
                {/* Provider للتحكم في الاتصال */}
                <NetworkStatusProvider>
                    {children}
                </NetworkStatusProvider>

                {/* تسجيل Service Worker */}
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}

// =====================================================
// مكون حالة الاتصال
// =====================================================
function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            {/* كمبوننت الـ Offline/Online سيتم إضافته لاحقاً */}
        </>
    );
}

// =====================================================
// تسجيل الـ Service Worker
// =====================================================
function ServiceWorkerRegistration() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(function(error) {
                  console.log('ServiceWorker registration failed:', error);
                });
            });
          }
        `,
            }}
        />
    );
}
