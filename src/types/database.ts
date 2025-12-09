// =====================================================
// The Hub - Database Types
// أنواع البيانات لقاعدة البيانات
// =====================================================

// =====================================================
// نوع المستخدم
// =====================================================
export type UserRole = 'super_admin' | 'admin' | 'staff' | 'user';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password_hash?: string;
    gender?: 'male' | 'female';
    birth_date?: string;
    role: UserRole;
    wallet_balance: number;
    affiliate_code?: string;
    referred_by?: string;
    nickname?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// =====================================================
// نوع الترابيزة
// =====================================================
export interface Table {
    id: string;
    name: string;
    table_number: number;
    image_url?: string;
    price_per_hour_per_person: number;
    capacity_min: number;
    capacity_max: number;
    is_active: boolean;
    created_at: string;
}

// =====================================================
// نوع المنتج
// =====================================================
export type ProductType = 'food' | 'drink' | 'supply' | 'equipment';

export interface Product {
    id: string;
    name: string;
    name_ar?: string;
    description?: string;
    type: ProductType;
    price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock_alert: number;
    is_for_sale: boolean;
    is_for_internal_use: boolean;
    image_url?: string;
    is_active: boolean;
    created_at: string;
}

// =====================================================
// نوع الجلسة
// =====================================================
export type SessionStatus = 'active' | 'pending_payment' | 'closed';
export type PaymentMethod = 'cash' | 'visa' | 'wallet';

export interface Session {
    id: string;
    table_id: string;
    start_time: string;
    end_time?: string;
    status: SessionStatus;
    table_price: number;
    products_price: number;
    total_price: number;
    payment_method?: PaymentMethod;
    payment_details?: string;
    is_paid: boolean;
    created_by?: string;
    created_at: string;
    // Relations
    table?: Table;
    members?: SessionMember[];
    orders?: SessionOrder[];
}

// =====================================================
// نوع عضو الجلسة
// =====================================================
export interface SessionMember {
    id: string;
    session_id: string;
    user_id?: string;
    guest_name?: string;
    joined_at: string;
    // Relations
    user?: User;
}

// =====================================================
// نوع طلب الجلسة
// =====================================================
export type OrderStatus = 'pending' | 'delivered' | 'cancelled';

export interface SessionOrder {
    id: string;
    session_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    total_price: number;
    ordered_by?: string;
    status: OrderStatus;
    created_at: string;
    // Relations
    product?: Product;
}

// =====================================================
// نوع ليلة الألعاب
// =====================================================
export type GameNightStatus = 'upcoming' | 'ongoing' | 'completed';

export interface GameNight {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    start_time: string;
    end_time?: string;
    entry_fee: number;
    total_prizes_value: number;
    status: GameNightStatus;
    image_url?: string;
    created_by?: string;
    created_at: string;
    // Relations
    tournaments?: Tournament[];
}

// =====================================================
// نوع البطولة
// =====================================================
export interface Tournament {
    id: string;
    game_night_id: string;
    game_name: string;
    prize_first: number;
    prize_second: number;
    prize_third: number;
    status: GameNightStatus;
    created_at: string;
    // Relations
    participants?: TournamentParticipant[];
}

// =====================================================
// نوع المشارك في البطولة
// =====================================================
export interface TournamentParticipant {
    id: string;
    tournament_id: string;
    user_id: string;
    rank?: 1 | 2 | 3;
    prize_won: number;
    registered_at: string;
    // Relations
    user?: User;
}

// =====================================================
// نوع سجل النظافة
// =====================================================
export type CleaningArea = 'bathroom' | 'hall' | 'kitchen' | 'entrance';
export type CleaningStatus = 'checked' | 'missed';

export interface CleaningLog {
    id: string;
    log_date: string;
    time_slot: string;
    area: CleaningArea;
    status: CleaningStatus;
    checked_by?: string;
    checked_at?: string;
    notes?: string;
    created_at: string;
}

// =====================================================
// نوع طلبات المكان
// =====================================================
export type RequestType = 'supply' | 'maintenance' | 'food' | 'drink' | 'other';
export type RequestStatus = 'pending' | 'received' | 'completed';

export interface Request {
    id: string;
    type: RequestType;
    item_name: string;
    description?: string;
    quantity: number;
    estimated_cost: number;
    status: RequestStatus;
    requested_by?: string;
    approved_by?: string;
    created_at: string;
    updated_at: string;
}

// =====================================================
// نوع المصروفات
// =====================================================
export type ExpenseCategory = 'rent' | 'utilities' | 'salary' | 'supplies' | 'maintenance' | 'other';

export interface Expense {
    id: string;
    title: string;
    description?: string;
    amount: number;
    category: ExpenseCategory;
    expense_date: string;
    receipt_url?: string;
    added_by?: string;
    created_at: string;
}

// =====================================================
// نوع الموظف
// =====================================================
export type ShiftType = 'morning' | 'evening' | 'night' | 'full';

export interface Employee {
    id: string;
    user_id: string;
    national_id?: string;
    national_id_image_url?: string;
    address?: string;
    emergency_contact?: string;
    salary: number;
    shift: ShiftType;
    hire_date: string;
    is_active: boolean;
    created_at: string;
    // Relations
    user?: User;
}

// =====================================================
// نوع المهمة
// =====================================================
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    deadline?: string;
    status: TaskStatus;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Relations
    assignees?: TaskAssignee[];
}

export interface TaskAssignee {
    id: string;
    task_id: string;
    user_id: string;
    completed_at?: string;
    // Relations
    user?: User;
}

// =====================================================
// نوع الحجز
// =====================================================
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    user_id: string;
    booking_date: string;
    start_time: string;
    end_time?: string;
    people_count: number;
    deposit_amount: number;
    table_id?: string;
    status: BookingStatus;
    payment_reference?: string;
    notes?: string;
    created_at: string;
    // Relations
    user?: User;
    table?: Table;
}

// =====================================================
// نوع أرباح المسوقين
// =====================================================
export type AffiliateEarningStatus = 'pending' | 'paid';

export interface AffiliateEarning {
    id: string;
    affiliate_id: string;
    referred_user_id: string;
    session_id: string;
    amount: number;
    percentage: number;
    status: AffiliateEarningStatus;
    created_at: string;
}

// =====================================================
// نوع معاملات المحفظة
// =====================================================
export type WalletTransactionType = 'deposit' | 'withdrawal' | 'session_payment' | 'affiliate_earning' | 'refund';

export interface WalletTransaction {
    id: string;
    user_id: string;
    type: WalletTransactionType;
    amount: number;
    balance_after: number;
    reference_id?: string;
    payment_method?: string;
    payment_reference?: string;
    description?: string;
    created_at: string;
}

// =====================================================
// نوع الإشعار
// =====================================================
export type NotificationType = 'general' | 'booking' | 'session' | 'task' | 'promo' | 'reminder';

export interface Notification {
    id: string;
    user_id?: string;
    title: string;
    body: string;
    type: NotificationType;
    is_read: boolean;
    action_url?: string;
    created_at: string;
}

// =====================================================
// نوع محادثة صميدة
// =====================================================
export interface AIConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    // Relations
    messages?: AIMessage[];
}

export interface AIMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    tokens_used: number;
    created_at: string;
}

// =====================================================
// نوع الملاحظات
// =====================================================
export interface Note {
    id: string;
    user_id: string;
    title: string;
    content?: string;
    is_pinned: boolean;
    color: string;
    folder_id?: string;
    created_at: string;
    updated_at: string;
}

export interface NoteFolder {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

// =====================================================
// نوع البانرات
// =====================================================
export interface Banner {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    display_order: number;
    created_at: string;
}

// =====================================================
// نوع الإعدادات
// =====================================================
export interface Settings {
    id: string;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
}

// =====================================================
// نوع اشتراكات Push
// =====================================================
export interface PushSubscription {
    id: string;
    user_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    created_at: string;
}
