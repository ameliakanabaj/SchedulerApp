-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_schedule_id_fkey";

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("schedule_id") ON DELETE CASCADE ON UPDATE NO ACTION;
