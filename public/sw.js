// =====================================================
// The Hub - Service Worker
// للعمل Offline وإشعارات Push
// =====================================================

const CACHE_NAME = 'the-hub-v1';
const OFFLINE_URL = '/offline.html';

// الملفات اللي هنحفظها في الكاش
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// =====================================================
// تثبيت الـ Service Worker
// =====================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );

    // تفعيل فوري بدون انتظار
    self.skipWaiting();
});

// =====================================================
// تفعيل الـ Service Worker
// =====================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );

    // التحكم في جميع الصفحات فوراً
    self.clients.claim();
});

// =====================================================
// استقبال الطلبات
// =====================================================
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات غير HTTP
    if (!event.request.url.startsWith('http')) return;

    // تجاهل طلبات API
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'أنت غير متصل بالإنترنت' }),
                    {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
        );
        return;
    }

    // استراتيجية: Network First, Cache Fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // حفظ نسخة في الكاش
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(async () => {
                // محاولة الحصول من الكاش
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // إرجاع صفحة Offline للصفحات
                if (event.request.mode === 'navigate') {
                    const offlineResponse = await caches.match(OFFLINE_URL);
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                }

                // رسالة خطأ عامة
                return new Response('غير متصل بالإنترنت', { status: 503 });
            })
    );
});

// =====================================================
// استقبال Push Notifications
// =====================================================
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    let data = {
        title: 'The Hub',
        body: 'لديك إشعار جديد',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        url: '/',
    };

    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        console.log('[SW] Push data parse error:', e);
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: { url: data.url },
        dir: 'rtl',
        lang: 'ar',
        actions: [
            { action: 'open', title: 'افتح' },
            { action: 'close', title: 'إغلاق' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// =====================================================
// الضغط على الإشعار
// =====================================================
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');

    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // البحث عن نافذة مفتوحة
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // فتح نافذة جديدة
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// =====================================================
// مزامنة البيانات في الخلفية
// =====================================================
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // مزامنة البيانات المحفوظة محلياً
    console.log('[SW] Syncing data...');

    try {
        // الحصول على البيانات المحفوظة
        const cache = await caches.open('pending-requests');
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                const response = await fetch(request.clone());
                if (response.ok) {
                    await cache.delete(request);
                    console.log('[SW] Synced:', request.url);
                }
            } catch (e) {
                console.log('[SW] Sync failed for:', request.url);
            }
        }
    } catch (e) {
        console.log('[SW] Sync error:', e);
    }
}

// =====================================================
// رسالة من الصفحة
// =====================================================
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
