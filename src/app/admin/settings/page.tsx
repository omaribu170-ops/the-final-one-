// =====================================================
// The Hub - Settings Page (الإعدادات - سوبر أدمن فقط)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Palette, Image, Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    async function fetchSettings() {
        const { data } = await supabase.from('settings').select('*');
        const obj: Record<string, string> = {};
        data?.forEach(s => { obj[s.key] = s.value; });
        setSettings(obj);
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
        for (const update of updates) {
            await supabase.from('settings').upsert(update, { onConflict: 'key' });
        }
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    if (loading) return <div className="text-center py-16">جاري التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">الإعدادات</h1>
                <button onClick={handleSave} disabled={saving || saved} className={`btn ${saved ? 'bg-green-500' : 'btn-primary'}`}>
                    {saved ? <><Check className="w-5 h-5" />تم الحفظ</> : saving ? '...' : <><Save className="w-5 h-5" />حفظ</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* اللوجو والصور */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Image className="w-5 h-5" />اللوجو والصور</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">لوجو الداشبورد</label>
                            <input value={settings.logo_url || ''} onChange={e => setSettings({ ...settings, logo_url: e.target.value })} className="input" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">لوجو PWA</label>
                            <input value={settings.pwa_logo_url || ''} onChange={e => setSettings({ ...settings, pwa_logo_url: e.target.value })} className="input" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">Favicon</label>
                            <input value={settings.favicon_url || ''} onChange={e => setSettings({ ...settings, favicon_url: e.target.value })} className="input" placeholder="https://..." />
                        </div>
                    </div>
                </div>

                {/* الألوان */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Palette className="w-5 h-5" />الألوان</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">اللون الأساسي</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.theme_primary_color || '#E63E32'} onChange={e => setSettings({ ...settings, theme_primary_color: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer" />
                                <input value={settings.theme_primary_color || '#E63E32'} onChange={e => setSettings({ ...settings, theme_primary_color: e.target.value })} className="input flex-1" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">اللون الثانوي</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.theme_secondary_color || '#F18A21'} onChange={e => setSettings({ ...settings, theme_secondary_color: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer" />
                                <input value={settings.theme_secondary_color || '#F18A21'} onChange={e => setSettings({ ...settings, theme_secondary_color: e.target.value })} className="input flex-1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ساعات العمل */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5" />ساعات العمل</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">ساعات العمل</label>
                            <input value={settings.opening_hours || ''} onChange={e => setSettings({ ...settings, opening_hours: e.target.value })} className="input" placeholder="10:00-22:00" />
                        </div>
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">أيام العمل</label>
                            <input value={settings.working_days || ''} onChange={e => setSettings({ ...settings, working_days: e.target.value })} className="input" placeholder="يومياً" />
                        </div>
                    </div>
                </div>

                {/* Popup للـ PWA */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />Popup للـ PWA</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">صورة Popup</label>
                            <input value={settings.popup_image_url || ''} onChange={e => setSettings({ ...settings, popup_image_url: e.target.value })} className="input" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm text-workspace-muted mb-2">رابط "اعرف أكثر"</label>
                            <input value={settings.popup_link_url || ''} onChange={e => setSettings({ ...settings, popup_link_url: e.target.value })} className="input" placeholder="https://..." />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={settings.popup_enabled === 'true'} onChange={e => setSettings({ ...settings, popup_enabled: e.target.checked ? 'true' : 'false' })} className="w-5 h-5" />
                            <span>تفعيل Popup</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
