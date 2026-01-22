CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "schedule_id" INTEGER,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "message" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");
CREATE INDEX "Notification_schedule_id_idx" ON "Notification"("schedule_id");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("user_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_schedule_id_fkey"
FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("schedule_id")
ON DELETE CASCADE ON UPDATE CASCADE;

