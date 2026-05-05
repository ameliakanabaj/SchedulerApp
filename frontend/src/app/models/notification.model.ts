export interface NotificationModel {
    notification_id: number;
    user_id: number;
    schedule_id: number | null;
    type: 'SCHEDULE_GENERATED' | 'AVAILABILITY_OPEN' | 'MISSING_AVAILABILITY' | 'REMINDER_24H' | 'SCHEDULE_DELETED' | 'SCHEDULE_ERROR';
    status: 'PENDING' | 'SENT' | 'FAILED';
    message: string;
    created_at: string;
    sent_at?: string;
    is_read: boolean;
}
