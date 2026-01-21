export interface NotificationModel {
    notification_id: number;
    user_id: number;
    schedule_id: number;
    type: 'SCHEDULE_GENERATED' | 'AVAILABILITY_OPEN' | 'MISSING_AVAILABILITY' | 'REMINDER_24H';
    status: 'PENDING' | 'SENT' | 'FAILED';
    message: string;
    created_at: string;
    sent_at?: string;
    is_read: boolean;
}
