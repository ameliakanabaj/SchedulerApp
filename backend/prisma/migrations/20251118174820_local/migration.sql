/*
  Warnings:

  - You are about to drop the column `date` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Shift` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shift_id,user_id]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `start_time` on the `Availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `Availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `organization_id` on table `Shift` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `start_time` on the `Shift` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `Shift` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_shift_id_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organization_id_fkey";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "date",
DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "date",
ADD COLUMN     "place" VARCHAR(255),
ADD COLUMN     "required_people" INTEGER,
ALTER COLUMN "organization_id" SET NOT NULL,
DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_assignment_shift_id" ON "Assignment"("shift_id");

-- CreateIndex
CREATE INDEX "idx_assignment_user_id" ON "Assignment"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_shift_user" ON "Assignment"("shift_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_availability_user_id" ON "Availability"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("shift_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
