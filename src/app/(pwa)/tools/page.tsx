// =====================================================
// The Hub - Tools Page
// صفحة الأدوات
// =====================================================

import Link from 'next/link';
import { Clock, Brain, StickyNote, ArrowLeft } from 'lucide-react';

const tools = [
    { href: '/tools/pomodoro', icon: Clock, title: 'Pomodoro Timer', desc: 'تايمر للتركيز والإنتاجية', color: 'from-red-500/20 to-orange-500/10' },
    { href: '/tools/somaida', icon: Brain, title: 'صميدة AI', desc: 'مساعدك الذكي باللهجة الصعيدية', color: 'from-purple-500/20 to-pink-500/10' },
    { href: '/tools/notes', icon: StickyNote, title: 'الملاحظات', desc: 'دوّن أفكارك ورتبها', color: 'from-yellow-500/20 to-orange-500/10' },
];

export default function ToolsPage() {
    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold">أدواتنا</h1>
            <p className="text-workspace-muted">أدوات مصممة عشان تساعدك تركز وتنجز</p>

            <div className="space-y-4">
                {tools.map((tool) => (
                    <Link key={tool.href} href={tool.href} className={`card flex items-center gap-4 hover:scale-[1.02] transition-transform bg-gradient-to-br ${tool.color}`}>
                        <div className="p-4 rounded-2xl bg-white/10">
                            <tool.icon className="w-8 h-8 text-hub-orange" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{tool.title}</h3>
                            <p className="text-sm text-workspace-muted">{tool.desc}</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-workspace-muted" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
