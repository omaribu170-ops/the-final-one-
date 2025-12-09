// =====================================================
// The Hub - Notes App
// تطبيق الملاحظات
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pin, Trash2, Edit2, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import type { Note } from '@/types/database';

const COLORS = ['#ffffff', '#fff59d', '#a5d6a7', '#90caf9', '#f48fb1', '#ffcc80'];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<Note | null>(null);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => { fetchNotes(); }, []);

    async function fetchNotes() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data } = await supabase.from('notes').select('*').eq('user_id', session.user.id).order('is_pinned', { ascending: false }).order('updated_at', { ascending: false });
            setNotes(data || []);
        }
        setLoading(false);
    }

    async function handleSave(note: Partial<Note>) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        if (note.id) {
            await supabase.from('notes').update({ title: note.title, content: note.content, color: note.color }).eq('id', note.id);
        } else {
            await supabase.from('notes').insert([{ ...note, user_id: session.user.id }]);
        }
        fetchNotes();
        setEditing(null);
        setShowNew(false);
    }

    async function handleDelete(id: string) {
        await supabase.from('notes').delete().eq('id', id);
        fetchNotes();
    }

    async function togglePin(note: Note) {
        await supabase.from('notes').update({ is_pinned: !note.is_pinned }).eq('id', note.id);
        fetchNotes();
    }

    const filtered = notes.filter(n => n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

    if (editing || showNew) {
        return <NoteEditor note={editing} onSave={handleSave} onClose={() => { setEditing(null); setShowNew(false); }} onDelete={editing ? () => { handleDelete(editing.id); setEditing(null); } : undefined} />;
    }

    return (
        <div className="pb-20">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في الملاحظات..." className="input pr-12" />
                </div>
                <button onClick={() => setShowNew(true)} className="btn btn-primary"><Plus className="w-5 h-5" /></button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-workspace-muted">
                    <p className="text-4xl mb-4">📝</p>
                    <p>مفيش ملاحظات</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(note => (
                        <div key={note.id} onClick={() => setEditing(note)} className="p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: note.color || '#ffffff', color: '#222' }}>
                            {note.is_pinned && <Pin className="w-4 h-4 mb-2" />}
                            <h3 className="font-bold text-sm truncate">{note.title || 'بدون عنوان'}</h3>
                            <p className="text-xs opacity-70 line-clamp-3 mt-1">{note.content}</p>
                            <p className="text-xs opacity-50 mt-2">{formatDate(note.updated_at)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function NoteEditor({ note, onSave, onClose, onDelete }: { note: Note | null; onSave: (n: Partial<Note>) => void; onClose: () => void; onDelete?: () => void }) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [color, setColor] = useState(note?.color || '#ffffff');

    return (
        <div className="pb-20">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
                <div className="flex gap-2">
                    {onDelete && <button onClick={onDelete} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 className="w-5 h-5" /></button>}
                    <button onClick={() => onSave({ id: note?.id, title, content, color })} className="btn btn-primary"><Check className="w-5 h-5" />حفظ</button>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                {COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-hub-orange' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
            </div>

            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="العنوان..." className="w-full bg-transparent text-2xl font-bold outline-none mb-4" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="اكتب ملاحظتك هنا..." className="w-full bg-transparent outline-none resize-none min-h-[50vh]" />
        </div>
    );
}
