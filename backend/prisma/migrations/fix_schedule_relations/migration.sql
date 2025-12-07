-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'APPROVED', 'NOT_APPROVED');

-- CreateTable
CREATE TABLE "Schedule" (
    "schedule_id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3) NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "deadline_generate_date" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- Add column to Assignment
ALTER TABLE "Assignment"
ADD COLUMN "schedule_id" INTEGER;

-- CreateIndex
CREATE INDEX "Schedule_organization_id_idx" ON "Schedule"("organization_id");

-- AddForeignKey
ALTER TABLE "Schedule"
ADD CONSTRAINT "Schedule_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "Organization"("organization_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment"
ADD CONSTRAINT "Assignment_schedule_id_fkey"
FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("schedule_id")
ON DELETE RESTRICT ON UPDATE CASCADE;
