// =====================================================
// The Hub - Helper Utilities
// دوال مساعدة للمشروع
// =====================================================

import { type ClassValue, clsx } from 'clsx';

// =====================================================
// دمج الـ Classes
// =====================================================
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

// =====================================================
// تنسيق الأرقام بالعربي
// =====================================================
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-EG').format(num);
}

// =====================================================
// تنسيق المبالغ المالية
// =====================================================
export function formatCurrency(amount: number): string {
    return `${formatNumber(amount)} ج.م`;
}

// =====================================================
// تنسيق التاريخ بالعربي
// =====================================================
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

// =====================================================
// تنسيق الوقت
// =====================================================
export function formatTime(time: string | Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(time));
}

// =====================================================
// تنسيق التاريخ والوقت معاً
// =====================================================
export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

// =====================================================
// حساب الفرق بالساعات
// =====================================================
export function calculateHours(startTime: string | Date, endTime?: string | Date): number {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.ceil(diffHours * 100) / 100; // تقريب لأقرب 0.01
}

// =====================================================
// تنسيق المدة
// =====================================================
export function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) {
        return `${m} دقيقة`;
    } else if (m === 0) {
        return `${h} ساعة`;
    } else {
        return `${h} ساعة و ${m} دقيقة`;
    }
}

// =====================================================
// توليد كود عشوائي
// =====================================================
export function generateCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// =====================================================
// توليد OTP
// =====================================================
export function generateOTP(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// =====================================================
// التحقق من الإيميل
// =====================================================
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =====================================================
// التحقق من رقم الموبايل المصري
// =====================================================
export function isValidEgyptianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(01)[0125][0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
}

// Alias for isValidEgyptianPhone
export const isValidPhone = isValidEgyptianPhone;

// =====================================================
// تنسيق رقم الموبايل
// =====================================================
export function formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length === 11) {
        return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
    }
    return phone;
}

// =====================================================
// الحصول على أول حرف من الاسم
// =====================================================
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// =====================================================
// الحصول على الاسم الأول
// =====================================================
export function getFirstName(name: string): string {
    return name.split(' ')[0];
}

// =====================================================
// التأخير (Promise)
// =====================================================
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// =====================================================
// نسخ للكليبورد
// =====================================================
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

// =====================================================
// تصدير CSV
// =====================================================
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    // Handle strings with commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(',')
        ),
    ].join('\n');

    // Add BOM for Excel Arabic support
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// =====================================================
// تحويل التاريخ للـ Input
// =====================================================
export function dateToInputValue(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// =====================================================
// تحويل الوقت للـ Input
// =====================================================
export function timeToInputValue(time: Date | string): string {
    const d = new Date(time);
    return d.toTimeString().slice(0, 5);
}

// =====================================================
// الحصول على بداية اليوم
// =====================================================
export function getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// =====================================================
// الحصول على نهاية اليوم
// =====================================================
export function getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// =====================================================
// الحصول على بداية الشهر
// =====================================================
export function getStartOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

// =====================================================
// الحصول على نهاية الشهر
// =====================================================
export function getEndOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
}

// =====================================================
// ترجمة حالة الجلسة
// =====================================================
export function translateSessionStatus(status: string): string {
    const translations: Record<string, string> = {
        active: 'نشطة',
        pending_payment: 'في انتظار الدفع',
        closed: 'مغلقة',
    };
    return translations[status] || status;
}

// =====================================================
// ترجمة طريقة الدفع
// =====================================================
export function translatePaymentMethod(method: string): string {
    const translations: Record<string, string> = {
        cash: 'كاش',
        visa: 'فيزا',
        wallet: 'محفظة',
    };
    return translations[method] || method;
}

// =====================================================
// ترجمة نوع المنتج
// =====================================================
export function translateProductType(type: string): string {
    const translations: Record<string, string> = {
        food: 'أكل',
        drink: 'مشروبات',
        supply: 'مستلزمات',
        equipment: 'معدات',
    };
    return translations[type] || type;
}

// =====================================================
// ترجمة نوع الطلب
// =====================================================
export function translateRequestType(type: string): string {
    const translations: Record<string, string> = {
        supply: 'مستلزمات نظافة',
        maintenance: 'صيانة',
        food: 'أكل',
        drink: 'مشروبات',
        other: 'أخرى',
    };
    return translations[type] || type;
}

// =====================================================
// ترجمة حالة المهمة
// =====================================================
export function translateTaskStatus(status: string): string {
    const translations: Record<string, string> = {
        pending: 'في الانتظار',
        in_progress: 'جاري التنفيذ',
        completed: 'منجزة',
        overdue: 'متأخرة',
    };
    return translations[status] || status;
}

// =====================================================
// ترجمة أولوية المهمة
// =====================================================
export function translateTaskPriority(priority: string): string {
    const translations: Record<string, string> = {
        low: 'منخفضة',
        medium: 'متوسطة',
        high: 'عالية',
    };
    return translations[priority] || priority;
}

// =====================================================
// ترجمة الوردية
// =====================================================
export function translateShift(shift: string): string {
    const translations: Record<string, string> = {
        morning: 'صباحية',
        evening: 'مسائية',
        night: 'ليلية',
        full: 'كاملة',
    };
    return translations[shift] || shift;
}

// =====================================================
// ترجمة منطقة النظافة
// =====================================================
export function translateCleaningArea(area: string): string {
    const translations: Record<string, string> = {
        bathroom: 'الحمامات',
        hall: 'القاعات',
        kitchen: 'المطبخ',
        entrance: 'المدخل',
    };
    return translations[area] || area;
}
