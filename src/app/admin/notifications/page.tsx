// =====================================================
// The Hub - Notifications Page (الإشعارات)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, Users, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/database';

export default function NotificationsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [actionUrl, setActionUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        supabase.from('users').select('*').eq('role', 'user').then(({ data }) => setUsers(data || []));
    }, []);

    useEffect(() => {
        if (selectAll) setSelectedUsers(users.map(u => u.id));
        else setSelectedUsers([]);
    }, [selectAll, users]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (selectedUsers.length === 0) { alert('اختر عملاء أولاً'); return; }
        setLoading(true);

        // حفظ الإشعارات في قاعدة البيانات
        const notifications = selectedUsers.map(userId => ({ user_id: userId, title, body, action_url: actionUrl || null, type: 'general' }));
        await supabase.from('notifications').insert(notifications);

        // TODO: إرسال Push Notifications

        setLoading(false);
        setSent(true);
        setTimeout(() => { setSent(false); setTitle(''); setBody(''); setActionUrl(''); setSelectedUsers([]); setSelectAll(false); }, 2000);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">إرسال إشعارات</h1>

            <form onSubmit={handleSend} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5" />اختر العملاء</h3>
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4 cursor-pointer">
                        <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} className="w-5 h-5" />
                        <span className="font-medium">تحديد الكل ({users.length})</span>
                    </label>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {users.map(user => (
                            <label key={user.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer">
                                <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={e => {
                                    if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]);
                                    else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }} className="w-5 h-5" />
                                <span>{user.name}</span>
                                <span className="text-sm text-workspace-muted">{user.phone}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-workspace-muted">تم اختيار {selectedUsers.length} عميل</div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />محتوى الإشعار</h3>
                    <div className="space-y-4">
                        <div><label className="block text-sm mb-2">العنوان</label><input required value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="عنوان الإشعار" /></div>
                        <div><label className="block text-sm mb-2">المحتوى</label><textarea required value={body} onChange={e => setBody(e.target.value)} className="input" rows={4} placeholder="نص الإشعار" /></div>
                        <div><label className="block text-sm mb-2">رابط (اختياري)</label><input type="url" value={actionUrl} onChange={e => setActionUrl(e.target.value)} className="input" placeholder="https://..." /></div>
                    </div>
                    <button type="submit" disabled={loading || sent} className={`btn w-full mt-6 ${sent ? 'bg-green-500' : 'btn-primary'}`}>
                        {sent ? <><Check className="w-5 h-5" />تم الإرسال</> : loading ? '...' : <><Send className="w-5 h-5" />إرسال</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
