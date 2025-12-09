// =====================================================
// The Hub - Homepage (الصفحة الرئيسية)
// =====================================================

import Link from 'next/link';
import { Clock, BookOpen, Brain, StickyNote, ChevronLeft, Sparkles } from 'lucide-react';

// الأدوات المتاحة
const tools = [
    { href: '/tools/pomodoro', icon: Clock, title: 'Pomodoro', desc: 'تايمر للتركيز', color: 'from-red-500/20 to-orange-500/10' },
    { href: '/tools/somaida', icon: Brain, title: 'صميدة AI', desc: 'مساعدك الذكي', color: 'from-purple-500/20 to-pink-500/10' },
    { href: '/tools/notes', icon: StickyNote, title: 'الملاحظات', desc: 'دوّن أفكارك', color: 'from-yellow-500/20 to-orange-500/10' },
];

export default function HomePage() {
    return (
        <div className="space-y-6 pb-20">
            {/* =====================================================
          بانرات العروض
          ===================================================== */}
            <section className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-[300px] h-[160px] rounded-2xl gradient-main flex items-center justify-center text-white font-bold text-xl">
                            عرض {i}
                        </div>
                    ))}
                </div>
            </section>

            {/* =====================================================
          استخدم أدواتنا
          ===================================================== */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">استخدم أدواتنا</h2>
                    <Link href="/tools" className="text-hub-orange text-sm flex items-center gap-1">
                        المزيد <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {tools.map((tool) => (
                        <Link key={tool.href} href={tool.href} className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} border border-white/10 text-center hover:scale-105 transition-transform`}>
                            <tool.icon className="w-8 h-8 mx-auto mb-2 text-hub-orange" />
                            <div className="font-medium text-sm">{tool.title}</div>
                            <div className="text-xs text-workspace-muted mt-1">{tool.desc}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* =====================================================
          أخبار وعروض
          ===================================================== */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-hub-orange" />
                        أخبار وعروض
                    </h2>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card flex gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-workspace-primary to-workspace-secondary flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">عرض خاص {i}</h3>
                                <p className="text-sm text-workspace-muted line-clamp-2">
                                    استفد من عروضنا المميزة واحجز مكانك الآن
                                </p>
                                <Link href="#" className="text-hub-orange text-sm mt-2 inline-block">
                                    اعرف أكثر
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
