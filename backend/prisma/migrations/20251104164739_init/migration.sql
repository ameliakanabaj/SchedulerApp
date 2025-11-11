-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('GLOBAL_ADMIN', 'ORG_ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Organization" (
    "organization_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'EMPLOYEE',
    "position" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
    "user_organization_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("user_organization_id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "shift_id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "place" VARCHAR(255),

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "availability_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "comments" VARCHAR(500),
    "status" VARCHAR(50),

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availability_id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignment_id" SERIAL NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_on_shift" VARCHAR(255),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_uo_user_id" ON "UserOrganization"("user_id");

-- CreateIndex
CREATE INDEX "idx_uo_organization_id" ON "UserOrganization"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_org" ON "UserOrganization"("user_id", "organization_id");

-- CreateIndex
CREATE INDEX "idx_availability_user_id" ON "Availability"("user_id");

-- CreateIndex
CREATE INDEX "idx_assignment_shift_id" ON "Assignment"("shift_id");

-- CreateIndex
CREATE INDEX "idx_assignment_user_id" ON "Assignment"("user_id");

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("shift_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
