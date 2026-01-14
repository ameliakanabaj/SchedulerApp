-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "schedule_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_must_be_reset" BOOLEAN NOT NULL DEFAULT true;