// =====================================================
// The Hub - Members Management Page
// صفحة إدارة الأعضاء
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    X,
    Search,
    Download,
    Eye,
    Phone,
    Mail,
    Calendar,
    Clock,
    Wallet,
    Gamepad2,
    ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDate, formatPhone, exportToCSV, getInitials } from '@/lib/utils';
import type { User } from '@/types/database';

// =====================================================
// الصفحة الرئيسية
// =====================================================
export default function MembersPage() {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [viewingMember, setViewingMember] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // =====================================================
    // جلب الأعضاء
    // =====================================================
    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'user')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // حذف عضو
    // =====================================================
    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد إنك عايز تحذف العضو ده؟')) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMembers(members.filter((m) => m.id !== id));
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('حصل مشكلة في حذف العضو');
        }
    }

    // =====================================================
    // تصدير CSV
    // =====================================================
    function handleExport() {
        const data = members.map((m) => ({
            'الاسم': m.name,
            'الإيميل': m.email,
            'رقم التليفون': m.phone || '-',
            'النوع': m.gender === 'male' ? 'ذكر' : m.gender === 'female' ? 'أنثى' : '-',
            'الرصيد': m.wallet_balance,
            'كود التسويق': m.affiliate_code || '-',
            'تاريخ التسجيل': formatDate(m.created_at),
        }));
        exportToCSV(data, 'members');
    }

    // =====================================================
    // فلترة الأعضاء
    // =====================================================
    const filteredMembers = members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.phone && member.phone.includes(searchQuery))
    );

    // =====================================================
    // عرض البروفايل
    // =====================================================
    if (viewingMember) {
        return (
            <MemberProfile
                member={viewingMember}
                onBack={() => setViewingMember(null)}
                onEdit={() => {
                    setEditingMember(viewingMember);
                    setViewingMember(null);
                    setShowModal(true);
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* =====================================================
          الهيدر
          ===================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">الأعضاء</h1>
                    <p className="text-workspace-muted">{members.length} عضو مسجل</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleExport} className="btn btn-secondary">
                        <Download className="w-5 h-5" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingMember(null);
                            setShowModal(true);
                        }}
                        className="btn btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة عضو
                    </button>
                </div>
            </div>

            {/* =====================================================
          البحث
          ===================================================== */}
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-workspace-muted" />
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو الإيميل أو رقم التليفون..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pr-12"
                />
            </div>

            {/* =====================================================
          جدول الأعضاء
          ===================================================== */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>العضو</th>
                            <th>التليفون</th>
                            <th>الرصيد</th>
                            <th>آخر زيارة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={5}>
                                        <div className="h-12 bg-white/5 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-workspace-muted">
                                    {searchQuery ? 'مفيش نتائج للبحث ده' : 'مفيش أعضاء مسجلين'}
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr
                                    key={member.id}
                                    className="cursor-pointer"
                                    onClick={() => setViewingMember(member)}
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full gradient-main flex items-center justify-center font-bold text-sm">
                                                {getInitials(member.name)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-sm text-workspace-muted">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{member.phone ? formatPhone(member.phone) : '-'}</td>
                                    <td>
                                        <span className="font-medium text-hub-orange">
                                            {formatCurrency(member.wallet_balance)}
                                        </span>
                                    </td>
                                    <td className="text-workspace-muted">
                                        {formatDate(member.updated_at)}
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setViewingMember(member)}
                                                className="p-2 rounded-lg hover:bg-white/5"
                                                aria-label="عرض"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingMember(member);
                                                    setShowModal(true);
                                                }}
                                                className="p-2 rounded-lg hover:bg-white/5"
                                                aria-label="تعديل"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                                                aria-label="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
          Modal إضافة/تعديل عضو
          ===================================================== */}
            {showModal && (
                <MemberModal
                    member={editingMember}
                    onClose={() => {
                        setShowModal(false);
                        setEditingMember(null);
                    }}
                    onSave={() => {
                        fetchMembers();
                        setShowModal(false);
                        setEditingMember(null);
                    }}
                />
            )}
        </div>
    );
}

// =====================================================
// بروفايل العضو
// =====================================================
function MemberProfile({
    member,
    onBack,
    onEdit,
}: {
    member: User;
    onBack: () => void;
    onEdit: () => void;
}) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalHours: 0,
        totalSpent: 0,
        totalSessions: 0,
        gameNightsAttended: 0,
        gameNightsWon: 0,
    });

    useEffect(() => {
        fetchMemberData();
    }, [member.id]);

    async function fetchMemberData() {
        // جلب آخر 10 جلسات
        const { data: sessionsData } = await supabase
            .from('session_members')
            .select(`
        *,
        session:sessions(*)
      `)
            .eq('user_id', member.id)
            .order('joined_at', { ascending: false })
            .limit(10);

        if (sessionsData) {
            setSessions(sessionsData);
        }

        // حساب الإحصائيات
        // TODO: حساب الإحصائيات الفعلية من قاعدة البيانات
    }

    return (
        <div className="space-y-6">
            {/* الهيدر */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">بروفايل العضو</h1>
            </div>

            {/* معلومات العضو الأساسية */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-20 h-20 rounded-full gradient-main flex items-center justify-center text-2xl font-bold">
                        {getInitials(member.name)}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
                        <div className="flex flex-wrap gap-4 text-workspace-muted">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{member.email}</span>
                            </div>
                            {member.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{formatPhone(member.phone)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>عضو منذ {formatDate(member.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={onEdit} className="btn btn-secondary">
                        <Edit2 className="w-5 h-5" />
                        تعديل
                    </button>
                </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-hub-orange" />
                    <div className="text-2xl font-bold">{stats.totalHours}</div>
                    <div className="text-sm text-workspace-muted">ساعة عندنا</div>
                </div>
                <div className="card text-center">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
                    <div className="text-sm text-workspace-muted">إجمالي الدفع</div>
                </div>
                <div className="card text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <div className="text-sm text-workspace-muted">جلسة</div>
                </div>
                <div className="card text-center">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold">{stats.gameNightsWon}/{stats.gameNightsAttended}</div>
                    <div className="text-sm text-workspace-muted">فوز/مشاركة</div>
                </div>
            </div>

            {/* الرصيد */}
            <div className="card gradient-border">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-workspace-muted mb-1">الرصيد الحالي</div>
                        <div className="text-3xl font-bold gradient-text">
                            {formatCurrency(member.wallet_balance)}
                        </div>
                    </div>
                    <button className="btn btn-primary">
                        <Plus className="w-5 h-5" />
                        إضافة رصيد
                    </button>
                </div>
            </div>

            {/* آخر الجلسات */}
            <div className="card">
                <h3 className="font-bold text-lg mb-4">آخر 10 زيارات</h3>
                {sessions.length === 0 ? (
                    <p className="text-center py-8 text-workspace-muted">
                        مفيش زيارات سابقة
                    </p>
                ) : (
                    <div className="divide-y divide-white/8">
                        {sessions.map((s) => (
                            <div key={s.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        {s.session?.table?.name || 'جلسة'}
                                    </div>
                                    <div className="text-sm text-workspace-muted">
                                        {formatDate(s.joined_at)}
                                    </div>
                                </div>
                                <div className="text-hub-orange font-bold">
                                    {formatCurrency(s.session?.total_price || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* الاسم المستعار - Entertainment Hub */}
            {member.nickname && (
                <div className="card">
                    <h3 className="font-bold text-lg mb-2">Entertainment Hub</h3>
                    <div className="flex items-center gap-3">
                        <Gamepad2 className="w-6 h-6 text-purple-400" />
                        <span>الاسم المستعار: <strong>{member.nickname}</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// Modal إضافة/تعديل عضو
// =====================================================
function MemberModal({
    member,
    onClose,
    onSave,
}: {
    member: User | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: member?.name || '',
        email: member?.email || '',
        phone: member?.phone || '',
        gender: member?.gender || '',
        nickname: member?.nickname || '',
        wallet_balance: member?.wallet_balance || 0,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                gender: formData.gender || null,
                nickname: formData.nickname || null,
                wallet_balance: Number(formData.wallet_balance),
                role: 'user' as const,
            };

            if (member) {
                const { error } = await supabase
                    .from('users')
                    .update(data)
                    .eq('id', member.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('users')
                    .insert([{ ...data, is_verified: true }]);
                if (error) throw error;
            }

            onSave();
        } catch (error: any) {
            console.error('Error saving member:', error);
            if (error.code === '23505') {
                alert('الإيميل أو رقم التليفون مسجل قبل كدة');
            } else {
                alert('حصل مشكلة في حفظ العضو');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-xl font-bold">
                        {member ? 'تعديل عضو' : 'إضافة عضو جديد'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">الاسم *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="الاسم الكامل"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">الإيميل *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                placeholder="example@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">رقم التليفون</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input"
                                placeholder="01xxxxxxxxx"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">النوع</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="input"
                            >
                                <option value="">اختر النوع</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">
                                الاسم المستعار (Entertainment Hub)
                            </label>
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                className="input"
                                placeholder="اختياري"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">الرصيد (ج.م)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.wallet_balance}
                                onChange={(e) => setFormData({ ...formData, wallet_balance: Number(e.target.value) })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
                            إلغاء
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading" /> : member ? 'حفظ التعديلات' : 'إضافة العضو'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
