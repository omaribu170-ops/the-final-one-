// =====================================================
// The Hub - Tasks Page (المهام)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { ListTodo, Plus, X, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, translateTaskStatus, translateTaskPriority } from '@/lib/utils';
import type { Task, User } from '@/types/database';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        const { data: tasksData } = await supabase.from('tasks').select('*, assignees:task_assignees(*, user:users(*))').order('created_at', { ascending: false });
        const { data: empData } = await supabase.from('users').select('*').in('role', ['staff', 'admin']);
        setTasks(tasksData || []);
        setEmployees(empData || []);
        setLoading(false);
    }

    async function updateStatus(id: string, status: string) {
        await supabase.from('tasks').update({ status }).eq('id', id);
        fetchData();
    }

    const statusColors: Record<string, string> = { pending: 'badge-info', in_progress: 'badge-warning', completed: 'badge-success', overdue: 'badge-danger' };
    const priorityColors: Record<string, string> = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">المهام</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus className="w-5 h-5" />مهمة جديدة</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                    <div key={task.id} className="card">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold">{task.title}</h3>
                            <span className={`badge ${statusColors[task.status]}`}>{translateTaskStatus(task.status)}</span>
                        </div>
                        {task.description && <p className="text-sm text-workspace-muted mb-3">{task.description}</p>}
                        <div className="flex items-center gap-2 text-sm text-workspace-muted mb-3">
                            <AlertCircle className={`w-4 h-4 ${priorityColors[task.priority]}`} />
                            <span>{translateTaskPriority(task.priority)}</span>
                            {task.deadline && <><Clock className="w-4 h-4 mr-2" /><span>{formatDate(task.deadline)}</span></>}
                        </div>
                        {task.status !== 'completed' && (
                            <button onClick={() => updateStatus(task.id, 'completed')} className="btn btn-secondary w-full text-sm"><Check className="w-4 h-4" />تم الإنجاز</button>
                        )}
                    </div>
                ))}
            </div>

            {showModal && <TaskModal employees={employees} onClose={() => setShowModal(false)} onSave={() => { fetchData(); setShowModal(false); }} />}
        </div>
    );
}

function TaskModal({ employees, onClose, onSave }: { employees: User[]; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '', assignees: [] as string[] });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const { data: task } = await supabase.from('tasks').insert([{ title: form.title, description: form.description, priority: form.priority, deadline: form.deadline || null }]).select().single();
        if (task && form.assignees.length > 0) {
            await supabase.from('task_assignees').insert(form.assignees.map(id => ({ task_id: task.id, user_id: id })));
        }
        onSave();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="text-xl font-bold">مهمة جديدة</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div><label className="block text-sm mb-2">العنوان</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" /></div>
                        <div><label className="block text-sm mb-2">التفاصيل</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={2} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm mb-2">الأولوية</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input"><option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option></select></div>
                            <div><label className="block text-sm mb-2">الموعد النهائي</label><input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input" /></div>
                        </div>
                        <div><label className="block text-sm mb-2">تكليف لـ</label>
                            <div className="max-h-32 overflow-y-auto border border-white/10 rounded-xl p-2">
                                {employees.map(emp => (
                                    <label key={emp.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white/5 rounded-lg">
                                        <input type="checkbox" checked={form.assignees.includes(emp.id)} onChange={e => setForm({ ...form, assignees: e.target.checked ? [...form.assignees, emp.id] : form.assignees.filter(id => id !== emp.id) })} className="w-4 h-4" />
                                        <span>{emp.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'إضافة'}</button></div>
                </form>
            </div>
        </div>
    );
}
