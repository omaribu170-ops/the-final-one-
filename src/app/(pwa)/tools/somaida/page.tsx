// =====================================================
// The Hub - صميدة AI
// مساعد ذكي باللهجة الصعيدية
// =====================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `أنت صميدة، مساعد ذكي صعيدي من صعيد مصر. اتكلم باللهجة الصعيدية المصرية. كن ودود ومرح وساعد المستخدم في أي حاجة يسألها. استخدم كلمات زي "يا معلم"، "دلوكيتي"، "إيه الجمال ده"، "تحت أمرك".`;

export default function SomaidaPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                }),
            });

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message?.content || 'معلش يا معلم، حصل مشكلة. جرب تاني.';
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'معلش يا معلم، النت فصل أو حاجة. جرب تاني بعدين.' }]);
        } finally {
            setLoading(false);
        }
    }

    function clearChat() {
        setMessages([]);
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* الهيدر */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">👳</div>
                    <div>
                        <h1 className="font-bold">صميدة AI</h1>
                        <p className="text-sm text-workspace-muted">مساعدك الصعيدي</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button onClick={clearChat} className="p-2 rounded-lg hover:bg-white/5 text-red-400">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👳</div>
                        <h2 className="text-xl font-bold mb-2">صميدة يساعدك كيف دلوكيتي؟</h2>
                        <p className="text-workspace-muted">اسألني أي حاجة وأنا تحت أمرك يا معلم</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'gradient-main text-white' : 'bg-white/5'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="p-4 rounded-2xl bg-white/5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-workspace-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-workspace-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-workspace-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* حقل الإدخال */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب رسالتك..." className="input flex-1" disabled={loading} />
                    <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary px-4">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
