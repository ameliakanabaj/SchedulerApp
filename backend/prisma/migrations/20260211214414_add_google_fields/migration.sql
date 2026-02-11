-- AlterTable
ALTER TABLE "User" ADD COLUMN     "google_access_token" TEXT,
ADD COLUMN     "google_calendar_id" TEXT,
ADD COLUMN     "google_refresh_token" TEXT,
ADD COLUMN     "google_token_expiry" TIMESTAMP(3);
